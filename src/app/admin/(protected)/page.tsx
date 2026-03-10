import Link from "next/link";

import { ManualReviewBadge } from "@/components/admin/manual-review-badge";
import { StatusBadge } from "@/components/admin/status-badge";
import { prisma } from "@/lib/db";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { objectTypeLabels } from "@/lib/pricing/types";

export default async function AdminDashboardPage() {
  const [inquiryCount, manualReviewCount, recentInquiries, companySettings] =
    await Promise.all([
      prisma.inquiry.count(),
      prisma.inquiry.count({
        where: {
          manualReviewRequired: true,
        },
      }),
      prisma.inquiry.findMany({
        take: 6,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.companySettings.findFirst(),
    ]);

  return (
    <div className="space-y-6">
      <section className="panel rounded-[2rem] p-6 sm:p-8">
        <p className="eyebrow text-[var(--accent-deep)]">Dashboard</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-balance">
          {companySettings?.companyName ?? "Entruempler Angebotsrechner"}
        </h1>
        <p className="mt-3 text-sm leading-6 text-[var(--foreground-soft)]">
          Uebersicht ueber aktuelle Anfragen, manuelle Pruefungen und die
          wichtigsten Konfigurationsbereiche.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="panel rounded-[1.6rem] p-5">
          <p className="text-sm text-[var(--foreground-soft)]">Anfragen gesamt</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">{inquiryCount}</p>
        </article>
        <article className="panel rounded-[1.6rem] p-5">
          <p className="text-sm text-[var(--foreground-soft)]">Manuelle Pruefung</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">{manualReviewCount}</p>
        </article>
        <article className="panel rounded-[1.6rem] p-5">
          <p className="text-sm text-[var(--foreground-soft)]">Schnellzugriff</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/admin/anfragen"
              className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
            >
              Anfragen
            </Link>
            <Link
              href="/admin/preise"
              className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold text-slate-950"
            >
              Preise
            </Link>
          </div>
        </article>
      </section>

      <section className="panel rounded-[2rem] p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Neueste Anfragen</h2>
            <p className="mt-2 text-sm text-[var(--foreground-soft)]">
              Die zuletzt eingegangenen Leads im Schnellueberblick.
            </p>
          </div>
          <Link
            href="/admin/anfragen"
            className="text-sm font-semibold text-[var(--accent-deep)]"
          >
            Alle ansehen
          </Link>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-[var(--foreground-soft)]">
              <tr>
                <th className="pb-3 font-medium">Kunde</th>
                <th className="pb-3 font-medium">Schaetzung</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Eingang</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {recentInquiries.map((inquiry) => (
                <tr key={inquiry.id}>
                  <td className="py-4">
                    <Link
                      href={`/admin/anfragen/${inquiry.id}`}
                      className="font-semibold text-slate-950"
                    >
                      {inquiry.customerName}
                    </Link>
                    <p className="text-xs text-[var(--foreground-soft)]">
                      {objectTypeLabels[inquiry.objectType]} - {inquiry.postalCode}
                    </p>
                    {inquiry.manualReviewRequired ? (
                      <div className="mt-2">
                        <ManualReviewBadge />
                      </div>
                    ) : null}
                  </td>
                  <td className="py-4 font-medium text-slate-950">
                    {formatCurrency(inquiry.estimateMin)} bis {formatCurrency(inquiry.estimateMax)}
                  </td>
                  <td className="py-4">
                    <StatusBadge status={inquiry.status} />
                  </td>
                  <td className="py-4 text-[var(--foreground-soft)]">
                    {formatDateTime(inquiry.createdAt)}
                  </td>
                </tr>
              ))}
              {recentInquiries.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-[var(--foreground-soft)]">
                    Noch keine Anfragen vorhanden.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
