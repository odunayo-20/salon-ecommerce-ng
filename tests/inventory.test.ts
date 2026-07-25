import { describe, it, expect, vi, beforeEach } from "vitest";
import { checkAndNotifyLowStock } from "@/lib/inventory";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    product: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("@/lib/notifications", () => ({
  notifyAdmins: vi.fn().mockResolvedValue(undefined),
}));

describe("checkAndNotifyLowStock", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does nothing if product not found", async () => {
    const { prisma } = await import("@/lib/prisma");
    (prisma.product.findUnique as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);

    await checkAndNotifyLowStock("nonexistent", 5);

    const { notifyAdmins } = await import("@/lib/notifications");
    expect(notifyAdmins).not.toHaveBeenCalled();
  });

  it("does nothing if stock is above threshold", async () => {
    const { prisma } = await import("@/lib/prisma");
    (prisma.product.findUnique as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      name: "Shampoo",
      stock: 50,
      lowStock: 10,
    });

    await checkAndNotifyLowStock("prod-1", 50);

    const { notifyAdmins } = await import("@/lib/notifications");
    expect(notifyAdmins).not.toHaveBeenCalled();
  });

  it("notifies admins when stock equals threshold", async () => {
    const { prisma } = await import("@/lib/prisma");
    (prisma.product.findUnique as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      name: "Shampoo",
      stock: 5,
      lowStock: 5,
    });

    await checkAndNotifyLowStock("prod-1", 5);

    const { notifyAdmins } = await import("@/lib/notifications");
    expect(notifyAdmins).toHaveBeenCalledWith("inventory.low_stock", {
      productName: "Shampoo",
      currentStock: 5,
      threshold: 5,
    });
  });

  it("notifies admins when stock is below threshold", async () => {
    const { prisma } = await import("@/lib/prisma");
    (prisma.product.findUnique as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      name: "Conditioner",
      stock: 2,
      lowStock: 10,
    });

    await checkAndNotifyLowStock("prod-2", 2);

    const { notifyAdmins } = await import("@/lib/notifications");
    expect(notifyAdmins).toHaveBeenCalledWith("inventory.low_stock", {
      productName: "Conditioner",
      currentStock: 2,
      threshold: 10,
    });
  });

  it("swallows errors silently", async () => {
    const { prisma } = await import("@/lib/prisma");
    (prisma.product.findUnique as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("DB error"));

    await expect(checkAndNotifyLowStock("prod-1", 5)).resolves.toBeUndefined();
  });
});
