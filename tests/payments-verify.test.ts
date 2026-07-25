import { describe, it, expect, vi, beforeEach } from "vitest";
import { verifyTransaction } from "@/lib/paystack";

const mockPayment = {
  id: "pay-1",
  orderId: "order-1",
  appointmentId: null,
  reference: "PAY-ref123",
  amount: 10000,
  status: "PENDING",
  method: "PAYSTACK",
};

const mockOrder = {
  id: "order-1",
  orderNumber: "MB-ORDER-001",
  status: "PENDING",
  total: 10000,
  pointsRedeemed: 0,
  couponId: null,
  customerProfileId: "cp-1",
  customerProfile: {
    user: { id: "user-1", name: "Test User", email: "test@example.com" },
  },
  items: [{ productId: "prod-1", name: "Shampoo", quantity: 1, price: 10000 }],
};

const mockPrisma = {
  payment: { findUnique: vi.fn(), update: vi.fn(), updateMany: vi.fn() },
  order: { findUnique: vi.fn(), update: vi.fn() },
  appointment: { findUnique: vi.fn(), update: vi.fn() },
  stockMovement: { updateMany: vi.fn() },
  loyaltyPoint: { create: vi.fn(), aggregate: vi.fn() },
  membership: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
  coupon: { update: vi.fn() },
  $transaction: vi.fn(),
  $queryRaw: vi.fn(),
};

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));
vi.mock("@/lib/auth", () => ({
  auth: vi.fn().mockResolvedValue({ user: { id: "user-1", name: "Test User" } }),
}));
vi.mock("@/lib/paystack", () => ({
  verifyTransaction: vi.fn(),
}));
vi.mock("@/lib/notifications", () => ({
  notify: vi.fn().mockResolvedValue(undefined),
  notifyAdmins: vi.fn().mockResolvedValue(undefined),
}));

describe("Payments Verify POST /api/payments/verify", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockPrisma.payment.findUnique.mockResolvedValue(mockPayment);
    mockPrisma.order.findUnique.mockResolvedValue(mockOrder);
    mockPrisma.order.update.mockResolvedValue({});
    mockPrisma.appointment.findUnique.mockResolvedValue(null);
    mockPrisma.appointment.update.mockResolvedValue({});
    mockPrisma.payment.update.mockResolvedValue({});
    mockPrisma.stockMovement.updateMany.mockResolvedValue({});
    mockPrisma.coupon.update.mockResolvedValue({});
    mockPrisma.loyaltyPoint.create.mockResolvedValue({});
    mockPrisma.loyaltyPoint.aggregate.mockResolvedValue({ _sum: { points: 0 } });
    mockPrisma.membership.findUnique.mockResolvedValue(null);
    mockPrisma.membership.create.mockResolvedValue({});
    mockPrisma.$queryRaw.mockResolvedValue([{ id: "pay-1", status: "PENDING" }]);

    mockPrisma.$transaction.mockImplementation(async (fn: (tx: Record<string, unknown>) => Promise<unknown>) => {
      return fn({
        $queryRaw: vi.fn().mockResolvedValue([{ id: "pay-1", status: "PENDING" }]),
        payment: {
          findUnique: vi.fn().mockResolvedValue({ ...mockPayment }),
          update: vi.fn().mockResolvedValue({}),
        },
        order: {
          findUnique: vi.fn().mockResolvedValue({ orderNumber: mockOrder.orderNumber, id: "order-1" }),
          update: vi.fn().mockResolvedValue({}),
        },
        appointment: { update: vi.fn().mockResolvedValue({}) },
        stockMovement: { updateMany: vi.fn().mockResolvedValue({}) },
      } as never);
    });

    vi.mocked(verifyTransaction).mockResolvedValue({
      status: true,
      data: { status: "success", id: 12345 },
    } as never);
  });

  async function callVerify(body: Record<string, unknown>, sessionUser?: Record<string, string> | null) {
    if (sessionUser === null) {
      const { auth } = await import("@/lib/auth");
      vi.mocked(auth).mockResolvedValueOnce(null);
    }

    const { POST } = await import("@/app/api/payments/verify/route");
    const request = new Request("http://localhost:3000/api/payments/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return POST(request as never);
  }

  it("returns 401 when not authenticated", async () => {
    const response = await callVerify({ paymentId: "pay-1" }, null);
    expect(response.status).toBe(401);
  });

  it("returns 400 when paymentId is missing", async () => {
    const response = await callVerify({});
    expect(response.status).toBe(400);
  });

  it("returns 404 when payment not found", async () => {
    mockPrisma.payment.findUnique.mockResolvedValueOnce(null);
    const response = await callVerify({ paymentId: "pay-1" });
    expect(response.status).toBe(404);
  });

  it("returns already paid for duplicate verification", async () => {
    mockPrisma.payment.findUnique.mockResolvedValueOnce({
      ...mockPayment,
      status: "PAID",
    });
    const response = await callVerify({ paymentId: "pay-1" });
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.message).toBe("Already paid");
  });

  it("confirms payment on successful Paystack verification", async () => {
    const response = await callVerify({ paymentId: "pay-1" });
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  it("converts RESERVATION to SALE on order payment", async () => {
    await callVerify({ paymentId: "pay-1" });
    expect(mockPrisma.$transaction).toHaveBeenCalled();
  });

  it("returns not yet successful for pending Paystack status", async () => {
    vi.mocked(verifyTransaction).mockResolvedValueOnce({
      status: true,
      data: { status: "pending" },
    } as never);

    const response = await callVerify({ paymentId: "pay-1" });
    const data = await response.json();
    expect(data.success).toBe(false);
  });

  it("handles appointment payment (confirms appointment)", async () => {
    mockPrisma.payment.findUnique.mockResolvedValueOnce({
      ...mockPayment,
      orderId: null,
      appointmentId: "apt-1",
    });
    mockPrisma.appointment.findUnique.mockResolvedValueOnce({
      id: "apt-1",
      totalAmount: 15000,
      depositPaid: 5000,
      reference: "BK-APT-001",
      service: { name: "Hair Treatment" },
      stylist: { user: { name: "Stylist" } },
      customerProfile: {
        user: { id: "user-1", name: "Test User", email: "test@example.com" },
      },
    });

    const response = await callVerify({ paymentId: "pay-1" });
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  it("handles Paystack API errors gracefully", async () => {
    vi.mocked(verifyTransaction).mockResolvedValueOnce({
      status: false,
    } as never);

    const response = await callVerify({ paymentId: "pay-1" });
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(false);
  });
});
