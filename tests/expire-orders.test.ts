import { describe, it, expect, vi, beforeEach } from "vitest";

const mockOrder = {
  id: "order-1",
  orderNumber: "MB-EXPIRED-001",
  status: "PENDING",
  expiresAt: new Date("2024-01-01"),
  items: [{ id: "item-1", productId: "prod-1", quantity: 2, name: "Shampoo" }],
  payments: [{ id: "pay-1", status: "PENDING" }],
};

const mockPrisma = {
  order: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
  },
  $transaction: vi.fn(),
};

const mockLogAudit = vi.fn().mockResolvedValue(undefined);

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));
vi.mock("@/lib/audit", () => ({ logAudit: mockLogAudit }));

describe("lib/orders — releaseReservation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns false if order not found", async () => {
    mockPrisma.order.findUnique.mockResolvedValue(null);
    const { releaseReservation } = await import("@/lib/orders");
    const result = await releaseReservation("nonexistent");
    expect(result).toBe(false);
  });

  it("returns false if order is not PENDING", async () => {
    mockPrisma.order.findUnique.mockResolvedValue({ ...mockOrder, status: "PROCESSING" });
    const { releaseReservation } = await import("@/lib/orders");
    const result = await releaseReservation("order-1");
    expect(result).toBe(false);
  });

  it("releases reservation and restores stock", async () => {
    mockPrisma.order.findUnique.mockResolvedValue(mockOrder);
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

    const { releaseReservation } = await import("@/lib/orders");
    const result = await releaseReservation("order-1");
    expect(result).toBe(true);
    expect(mockLogAudit).toHaveBeenCalledWith(expect.objectContaining({
      userId: "SYSTEM",
      entityType: "ORDER",
      entityId: "order-1",
    }));
  });

  it("restores correct quantity", async () => {
    mockPrisma.order.findUnique.mockResolvedValue(mockOrder);
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

    const { releaseReservation } = await import("@/lib/orders");
    await releaseReservation("order-1");

    expect(capturedProductUpdate!).toHaveBeenCalledWith({
      where: { id: "prod-1" },
      data: { stock: 20 },
    });
  });

  it("creates RELEASE stock movement", async () => {
    mockPrisma.order.findUnique.mockResolvedValue(mockOrder);
    let capturedMovement: ReturnType<typeof vi.fn>;

    mockPrisma.$transaction.mockImplementation(async (fn: (tx: typeof mockPrisma) => Promise<unknown>) => {
      capturedMovement = vi.fn().mockResolvedValue({});
      return fn({
        product: {
          findUnique: vi.fn().mockResolvedValue({ stock: 18 }),
          update: vi.fn().mockResolvedValue({}),
        },
        stockMovement: { create: capturedMovement },
        order: { update: vi.fn().mockResolvedValue({}) },
        payment: { updateMany: vi.fn().mockResolvedValue({}) },
      } as never);
    });

    const { releaseReservation } = await import("@/lib/orders");
    await releaseReservation("order-1");

    expect(capturedMovement!).toHaveBeenCalledWith({
      data: expect.objectContaining({
        productId: "prod-1",
        type: "RELEASE",
        quantity: 2,
      }),
    });
  });

  it("cancels the order", async () => {
    mockPrisma.order.findUnique.mockResolvedValue(mockOrder);
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

    const { releaseReservation } = await import("@/lib/orders");
    await releaseReservation("order-1");

    expect(capturedOrderUpdate!).toHaveBeenCalledWith({
      where: { id: "order-1" },
      data: { status: "CANCELLED" },
    });
  });

  it("voids pending payments", async () => {
    mockPrisma.order.findUnique.mockResolvedValue(mockOrder);
    let capturedPaymentUpdate: ReturnType<typeof vi.fn>;

    mockPrisma.$transaction.mockImplementation(async (fn: (tx: typeof mockPrisma) => Promise<unknown>) => {
      capturedPaymentUpdate = vi.fn().mockResolvedValue({});
      return fn({
        product: {
          findUnique: vi.fn().mockResolvedValue({ stock: 18 }),
          update: vi.fn().mockResolvedValue({}),
        },
        stockMovement: { create: vi.fn().mockResolvedValue({}) },
        order: { update: vi.fn().mockResolvedValue({}) },
        payment: { updateMany: capturedPaymentUpdate },
      } as never);
    });

    const { releaseReservation } = await import("@/lib/orders");
    await releaseReservation("order-1");

    expect(capturedPaymentUpdate!).toHaveBeenCalledWith({
      where: { orderId: "order-1", status: "PENDING" },
      data: { status: "FAILED" },
    });
  });
});

describe("lib/orders — expireIfOverdue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns false if order not found", async () => {
    mockPrisma.order.findUnique.mockResolvedValue(null);
    const { expireIfOverdue } = await import("@/lib/orders");
    const result = await expireIfOverdue("nonexistent");
    expect(result).toBe(false);
  });

  it("returns false if not PENDING", async () => {
    mockPrisma.order.findUnique.mockResolvedValue({ status: "PROCESSING", expiresAt: new Date("2024-01-01") });
    const { expireIfOverdue } = await import("@/lib/orders");
    const result = await expireIfOverdue("order-1");
    expect(result).toBe(false);
  });

  it("returns false if no expiresAt", async () => {
    mockPrisma.order.findUnique.mockResolvedValue({ status: "PENDING", expiresAt: null });
    const { expireIfOverdue } = await import("@/lib/orders");
    const result = await expireIfOverdue("order-1");
    expect(result).toBe(false);
  });

  it("returns false if not yet expired", async () => {
    mockPrisma.order.findUnique.mockResolvedValue({ status: "PENDING", expiresAt: new Date("2099-12-31") });
    const { expireIfOverdue } = await import("@/lib/orders");
    const result = await expireIfOverdue("order-1");
    expect(result).toBe(false);
  });
});

describe("lib/orders — expireAllOverdue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 0 when no overdue orders", async () => {
    mockPrisma.order.findMany.mockResolvedValue([]);
    const { expireAllOverdue } = await import("@/lib/orders");
    const result = await expireAllOverdue();
    expect(result).toBe(0);
  });

  it("queries for PENDING orders with past expiresAt", async () => {
    mockPrisma.order.findMany.mockResolvedValue([]);
    const { expireAllOverdue } = await import("@/lib/orders");
    await expireAllOverdue();
    expect(mockPrisma.order.findMany).toHaveBeenCalledWith({
      where: {
        status: "PENDING",
        expiresAt: { not: null, lt: expect.any(Date) },
      },
      select: { id: true },
    });
  });
});
