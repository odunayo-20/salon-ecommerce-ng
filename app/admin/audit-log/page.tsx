"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Search, X, Loader2, ClipboardList, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import { useAuditLog } from "@/hooks/queries";
import { cn } from "@/lib/utils";

const actionColors: Record<string, string> = {
  CREATE: "bg-emerald-50 text-emerald-700",
  UPDATE: "bg-blue-50 text-blue-700",
  DELETE: "bg-red-50 text-red-600",
};

export default function AdminAuditLogPage() {
  const [action, setAction] = useState("");
  const [entityType, setEntityType] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data, isLoading } = useAuditLog({ action, entityType, from, to, page });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-heading text-xl sm:text-2xl font-bold text-charcoal">Audit Log</h1>
        <p className="text-sm text-muted-foreground mt-1">Track all changes made across the platform.</p>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <select value={action} onChange={(e) => { setAction(e.target.value); setPage(1); }} className="bg-white border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-gold min-h-[44px]">
            <option value="">All Actions</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
          </select>
          <select value={entityType} onChange={(e) => { setEntityType(e.target.value); setPage(1); }} className="bg-white border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-gold min-h-[44px]">
            <option value="">All Entities</option>
            {data?.entityTypes?.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2 bg-white border border-border rounded-lg px-3 min-h-[44px]">
          <input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} className="text-xs py-2 focus:outline-none min-w-0 flex-1" />
          <span className="text-muted-foreground text-xs shrink-0">to</span>
          <input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} className="text-xs py-2 focus:outline-none min-w-0 flex-1" />
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center"><Loader2 className="h-8 w-8 text-gold animate-spin mx-auto" /></div>
      ) : !data?.logs.length ? (
        <div className="py-20 text-center"><ClipboardList className="h-12 w-12 text-border mx-auto mb-3" /><p className="text-muted-foreground">No audit logs found</p></div>
      ) : (
        <>
          {/* Mobile Cards */}
          <div className="sm:hidden space-y-3">
            {data.logs.map((log) => {
              const isExpanded = expandedId === log.id;
              return (
                <div key={log.id} className="bg-white border border-border rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : log.id)}
                    className="w-full text-left p-4 min-h-[44px]"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0", actionColors[log.action])}>{log.action}</span>
                          <span className="text-sm font-medium text-charcoal">{log.entityType}</span>
                        </div>
                        {log.entityName && <p className="text-xs text-muted-foreground truncate">{log.entityName}</p>}
                      </div>
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0 mt-1" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />}
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{log.user ? (log.user.name || "Admin") : "System"}</span>
                      <span>{new Date(log.createdAt).toLocaleDateString("en-NG", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    {log.changes && (
                      <p className="text-[10px] text-muted-foreground mt-1">{Object.keys(log.changes).length} field{Object.keys(log.changes).length !== 1 ? "s" : ""} changed</p>
                    )}
                  </button>
                  {isExpanded && log.changes && (
                    <div className="px-4 py-3 bg-cream/30 border-t border-border/50 space-y-1.5">
                      {Object.entries(log.changes).map(([field, change]) => (
                        <div key={field} className="flex items-start gap-2 text-xs">
                          <span className="font-medium text-charcoal min-w-[80px] shrink-0">{field}</span>
                          <span className="text-red-500 line-through break-all">{String(change.old ?? "null")}</span>
                          <span className="text-muted-foreground shrink-0">→</span>
                          <span className="text-emerald-600 break-all">{String(change.new ?? "null")}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Desktop Table */}
          <div className="hidden sm:block bg-white border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-cream/50">
                    {["Time", "User", "Action", "Entity", "Details"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.logs.map((log) => (
                    <>
                      <tr key={log.id} className="border-b border-border/50 last:border-0 hover:bg-cream/30 cursor-pointer" onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}>
                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{new Date(log.createdAt).toLocaleDateString("en-NG", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
                        <td className="px-4 py-3">
                          {log.user ? (
                            <div>
                              <span className="text-charcoal font-medium">{log.user.name || "Admin"}</span>
                              <span className="text-muted-foreground text-xs ml-1">({log.user.email})</span>
                            </div>
                          ) : <span className="text-muted-foreground text-xs">System</span>}
                        </td>
                        <td className="px-4 py-3"><span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", actionColors[log.action])}>{log.action}</span></td>
                        <td className="px-4 py-3">
                          <span className="text-charcoal font-medium">{log.entityType}</span>
                          {log.entityName && <span className="text-muted-foreground text-xs ml-1">— {log.entityName}</span>}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{log.changes ? `${Object.keys(log.changes).length} field${Object.keys(log.changes).length !== 1 ? "s" : ""} changed` : "—"}</td>
                      </tr>
                      {expandedId === log.id && log.changes && (
                        <tr key={`${log.id}-detail`}>
                          <td colSpan={5} className="px-4 py-3 bg-cream/30">
                            <div className="space-y-1">
                              {Object.entries(log.changes).map(([field, change]) => (
                                <div key={field} className="flex items-center gap-2 text-xs">
                                  <span className="font-medium text-charcoal min-w-[120px]">{field}:</span>
                                  <span className="text-red-500 line-through">{String(change.old ?? "null")}</span>
                                  <span className="text-muted-foreground">→</span>
                                  <span className="text-emerald-600">{String(change.new ?? "null")}</span>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Showing {((data.pagination.page - 1) * data.pagination.limit) + 1}–{Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of {data.pagination.total}</p>
              <div className="flex items-center gap-2">
                <Button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} variant="outline" size="sm" className="rounded-full h-8 w-8 p-0"><ChevronLeft className="h-4 w-4" /></Button>
                <span className="text-xs text-muted-foreground">{page}/{data.pagination.totalPages}</span>
                <Button onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))} disabled={page >= data.pagination.totalPages} variant="outline" size="sm" className="rounded-full h-8 w-8 p-0"><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
