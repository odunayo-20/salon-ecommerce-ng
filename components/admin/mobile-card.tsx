"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface MobileCardField {
  label: string;
  value: ReactNode;
  className?: string;
  hideOnMobile?: boolean;
}

interface MobileCardProps {
  primary: ReactNode;
  fields: MobileCardField[];
  actions?: ReactNode;
  className?: string;
}

export function MobileCard({ primary, fields, actions, className }: MobileCardProps) {
  return (
    <div className={cn("bg-white border border-border rounded-xl p-4 space-y-3", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">{primary}</div>
        {actions && <div className="flex items-center gap-1 shrink-0">{actions}</div>}
      </div>
      <div className="space-y-2">
        {fields.filter((f) => !f.hideOnMobile).map((field) => (
          <div key={field.label} className="flex items-baseline justify-between gap-2 text-sm">
            <span className="text-muted-foreground shrink-0">{field.label}</span>
            <span className={cn("text-charcoal text-right min-w-0 truncate", field.className)}>{field.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface MobileCardListProps<T> {
  data: T[];
  renderItem: (item: T) => ReactNode;
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
  className?: string;
}

export function MobileCardList<T>({ data, renderItem, keyExtractor, emptyMessage = "No items found", className }: MobileCardListProps<T>) {
  return (
    <div className={cn("sm:hidden space-y-3", className)}>
      {data.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">{emptyMessage}</div>
      ) : (
        data.map((item) => (
          <div key={keyExtractor(item)}>{renderItem(item)}</div>
        ))
      )}
    </div>
  );
}

interface ResponsiveTableWrapperProps {
  children: ReactNode;
  className?: string;
}

export function ResponsiveTableWrapper({ children, className }: ResponsiveTableWrapperProps) {
  return (
    <>
      <div className={cn("overflow-x-auto", className)}>{children}</div>
    </>
  );
}
