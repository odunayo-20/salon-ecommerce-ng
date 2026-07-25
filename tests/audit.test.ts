import { describe, it, expect, vi, beforeEach } from "vitest";
import { diffObjects, logAudit } from "@/lib/audit";

describe("diffObjects", () => {
  it("returns null when objects are identical", () => {
    const obj = { name: "test", price: 100 };
    expect(diffObjects(obj, { ...obj })).toBeNull();
  });

  it("detects changed fields", () => {
    const old = { name: "Old Name", price: 100 };
    const updated = { name: "New Name", price: 100 };
    const changes = diffObjects(old, updated);
    expect(changes).toEqual({ name: { old: "Old Name", new: "New Name" } });
  });

  it("detects added fields", () => {
    const old = { name: "test" };
    const updated = { name: "test", description: "new" };
    const changes = diffObjects(old, updated);
    expect(changes).toEqual({ description: { old: null, new: "new" } });
  });

  it("detects removed fields", () => {
    const old = { name: "test", description: "old" };
    const updated = { name: "test" };
    const changes = diffObjects(old, updated);
    expect(changes).toEqual({ description: { old: "old", new: null } });
  });

  it("skips default keys (id, createdAt, updatedAt, metadata)", () => {
    const old = { id: "1", name: "a", createdAt: "2024-01-01", updatedAt: "2024-01-01" };
    const updated = { id: "2", name: "b", createdAt: "2024-06-01", updatedAt: "2024-06-01" };
    const changes = diffObjects(old, updated);
    expect(changes).toEqual({ name: { old: "a", new: "b" } });
  });

  it("respects custom skipKeys", () => {
    const old = { name: "a", internal: "x" };
    const updated = { name: "b", internal: "y" };
    const changes = diffObjects(old, updated, ["id", "internal"]);
    expect(changes).toEqual({ name: { old: "a", new: "b" } });
  });

  it("handles null values", () => {
    const old = { name: "test", desc: "hello" };
    const updated = { name: "test", desc: null };
    const changes = diffObjects(old, updated);
    expect(changes).toEqual({ desc: { old: "hello", new: null } });
  });

  it("handles nested objects via JSON comparison", () => {
    const old = { meta: { a: 1 } };
    const updated = { meta: { a: 2 } };
    const changes = diffObjects(old, updated);
    expect(changes).toEqual({ meta: { old: { a: 1 }, new: { a: 2 } } });
  });
});

describe("logAudit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates an audit log entry", async () => {
    const { prisma } = await import("@/lib/prisma");
    const mockCreate = vi.fn().mockResolvedValue({});
    (prisma as Record<string, unknown>).auditLog = { create: mockCreate };

    await logAudit({
      userId: "user-1",
      action: "CREATE",
      entityType: "PRODUCT",
      entityId: "prod-1",
      entityName: "Shampoo",
    });

    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        userId: "user-1",
        action: "CREATE",
        entityType: "PRODUCT",
        entityId: "prod-1",
        entityName: "Shampoo",
        changes: "{}",
        ipAddress: null,
      },
    });
  });

  it("serializes changes to JSON string", async () => {
    const { prisma } = await import("@/lib/prisma");
    const mockCreate = vi.fn().mockResolvedValue({});
    (prisma as Record<string, unknown>).auditLog = { create: mockCreate };

    await logAudit({
      action: "UPDATE",
      entityType: "ORDER",
      changes: { status: { old: "PENDING", new: "CANCELLED" } },
    });

    const call = mockCreate.mock.calls[0][0];
    expect(JSON.parse(call.data.changes)).toEqual({
      status: { old: "PENDING", new: "CANCELLED" },
    });
  });

  it("handles missing optional fields", async () => {
    const { prisma } = await import("@/lib/prisma");
    const mockCreate = vi.fn().mockResolvedValue({});
    (prisma as Record<string, unknown>).auditLog = { create: mockCreate };

    await logAudit({ action: "DELETE", entityType: "COUPON" });

    const call = mockCreate.mock.calls[0][0];
    expect(call.data.userId).toBeNull();
    expect(call.data.entityId).toBeNull();
  });
});
