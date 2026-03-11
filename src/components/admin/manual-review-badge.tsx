export function ManualReviewBadge() {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3.5 py-1.5 text-[0.72rem] font-semibold tracking-[0.02em] text-amber-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]">
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" aria-hidden="true" />
      Manuelle Prüfung
    </span>
  );
}
