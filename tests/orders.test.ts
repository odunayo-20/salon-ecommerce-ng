import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSession = {
  user: { id: "user-1", name: "Test User", email: "test@example.com" },
};

const mockCustomerProfile = {
  id: "cp-1",
  userId: "user-1",
};

const mockProduct = {
  id: "prod-1",
  name: "Premium Shampoo",
  stock: 20,
  lowStock: 5,
  isActive: true,
};

const mockPrisma = {
  customerProfile: { findUnique: vi.fn() },
  product: { findUnique: vi.fn(), update: vi.fn() },
  order: { findFirst: vi.fn(), create: vi.fn(), update: vi.fn(), findMany: vi.fn() },
  payment: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), updateMany: vi.fn() },
  stockMovement: { create: vi.fn() },
  coupon: { findUnique: vi.fn(), update: vi.fn() },
  loyaltyPoint: { aggregate: vi.fn(), create: vi.fn() },
  membership: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
  $transaction: vi.fn(),
  $queryRaw: vi.fn(),
};

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));
vi.mock("@/lib/auth", () => ({
  auth: vi.fn().mockResolvedValue(mockSession),
}));
vi.mock("@/lib/notifications", () => ({
  notify: vi.fn().mockResolvedValue(undefined),
  notifyAdmins: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@/lib/inventory", () => ({
  checkAndNotifyLowStock: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@/utils/helpers", () => ({
  generateOrderNumber: vi.fn().mockReturnValue("MB-TEST-001"),
}));

