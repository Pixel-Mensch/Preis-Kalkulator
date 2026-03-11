import { cn } from "@/lib/format";
import { inquiryStatusLabels, type InquiryStatus } from "@/lib/pricing/types";

const statusStyles: Record<InquiryStatus, string> = {
  NEW: "border-sky-200 bg-sky-50 text-sky-900",
  IN_PROGRESS: "border-amber-200 bg-amber-50 text-amber-900",
  SITE_VISIT_SCHEDULED: "border-violet-200 bg-violet-50 text-violet-900",
  OFFER_SENT: "border-emerald-200 bg-emerald-50 text-emerald-900",
  COMPLETED: "border-slate-200 bg-slate-100 text-slate-800",
  REJECTED: "border-rose-200 bg-rose-50 text-rose-900",
};

type StatusBadgeProps = {
  status: InquiryStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[0.72rem] font-semibold tracking-[0.02em] shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]",
        statusStyles[status],
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-75" aria-hidden="true" />
      {inquiryStatusLabels[status]}
    </span>
  );
}
