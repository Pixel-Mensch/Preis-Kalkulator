import Link from "next/link";

import { ManualReviewBadge } from "@/components/admin/manual-review-badge";
import { StatusBadge } from "@/components/admin/status-badge";
import { prisma } from "@/lib/db";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { objectTypeLabels } from "@/lib/pricing/types";

export default async function InquiryListPage() {
  const inquiries = await prisma.inquiry.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <section className="panel rounded-[2rem] p-6 sm:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="eyebrow text-[var(--accent-deep)]">Anfragen</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Lead-Uebersicht</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--foreground-soft)]">
            Alle eingegangenen Anfragen mit Kontakt, Preisrahmen und Hinweis auf
            manuelle Pruefung.
          </p>
        </div>
        <p className="text-sm text-[var(--foreground-soft)]">
          {inquiries.length} Eintraege insgesamt
        </p>
      </div>

      {inquiries.length === 0 ? (
        <div className="mt-8 rounded-[1.8rem] border border-dashed border-[var(--line)] bg-[var(--surface-muted)] px-6 py-8 text-sm leading-6 text-[var(--foreground-soft)]">
          <p className="font-semibold text-slate-950">Noch keine Anfragen gespeichert</p>
          <p className="mt-2">
            Fuer die erste Demo koennen Sie den Rechner oeffnen und eine Beispielanfrage
            absenden. Danach erscheint hier die komplette Lead-Uebersicht.
          </p>
          <div className="mt-4">
            <Link
              href="/rechner"
              className="inline-flex rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
            >
              Rechner testen
            </Link>
          </div>
        </div>
      ) : (
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
                <tr key={inquiry.id} className="transition hover:bg-[rgba(247,243,234,0.65)]">
                  <td className="py-4">
                    <Link
                      href={`/admin/anfragen/${inquiry.id}`}
                      className="font-semibold text-slate-950"
                    >
                      {inquiry.customerName}
                    </Link>
                    <p className="text-xs text-[var(--foreground-soft)]">
                      {inquiry.customerEmail}
                    </p>
                    <p className="text-xs text-[var(--foreground-soft)]">
                      {inquiry.customerPhone}
                    </p>
                  </td>
                  <td className="py-4 text-slate-950">
                    <p className="font-medium">{objectTypeLabels[inquiry.objectType]}</p>
                    <p className="text-xs text-[var(--foreground-soft)]">
                      Vorgang {inquiry.publicId} - {inquiry.postalCode}
                    </p>
                  </td>
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
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
