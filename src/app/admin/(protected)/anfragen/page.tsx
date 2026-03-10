import Link from "next/link";

import { ManualReviewBadge } from "@/components/admin/manual-review-badge";
import { StatusBadge } from "@/components/admin/status-badge";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { prisma } from "@/lib/db";
import { objectTypeLabels } from "@/lib/pricing/types";

export default async function InquiryListPage() {
  const inquiries = await prisma.inquiry.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <section className="panel rounded-[2rem] p-6 sm:p-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow text-[var(--accent-deep)]">Anfragen</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Lead-Uebersicht</h1>
        </div>
        <p className="text-sm text-[var(--foreground-soft)]">
          {inquiries.length} Eintraege insgesamt
        </p>
      </div>

      <div className="mt-8 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-[var(--foreground-soft)]">
            <tr>
              <th className="pb-3 font-medium">Kunde</th>
              <th className="pb-3 font-medium">Objekt</th>
              <th className="pb-3 font-medium">Schaetzung</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Eingegangen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)]">
            {inquiries.map((inquiry) => (
              <tr key={inquiry.id}>
                <td className="py-4">
                  <Link href={`/admin/anfragen/${inquiry.id}`} className="font-semibold text-slate-950">
                    {inquiry.customerName}
                  </Link>
                  <p className="text-xs text-[var(--foreground-soft)]">{inquiry.customerEmail}</p>
                </td>
                <td className="py-4 text-slate-950">{objectTypeLabels[inquiry.objectType]}</td>
                <td className="py-4 font-medium text-slate-950">
                  {formatCurrency(inquiry.estimateMin)} bis {formatCurrency(inquiry.estimateMax)}
                </td>
                <td className="py-4">
                  <div className="flex flex-col items-start gap-2">
                    <StatusBadge status={inquiry.status} />
                    {inquiry.manualReviewRequired ? <ManualReviewBadge /> : null}
                  </div>
                </td>
                <td className="py-4 text-[var(--foreground-soft)]">
                  {formatDateTime(inquiry.createdAt)}
                </td>
              </tr>
            ))}
            {inquiries.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-[var(--foreground-soft)]">
                  Noch keine Anfragen gespeichert.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
