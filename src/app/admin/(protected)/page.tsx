import Link from "next/link";

import { ManualReviewBadge } from "@/components/admin/manual-review-badge";
import { StatusBadge } from "@/components/admin/status-badge";
import { prisma } from "@/lib/db";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { objectTypeLabels } from "@/lib/pricing/types";

const openStatuses = ["NEW", "IN_PROGRESS", "SITE_VISIT_SCHEDULED"] as const;

export default async function AdminDashboardPage() {
  const [
    inquiryCount,
    openInquiryCount,
    manualReviewCount,
    offerSentCount,
    priorityInquiries,
    recentInquiries,
    companySettings,
  ] = await Promise.all([
    prisma.inquiry.count(),
    prisma.inquiry.count({
      where: {
        status: {
          in: [...openStatuses],
        },
      },
    }),
    prisma.inquiry.count({
      where: {
        manualReviewRequired: true,
      },
    }),
    prisma.inquiry.count({
      where: {
        status: "OFFER_SENT",
      },
    }),
    prisma.inquiry.findMany({
      take: 3,
      where: {
        manualReviewRequired: true,
        status: {
          in: [...openStatuses],
        },
      },
      orderBy: {
        createdAt: "desc",
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
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-semibold tracking-tight text-balance">
              {companySettings?.companyName ?? "Entrümpler Angebotsrechner"}
            </h1>
            <p className="mt-3 text-sm leading-6 text-[var(--foreground-soft)]">
              Übersicht über neue Anfragen, manuelle Prüfungen und den aktuellen
              Arbeitsstand im Tagesgeschäft.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href="/admin/anfragen"
                className="inline-flex rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
              >
                Anfragen prüfen
              </Link>
              <Link
                href="/admin/preise"
                className="inline-flex rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold text-slate-950"
              >
                Preise anpassen
              </Link>
            </div>
          </div>
          {companySettings ? (
            <div className="rounded-3xl border border-[var(--line)] bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(247,243,234,0.92))] px-4 py-4 text-sm leading-6 text-[var(--foreground-soft)]">
              <p className="font-semibold text-slate-950">{companySettings.contactPhone}</p>
              <p>{companySettings.contactEmail}</p>
              <p>{companySettings.serviceAreaNote}</p>
            </div>
          ) : null}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="panel rounded-[1.6rem] border-t-4 border-t-slate-200 p-5">
          <p className="text-sm text-[var(--foreground-soft)]">Anfragen gesamt</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">{inquiryCount}</p>
          <p className="mt-2 text-xs leading-5 text-[var(--foreground-soft)]">
            Alle im System gespeicherten Vorgänge.
          </p>
        </article>
        <article className="panel rounded-[1.6rem] border-t-4 border-t-sky-200 p-5">
          <p className="text-sm text-[var(--foreground-soft)]">Offene Bearbeitung</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">{openInquiryCount}</p>
          <p className="mt-2 text-xs leading-5 text-[var(--foreground-soft)]">
            Neu, in Bearbeitung oder bereits zur Besichtigung eingeplant.
          </p>
        </article>
        <article className="panel rounded-[1.6rem] border-t-4 border-t-amber-300 p-5">
          <p className="text-sm text-[var(--foreground-soft)]">Manuelle Prüfung</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">{manualReviewCount}</p>
          <p className="mt-2 text-xs leading-5 text-[var(--foreground-soft)]">
            Fälle mit Risikohinweis oder hohem Abstimmungsbedarf.
          </p>
        </article>
        <article className="panel rounded-[1.6rem] border-t-4 border-t-emerald-200 p-5">
          <p className="text-sm text-[var(--foreground-soft)]">Angebot gesendet</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">{offerSentCount}</p>
          <p className="mt-2 text-xs leading-5 text-[var(--foreground-soft)]">
            Vorgänge, die bereits in die Angebotsphase gegangen sind.
          </p>
        </article>
      </section>

      {manualReviewCount > 0 ? (
        <section className="rounded-[2rem] border border-amber-300 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
          <p className="font-semibold">Manuelle Prüfung im Blick behalten</p>
          <p className="mt-2">
            Es liegen aktuell {manualReviewCount} Anfrage(n) mit besonderem Prüfbedarf vor.
            Diese Fälle sollten bevorzugt gesichtet oder telefonisch abgestimmt werden.
          </p>
        </section>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
        <section className="panel rounded-[2rem] p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Neueste Anfragen</h2>
              <p className="mt-2 text-sm text-[var(--foreground-soft)]">
                Die letzten Leads mit Preisrahmen, Status und Risikohinweis.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/admin/anfragen"
                className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
              >
                Anfragen ansehen
              </Link>
            </div>
          </div>

          {recentInquiries.length === 0 ? (
            <div className="mt-8 rounded-[1.8rem] border border-dashed border-[var(--line)] bg-[var(--surface-muted)] px-6 py-8 text-sm leading-6 text-[var(--foreground-soft)]">
              <p className="font-semibold text-slate-950">Noch keine Anfrage vorhanden</p>
              <p className="mt-2">
                Öffnen Sie den Rechner und schicken Sie eine Testanfrage ab, um den kompletten
                Ablauf mit Preisrahmen, PDF und Statusbearbeitung zu demonstrieren.
              </p>
            </div>
          ) : (
            <>
              <div className="mt-6 grid gap-4 lg:hidden">
                {recentInquiries.map((inquiry) => (
                  <article
                    key={inquiry.id}
                    className="rounded-[1.6rem] border border-[var(--line)] bg-[var(--surface-muted)] px-4 py-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Link
                          href={`/admin/anfragen/${inquiry.id}`}
                          className="font-semibold text-slate-950"
                        >
                          {inquiry.customerName}
                        </Link>
                        <p className="mt-1 text-xs text-[var(--foreground-soft)]">
                          {objectTypeLabels[inquiry.objectType]} – {inquiry.postalCode}
                        </p>
                      </div>
                      <StatusBadge status={inquiry.status} />
                    </div>
                    <p className="mt-4 text-lg font-semibold text-slate-950">
                      {formatCurrency(inquiry.estimateMin)} bis {formatCurrency(inquiry.estimateMax)}
                    </p>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <p className="text-xs text-[var(--foreground-soft)]">
                        {formatDateTime(inquiry.createdAt)}
                      </p>
                      {inquiry.manualReviewRequired ? <ManualReviewBadge /> : null}
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-6 hidden overflow-x-auto lg:block">
                <table className="min-w-full text-left text-sm">
                  <thead className="text-[var(--foreground-soft)]">
                    <tr>
                      <th className="pb-3 font-medium">Kunde</th>
                      <th className="pb-3 font-medium">Schätzung</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Eingang</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--line)]">
                    {recentInquiries.map((inquiry) => (
                      <tr key={inquiry.id} className="transition hover:bg-[rgba(247,243,234,0.65)]">
                        <td className="py-4">
                          <Link
                            href={`/admin/anfragen/${inquiry.id}`}
                            className="font-semibold text-slate-950"
                          >
                            {inquiry.customerName}
                          </Link>
                          <p className="text-xs text-[var(--foreground-soft)]">
                            {objectTypeLabels[inquiry.objectType]} – {inquiry.postalCode}
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
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>

        <section className="panel rounded-[2rem] p-6">
          <h2 className="text-xl font-semibold text-slate-950">Sofort im Blick</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--foreground-soft)]">
            Fälle mit manueller Prüfung, die sich gut für eine priorisierte Bearbeitung oder
            eine Live-Demo eignen.
          </p>

          {priorityInquiries.length === 0 ? (
            <div className="mt-6 rounded-[1.6rem] border border-dashed border-[var(--line)] bg-[var(--surface-muted)] px-5 py-5 text-sm leading-6 text-[var(--foreground-soft)]">
              Aktuell liegen keine priorisierten Sonderfälle vor.
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {priorityInquiries.map((inquiry) => (
                <Link
                  key={inquiry.id}
                  href={`/admin/anfragen/${inquiry.id}`}
                  className="block rounded-[1.6rem] border border-amber-300 bg-amber-50 px-4 py-4 transition hover:bg-amber-100/80"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950">{inquiry.customerName}</p>
                      <p className="mt-1 text-xs text-amber-900/80">
                        {objectTypeLabels[inquiry.objectType]} – {inquiry.postalCode}
                      </p>
                    </div>
                    <ManualReviewBadge />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-slate-950">
                    {formatCurrency(inquiry.estimateMin)} bis {formatCurrency(inquiry.estimateMax)}
                  </p>
                  <p className="mt-2 text-xs text-amber-900/80">
                    Eingegangen am {formatDateTime(inquiry.createdAt)}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>
      </section>
    </div>
  );
}
