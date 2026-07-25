import { describe, it, expect, vi, beforeEach } from "vitest";

const mockExpiredOrder = {
  id: "order-1",
  orderNumber: "MB-EXPIRED-001",
  status: "PENDING",
  expiresAt: new Date("2024-01-01"),
  items: [{ id: "item-1", productId: "prod-1", quantity: 2, name: "Shampoo" }],
  customerProfile: { user: { id: "user-1", name: "Test User" } },
};

const mockPrisma = {
  order: { findMany: vi.fn() },
  $transaction: vi.fn(),
  $queryRaw: vi.fn(),
};

const mockLogAudit = vi.fn().mockResolvedValue(undefined);

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));
vi.mock("@/lib/audit", () => ({ logAudit: mockLogAudit }));

describe("Cron: Expire Orders", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function callExpireCron(authHeader?: string) {
    const { GET } = await import("@/app/api/cron/expire-orders/route");
    const headers = new Headers();
    if (authHeader) headers.set("authorization", authHeader);
    const request = new Request("http://localhost:3000/api/cron/expire-orders", { headers });
    Object.defineProperty(request, "url", { value: "http://localhost:3000/api/cron/expire-orders" });
    return GET(request as never);
  }

  it("returns 401 without auth header", async () => {
    const response = await callExpireCron();
    expect(response.status).toBe(401);
  });

  it("returns 401 with wrong auth header", async () => {
    const response = await callExpireCron("Bearer wrong-secret");
    expect(response.status).toBe(401);
  });

  it("returns correct count when no expired orders", async () => {
    mockPrisma.order.findMany.mockResolvedValue([]);
    const response = await callExpireCron("Bearer cron-secret");
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.checked).toBe(0);
    expect(data.released).toBe(0);
  });

  it("releases expired order and restores stock", async () => {
    mockPrisma.order.findMany.mockResolvedValue([mockExpiredOrder]);
    const productUpdate = vi.fn().mockResolvedValue({});
    const stockMovementCreate = vi.fn().mockResolvedValue({});
    const orderUpdate = vi.fn().mockResolvedValue({});
    const paymentUpdateMany = vi.fn().mockResolvedValue({});

    mockPrisma.$transaction.mockImplementation(async (fn: (tx: typeof mockPrisma) => Promise<unknown>) => {
      return fn({
        product: {
          findUnique: vi.fn().mockResolvedValue({ stock: 18 }),
          update: productUpdate,
        },
        stockMovement: { create: stockMovementCreate },
        order: { update: orderUpdate },
        payment: { updateMany: paymentUpdateMany },
      } as never);
    });

    const response = await callExpireCron("Bearer cron-secret");
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.checked).toBe(1);
    expect(data.released).toBe(1);
  });

  it("restores correct quantity to product stock", async () => {
    mockPrisma.order.findMany.mockResolvedValue([mockExpiredOrder]);
    let capturedProductUpdate: ReturnType<typeof vi.fn>;

    mockPrisma.$transaction.mockImplementation(async (fn: (tx: typeof mockPrisma) => Promise<unknown>) => {
      capturedProductUpdate = vi.fn().mockResolvedValue({});
      return fn({
        product: {
          findUnique: vi.fn().mockResolvedValue({ stock: 18 }),
          update: capturedProductUpdate,
        },
        stockMovement: { create: vi.fn().mockResolvedValue({}) },
        order: { update: vi.fn().mockResolvedValue({}) },
        payment: { updateMany: vi.fn().mockResolvedValue({}) },
      } as never);
    });

    await callExpireCron("Bearer cron-secret");

    expect(capturedProductUpdate!).toHaveBeenCalledWith({
      where: { id: "prod-1" },
      data: { stock: 20 },
    });
  });

  it("creates RELEASE stock movement", async () => {
    mockPrisma.order.findMany.mockResolvedValue([mockExpiredOrder]);
    let capturedStockMovementCreate: ReturnType<typeof vi.fn>;

    mockPrisma.$transaction.mockImplementation(async (fn: (tx: typeof mockPrisma) => Promise<unknown>) => {
      capturedStockMovementCreate = vi.fn().mockResolvedValue({});
      return fn({
        product: {
          findUnique: vi.fn().mockResolvedValue({ stock: 18 }),
          update: vi.fn().mockResolvedValue({}),
        },
        stockMovement: { create: capturedStockMovementCreate },
        order: { update: vi.fn().mockResolvedValue({}) },
        payment: { updateMany: vi.fn().mockResolvedValue({}) },
      } as never);
    });

    await callExpireCron("Bearer cron-secret");

    expect(capturedStockMovementCreate!).toHaveBeenCalledWith({
      data: {
        productId: "prod-1",
        type: "RELEASE",
        quantity: 2,
        previousQty: 18,
        newQty: 20,
        reference: "MB-EXPIRED-001",
        note: "Auto-released: order expired after 30 min",
      },
    });
  });

  it("cancels the order status", async () => {
    mockPrisma.order.findMany.mockResolvedValue([mockExpiredOrder]);
    let capturedOrderUpdate: ReturnType<typeof vi.fn>;

    mockPrisma.$transaction.mockImplementation(async (fn: (tx: typeof mockPrisma) => Promise<unknown>) => {
      capturedOrderUpdate = vi.fn().mockResolvedValue({});
      return fn({
        product: {
          findUnique: vi.fn().mockResolvedValue({ stock: 18 }),
          update: vi.fn().mockResolvedValue({}),
        },
        stockMovement: { create: vi.fn().mockResolvedValue({}) },
        order: { update: capturedOrderUpdate },
        payment: { updateMany: vi.fn().mockResolvedValue({}) },
      } as never);
    });

    await callExpireCron("Bearer cron-secret");

    expect(capturedOrderUpdate!).toHaveBeenCalledWith({
      where: { id: "order-1" },
      data: { status: "CANCELLED" },
    });
  });

  it("voids pending payments", async () => {
    mockPrisma.order.findMany.mockResolvedValue([mockExpiredOrder]);
    let capturedPaymentUpdateMany: ReturnType<typeof vi.fn>;

    mockPrisma.$transaction.mockImplementation(async (fn: (tx: typeof mockPrisma) => Promise<unknown>) => {
      capturedPaymentUpdateMany = vi.fn().mockResolvedValue({});
      return fn({
        product: {
          findUnique: vi.fn().mockResolvedValue({ stock: 18 }),
          update: vi.fn().mockResolvedValue({}),
        },
        stockMovement: { create: vi.fn().mockResolvedValue({}) },
        order: { update: vi.fn().mockResolvedValue({}) },
        payment: { updateMany: capturedPaymentUpdateMany },
      } as never);
    });

    await callExpireCron("Bearer cron-secret");

    expect(capturedPaymentUpdateMany!).toHaveBeenCalledWith({
      where: { orderId: "order-1", status: "PENDING" },
      data: { status: "FAILED" },
    });
  });

  it("creates audit log entry", async () => {
    mockPrisma.order.findMany.mockResolvedValue([mockExpiredOrder]);
    mockPrisma.$transaction.mockImplementation(async (fn: (tx: typeof mockPrisma) => Promise<unknown>) => {
      return fn({
        product: {
          findUnique: vi.fn().mockResolvedValue({ stock: 18 }),
          update: vi.fn().mockResolvedValue({}),
        },
        stockMovement: { create: vi.fn().mockResolvedValue({}) },
        order: { update: vi.fn().mockResolvedValue({}) },
        payment: { updateMany: vi.fn().mockResolvedValue({}) },
      } as never);
    });

    await callExpireCron("Bearer cron-secret");

    expect(mockLogAudit).toHaveBeenCalledWith({
      userId: "SYSTEM",
      action: "UPDATE",
      entityType: "ORDER",
      entityId: "order-1",
      entityName: "MB-EXPIRED-001",
      changes: { status: { old: "PENDING", new: "CANCELLED (expired)" } },
    });
  });

  it("handles multiple expired orders", async () => {
    const orders = [
      { ...mockExpiredOrder, id: "o1", orderNumber: "MB-001" },
      { ...mockExpiredOrder, id: "o2", orderNumber: "MB-002" },
      { ...mockExpiredOrder, id: "o3", orderNumber: "MB-003" },
    ];
    mockPrisma.order.findMany.mockResolvedValue(orders);
    mockPrisma.$transaction.mockImplementation(async (fn: (tx: typeof mockPrisma) => Promise<unknown>) => {
      return fn({
        product: { findUnique: vi.fn().mockResolvedValue({ stock: 18 }), update: vi.fn() },
        stockMovement: { create: vi.fn() },
        order: { update: vi.fn() },
        payment: { updateMany: vi.fn() },
      } as never);
    });

    const response = await callExpireCron("Bearer cron-secret");
    const data = await response.json();
    expect(data.checked).toBe(3);
    expect(data.released).toBe(3);
  });

  it("continues processing if one order fails", async () => {
    const orders = [
      { ...mockExpiredOrder, id: "o1", orderNumber: "MB-001" },
      { ...mockExpiredOrder, id: "o2", orderNumber: "MB-002" },
    ];
    mockPrisma.order.findMany.mockResolvedValue(orders);

    let callCount = 0;
    mockPrisma.$transaction.mockImplementation(async (fn: (tx: typeof mockPrisma) => Promise<unknown>) => {
      callCount++;
      if (callCount === 1) throw new Error("DB error");
      return fn({
        product: { findUnique: vi.fn().mockResolvedValue({ stock: 18 }), update: vi.fn() },
        stockMovement: { create: vi.fn() },
        order: { update: vi.fn() },
        payment: { updateMany: vi.fn() },
      } as never);
    });

    const response = await callExpireCron("Bearer cron-secret");
    const data = await response.json();
    expect(data.checked).toBe(2);
    expect(data.released).toBe(1);
  });

  it("returns timestamp", async () => {
    mockPrisma.order.findMany.mockResolvedValue([]);
    const response = await callExpireCron("Bearer cron-secret");
    const data = await response.json();
    expect(data.timestamp).toBeDefined();
    expect(new Date(data.timestamp).getTime()).not.toBeNaN();
  });
});
