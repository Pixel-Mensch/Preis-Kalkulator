import type { ReactNode } from "react";

import { cn } from "@/lib/format";

type AdminNoticeProps = {
  variant: "success" | "error" | "info";
  title?: string;
  children: ReactNode;
};

const variantStyles: Record<AdminNoticeProps["variant"], string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  error: "border-red-200 bg-red-50 text-red-900",
  info: "border-sky-200 bg-sky-50 text-sky-900",
};

const variantIcons: Record<AdminNoticeProps["variant"], string> = {
  success: "✓",
  error: "!",
  info: "i",
};

export function AdminNotice({ variant, title, children }: AdminNoticeProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-3xl border px-4 py-4 text-sm leading-6",
        variantStyles[variant],
      )}
    >
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-current/15 bg-white/65 text-xs font-bold">
        {variantIcons[variant]}
      </span>
      <div className="min-w-0">
        {title ? <p className="font-semibold">{title}</p> : null}
        <div className={title ? "mt-1" : ""}>{children}</div>
      </div>
    </div>
  );
}
