import { vi } from "vitest";

export interface MockPrismaConfig {
  customerProfile?: Record<string, unknown> | null;
  existingPendingOrder?: Record<string, unknown> | null;
  product?: Record<string, unknown> | null;
  productAfterReserve?: Record<string, unknown> | null;
  payment?: Record<string, unknown> | null;
  order?: Record<string, unknown> | null;
  coupon?: Record<string, unknown> | null;
  loyaltyAggregate?: { earned: number; redeemed: number };
  lockedProducts?: Record<string, unknown>[];
}

export function createApiMocks(config: MockPrismaConfig = {}) {
  const defaultProduct = {
    id: "prod-1",
    name: "Premium Shampoo",
    stock: 20,
    lowStock: 5,
    isActive: true,
    slug: "premium-shampoo",
  };

  const defaultCustomerProfile = {
    id: "cp-1",
    userId: "user-1",
    user: { id: "user-1", name: "Test User", email: "test@example.com" },
  };

  const lockedProducts = config.lockedProducts || [
    { id: "prod-1", stock: 20, name: "Premium Shampoo" },
  ];

  // Build the findUnique mock chain
  const findUnique = vi.fn().mockImplementation(({ where, include, select }) => {
    // CustomerProfile lookup (by userId)
    if (where.userId) {
      return Promise.resolve(config.customerProfile !== undefined ? config.customerProfile : defaultCustomerProfile);
    }
    // Payment lookup
    if (where.id && where.id.startsWith("pay-")) {
      return Promise.resolve(config.payment || null);
    }
    // Coupon lookup (by code)
    if (where.code) {
      return Promise.resolve(config.coupon || null);
    }
    // Order lookup
    if (where.id && where.id.startsWith("order-")) {
      return Promise.resolve(config.order || null);
    }
    // Product lookup
    return Promise.resolve(config.product !== undefined ? config.product : defaultProduct);
  });

  const findFirst = vi.fn().mockImplementation(({ where }) => {
    if (config.existingPendingOrder) {
      return Promise.resolve(config.existingPendingOrder);
    }
    return Promise.resolve(null);
  });

  const create = vi.fn().mockImplementation(({ data }) => {
    const id = data.id || `mock-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    return Promise.resolve({ ...data, id, orderNumber: data.orderNumber || "MB-TEST-123" });
  });

  const update = vi.fn().mockImplementation(({ where, data }) => {
    return Promise.resolve({ ...where, ...data });
  });

  const updateMany = vi.fn().mockResolvedValue({ count: 1 });

  const count = vi.fn().mockResolvedValue(0);

  const aggregate = vi.fn().mockImplementation(({ where }) => {
    if (where?.type === "earned") {
      return Promise.resolve({
        _sum: { points: config.loyaltyAggregate?.earned || 0 },
      });
    }
    return Promise.resolve({
      _sum: { points: config.loyaltyAggregate?.redeemed || 0 },
    });
  });

  const queryRaw = vi.fn().mockImplementation(() => {
    return Promise.resolve(lockedProducts);
  });

  const prisma = {
    customerProfile: { findUnique, create },
    product: { findUnique, update },
    order: { findFirst, findMany: vi.fn().mockResolvedValue([]), create, update },
    orderItem: { create },
    payment: { findUnique, create, update, updateMany },
    stockMovement: { create, updateMany },
    coupon: { findUnique, update },
    auditLog: { create: vi.fn().mockResolvedValue({}) },
    loyaltyPoint: { create, aggregate },
    membership: { findUnique: vi.fn().mockResolvedValue(null), create, update },
    $transaction: vi.fn().mockImplementation(async (fn: (tx: typeof prisma) => Promise<unknown>) => {
      return fn(prisma);
    }),
    $queryRaw: queryRaw,
    $executeRaw: vi.fn().mockResolvedValue(1),
  };

  return {
    prisma,
    findUnique,
    findFirst,
    create,
    update,
    updateMany,
    count,
    aggregate,
    queryRaw,
  };
}

export function createRequest(body: unknown, method = "POST") {
  return new Request("http://localhost:3000/api/orders", {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: method !== "GET" ? JSON.stringify(body) : undefined,
  });
}

export function createGetRequest(url: string) {
  return new Request(url);
}
