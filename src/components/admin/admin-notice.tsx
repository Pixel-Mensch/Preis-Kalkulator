import type { ReactNode } from "react";

import { cn } from "@/lib/format";

type AdminNoticeProps = {
  variant: "success" | "error";
  children: ReactNode;
};

const variantStyles: Record<AdminNoticeProps["variant"], string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  error: "border-red-200 bg-red-50 text-red-900",
};

export function AdminNotice({ variant, children }: AdminNoticeProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border px-4 py-3 text-sm leading-6",
        variantStyles[variant],
      )}
    >
      {children}
    </div>
  );
}