describe("Orders POST /api/orders", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockPrisma.customerProfile.findUnique.mockResolvedValue(mockCustomerProfile);
    mockPrisma.product.findUnique.mockResolvedValue(mockProduct);
    mockPrisma.order.findFirst.mockResolvedValue(null);
    mockPrisma.coupon.findUnique.mockResolvedValue(null);
    mockPrisma.loyaltyPoint.aggregate.mockResolvedValue({ _sum: { points: 0 } });
    mockPrisma.$queryRaw.mockResolvedValue([{ id: "prod-1", stock: 20, name: "Premium Shampoo" }]);

    // $transaction: pass through the actual data that the handler puts into order.create
    mockPrisma.$transaction.mockImplementation(async (fn: (tx: Record<string, unknown>) => Promise<unknown>) => {
      const txOrderCreate = vi.fn().mockImplementation(({ data }: { data: Record<string, unknown> }) => {
        return Promise.resolve({
          id: "order-1",
          orderNumber: "MB-TEST-001",
          status: "PENDING",
          pointsRedeemed: 0,
          items: [],
          ...data,
        });
      });
      const txPaymentCreate = vi.fn().mockImplementation(({ data }: { data: Record<string, unknown> }) => {
        return Promise.resolve({ id: "pay-1", reference: "PAY-ref123", ...data });
      });
      return fn({
        product: {
          findUnique: vi.fn().mockResolvedValue({ id: "prod-1", stock: 20, name: "Premium Shampoo" }),
          update: vi.fn().mockResolvedValue({}),
        },
        order: { create: txOrderCreate },
        stockMovement: { create: vi.fn().mockResolvedValue({}) },
        payment: { create: txPaymentCreate },
        $queryRaw: vi.fn().mockResolvedValue([{ id: "prod-1", stock: 20, name: "Premium Shampoo" }]),
      } as never);
    });

    mockPrisma.payment.create.mockImplementation(({ data }: { data: Record<string, unknown> }) =>
      Promise.resolve({ id: "pay-1", reference: "PAY-ref123", ...data })
    );
  });

  async function callOrdersPost(body: Record<string, unknown>) {
    const { POST } = await import("@/app/api/orders/route");
    const request = new Request("http://localhost:3000/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return POST(request as never);
  }

  it("returns 401 when not authenticated", async () => {
    const { auth } = await import("@/lib/auth");
    (auth as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);

    const { POST } = await import("@/app/api/orders/route");
    const request = new Request("http://localhost:3000/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const response = await POST(request as never);
    expect(response.status).toBe(401);
  });

  it("returns 400 on invalid data (empty items)", async () => {
    const response = await callOrdersPost({
      items: [],
      shippingAddress: "123 Test St",
      paymentMethod: "card",
    });
    expect(response.status).toBe(400);
  });

  it("returns 400 on missing shipping address", async () => {
    const response = await callOrdersPost({
      items: [{ productId: "prod-1", name: "Shampoo", price: 10000, quantity: 1 }],
      shippingAddress: "",
      paymentMethod: "card",
    });
    expect(response.status).toBe(400);
  });

  it("returns 400 on invalid payment method", async () => {
    const response = await callOrdersPost({
      items: [{ productId: "prod-1", name: "Shampoo", price: 10000, quantity: 1 }],
      shippingAddress: "123 Test St",
      paymentMethod: "bitcoin",
    });
    expect(response.status).toBe(400);
  });

  it("creates order successfully with valid data", async () => {
    const response = await callOrdersPost({
      items: [{ productId: "prod-1", name: "Shampoo", price: 10000, quantity: 1 }],
      shippingAddress: "123 Test St",
      paymentMethod: "card",
    });

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.order).toBeDefined();
    expect(data.payment).toBeDefined();
    expect(data.resumed).toBeUndefined();
  });

  it("returns resumed:true for duplicate order (idempotency)", async () => {
    mockPrisma.order.findFirst.mockResolvedValue({
      id: "order-existing",
      orderNumber: "MB-EXIST-001",
      status: "PENDING",
      subtotal: 10000,
      shippingCost: 0,
      discount: 0,
      total: 10000,
      pointsRedeemed: 0,
      items: [{ productId: "prod-1", quantity: 1 }],
      payments: [{ id: "pay-existing", reference: "PAY-existing", amount: 10000, method: "PAYSTACK", status: "PENDING" }],
    });

    const response = await callOrdersPost({
      items: [{ productId: "prod-1", name: "Shampoo", price: 10000, quantity: 1 }],
      shippingAddress: "123 Test St",
      paymentMethod: "card",
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.resumed).toBe(true);
    expect(data.order.id).toBe("order-existing");
  });

  it("applies free shipping for orders >= 30000", async () => {
    const response = await callOrdersPost({
      items: [{ productId: "prod-1", name: "Shampoo", price: 30000, quantity: 1 }],
      shippingAddress: "123 Test St",
      paymentMethod: "card",
    });

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.order.shippingCost).toBe(0);
  });

  it("charges shipping for orders < 30000", async () => {
    const response = await callOrdersPost({
      items: [{ productId: "prod-1", name: "Shampoo", price: 5000, quantity: 1 }],
      shippingAddress: "123 Test St",
      paymentMethod: "card",
    });

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.order.shippingCost).toBe(2000);
  });

  it("calculates discount for percentage coupon", async () => {
    mockPrisma.coupon.findUnique.mockResolvedValue({
      id: "c-1",
      code: "SAVE20",
      type: "PERCENTAGE",
      value: 20,
      isActive: true,
      expiresAt: null,
      usageLimit: null,
      usedCount: 0,
      minOrderAmount: null,
      maxDiscountAmount: null,
      appliesTo: "ALL",
      perUserLimit: null,
    });

    const response = await callOrdersPost({
      items: [{ productId: "prod-1", name: "Shampoo", price: 10000, quantity: 1 }],
      shippingAddress: "123 Test St",
      paymentMethod: "card",
      couponCode: "SAVE20",
    });

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.order.discount).toBe(2000);
  });

  it("returns 400 for expired coupon", async () => {
    mockPrisma.coupon.findUnique.mockResolvedValue({
      id: "c-1",
      code: "OLD",
      type: "PERCENTAGE",
      value: 10,
      isActive: true,
      expiresAt: new Date("2020-01-01"),
      usageLimit: null,
      usedCount: 0,
      minOrderAmount: null,
      maxDiscountAmount: null,
      appliesTo: "ALL",
      perUserLimit: null,
    });

    const response = await callOrdersPost({
      items: [{ productId: "prod-1", name: "Shampoo", price: 10000, quantity: 1 }],
      shippingAddress: "123 Test St",
      paymentMethod: "card",
      couponCode: "OLD",
    });

    expect(response.status).toBe(400);
  });

  it("returns 400 for inactive coupon", async () => {
    mockPrisma.coupon.findUnique.mockResolvedValue({
      id: "c-1",
      code: "DEAD",
      type: "PERCENTAGE",
      value: 10,
      isActive: false,
      expiresAt: null,
      usageLimit: null,
      usedCount: 0,
      minOrderAmount: null,
      maxDiscountAmount: null,
      appliesTo: "ALL",
      perUserLimit: null,
    });

    const response = await callOrdersPost({
      items: [{ productId: "prod-1", name: "Shampoo", price: 10000, quantity: 1 }],
      shippingAddress: "123 Test St",
      paymentMethod: "card",
      couponCode: "DEAD",
    });

    expect(response.status).toBe(400);
  });

  it("caps loyalty points redemption at 50% of subtotal", async () => {
    mockPrisma.loyaltyPoint.aggregate.mockImplementation(({ where }: { where: Record<string, string> }) => {
      if (where?.type === "earned") return Promise.resolve({ _sum: { points: 10000 } });
      return Promise.resolve({ _sum: { points: 0 } });
    });

    const response = await callOrdersPost({
      items: [{ productId: "prod-1", name: "Shampoo", price: 10000, quantity: 1 }],
      shippingAddress: "123 Test St",
      paymentMethod: "card",
      pointsRedeemed: 8000,
    });

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.order.discount).toBeGreaterThanOrEqual(5000);
  });
});
