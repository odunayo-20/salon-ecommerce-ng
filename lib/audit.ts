import { prisma } from "@/lib/prisma";

interface AuditLogEntry {
  userId?: string;
  action: "CREATE" | "UPDATE" | "DELETE";
  entityType: string;
  entityId?: string;
  entityName?: string;
  changes?: Record<string, { old: unknown; new: unknown }>;
  ipAddress?: string;
}

export async function logAudit(entry: AuditLogEntry): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: entry.userId || null,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId || null,
        entityName: entry.entityName || null,
        changes: entry.changes ? JSON.stringify(entry.changes) : "{}",
        ipAddress: entry.ipAddress || null,
      },
    });
  } catch (error) {
    console.error("Audit log error:", error);
  }
}

export function diffObjects(
  oldObj: Record<string, unknown>,
  newObj: Record<string, unknown>,
  skipKeys: string[] = ["id", "createdAt", "updatedAt", "metadata"]
): Record<string, { old: unknown; new: unknown }> | null {
  const changes: Record<string, { old: unknown; new: unknown }> = {};
  let hasChanges = false;

  const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);

  for (const key of allKeys) {
    if (skipKeys.includes(key)) continue;
    const oldVal = oldObj[key];
    const newVal = newObj[key];

    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      changes[key] = { old: oldVal ?? null, new: newVal ?? null };
      hasChanges = true;
    }
  }

  return hasChanges ? changes : null;
}
