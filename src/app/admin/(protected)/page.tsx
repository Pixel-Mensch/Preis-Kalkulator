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
    newInquiryCount,
    openInquiryCount,
    manualReviewCount,
    offerSentCount,
    siteVisitCount,
    priorityInquiries,
    recentInquiries,
    companySettings,
    pricingProfile,
  ] = await Promise.all([
    prisma.inquiry.count(),
    prisma.inquiry.count({
      where: {
        status: "NEW",
      },
    }),
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
        status: {
          in: [...openStatuses],
        },
      },
    }),
    prisma.inquiry.count({
      where: {
        status: "OFFER_SENT",
      },
    }),
    prisma.inquiry.count({
      where: {
        status: "SITE_VISIT_SCHEDULED",
      },
    }),
    prisma.inquiry.findMany({
      take: 4,
      where: {
        manualReviewRequired: true,
        status: {
          in: [...openStatuses],
        },
      },
      orderBy: [{ createdAt: "asc" }],
    }),
    prisma.inquiry.findMany({
      take: 6,
      orderBy: [{ manualReviewRequired: "desc" }, { createdAt: "desc" }],
    }),
    prisma.companySettings.findFirst(),
    prisma.pricingProfile.findFirst({
      where: {
        isActive: true,
      },
      select: {
        name: true,
      },
    }),
  ]);

  const publicInquiryReady = Boolean(companySettings) && Boolean(pricingProfile);
  const readinessItems = [
    {
      label: "Firmendaten",
      ready: Boolean(companySettings),
      detail: companySettings
        ? `${companySettings.companyName} ist als öffentliche Absenderangabe hinterlegt.`
        : "Name, Kontakt und Einsatzgebiet sollten vor der Freigabe gepflegt werden.",
    },
    {
      label: "Preisprofil",
      ready: Boolean(pricingProfile),
      detail: pricingProfile
        ? `${pricingProfile.name} ist als aktives Preisprofil hinterlegt.`
        : "Für neue Anfragen fehlt noch ein aktives Preisprofil.",
    },
    {
      label: "Öffentliche Anfrage",
      ready: publicInquiryReady,
      detail: publicInquiryReady
        ? "Landingpage und Rechner können aktuell regulär genutzt werden."
        : "Vor der Freigabe sollten Firmendaten und Preise einmal komplett geprüft werden.",
    },
  ] as const;

  const focusCards = [
    {
      label: "Neu eingegangen",
      value: newInquiryCount,
      text: "Diese Anfragen sollten zuerst gesichtet werden.",
      href: "/admin/anfragen?filter=new",
      tone: "border-sky-200 bg-sky-50",
    },
    {
      label: "Manuelle Prüfung",
      value: manualReviewCount,
      text: "Hier lohnt sich meist ein Rückruf oder eine kurze Vorprüfung.",
      href: "/admin/anfragen?filter=manual",
      tone: "border-amber-300 bg-amber-50",
    },
    {
      label: "Besichtigung / Angebot",
      value: siteVisitCount + offerSentCount,
      text: "Vorgänge mit weiterem Abstimmungs- oder Angebotsstand.",
      href: "/admin/anfragen?filter=follow-up",
      tone: "border-emerald-200 bg-emerald-50",
    },
  ] as const;

  return (
    <div className="space-y-6">
      <section className="panel rounded-[2rem] p-6 sm:p-8">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="eyebrow text-[var(--accent-deep)]">Dashboard</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-balance">
              {companySettings?.companyName ?? "Betriebsübersicht"}
            </h1>
            <p className="mt-3 text-sm leading-6 text-[var(--foreground-soft)]">
              Überblick über neue Anfragen, laufende Fälle und Vorgänge mit besonderem
              Klärungsbedarf. Insgesamt liegen aktuell {inquiryCount} Anfragen im System.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href="/admin/anfragen?filter=open"
                className="inline-flex rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
              >
                Offene Anfragen prüfen
              </Link>
              <Link
                href="/admin/firma"
                className="inline-flex rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold text-slate-950"
              >
                Firmendaten prüfen
              </Link>
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-[var(--line)] bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(247,243,234,0.92))] px-5 py-5 text-sm leading-6 text-[var(--foreground-soft)] xl:max-w-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-deep)]">
              Betriebsstatus
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-950">
              {publicInquiryReady
                ? "Öffentliche Anfrage ist freigegeben"
                : "Öffentliche Anfrage noch nicht freigegeben"}
            </p>
            <div className="mt-4 space-y-3">
              {readinessItems.map((item) => (
                <div key={item.label} className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-slate-950">{item.label}</p>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${
                        item.ready
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-900"
                      }`}
                    >
                      {item.ready ? "bereit" : "offen"}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-[var(--foreground-soft)]">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
            {companySettings ? (
              <p className="mt-4 text-xs leading-5">
                {companySettings.contactPhone} · {companySettings.contactEmail}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {focusCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className={`rounded-[1.8rem] border p-5 transition hover:shadow-[0_16px_36px_rgba(37,45,57,0.08)] ${card.tone}`}
          >
            <p className="text-sm text-[var(--foreground-soft)]">{card.label}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{card.value}</p>
            <p className="mt-2 text-sm leading-6 text-[var(--foreground-soft)]">{card.text}</p>
          </Link>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="panel rounded-[1.6rem] border-t-4 border-t-slate-200 p-5">
          <p className="text-sm text-[var(--foreground-soft)]">Alle Anfragen</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">{inquiryCount}</p>
          <p className="mt-2 text-xs leading-5 text-[var(--foreground-soft)]">
            Gesamter Bestand im System.
          </p>
        </article>
        <article className="panel rounded-[1.6rem] border-t-4 border-t-sky-200 p-5">
          <p className="text-sm text-[var(--foreground-soft)]">Offen in Arbeit</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">{openInquiryCount}</p>
          <p className="mt-2 text-xs leading-5 text-[var(--foreground-soft)]">
            Neu, in Bearbeitung oder bereits zur Besichtigung eingeplant.
          </p>
        </article>
        <article className="panel rounded-[1.6rem] border-t-4 border-t-amber-300 p-5">
          <p className="text-sm text-[var(--foreground-soft)]">Mit Prüfbedarf</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">{manualReviewCount}</p>
          <p className="mt-2 text-xs leading-5 text-[var(--foreground-soft)]">
            Fälle mit Rückfrage, Risiko oder Einsatzklärung.
          </p>
        </article>
        <article className="panel rounded-[1.6rem] border-t-4 border-t-emerald-200 p-5">
          <p className="text-sm text-[var(--foreground-soft)]">Angebot gesendet</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">{offerSentCount}</p>
          <p className="mt-2 text-xs leading-5 text-[var(--foreground-soft)]">
            Vorgänge in der Angebotsphase.
          </p>
        </article>
      </section>

      {manualReviewCount > 0 ? (
        <section className="rounded-[2rem] border border-amber-300 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
          <p className="font-semibold">Heute mit Vorrang prüfen</p>
          <p className="mt-2">
            Es liegen aktuell {manualReviewCount} offene Anfrage(n) mit manuellem Prüfbedarf vor.
            Diese Fälle sollten bevorzugt angerufen oder fachlich eingeordnet werden.
          </p>
        </section>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <section className="panel rounded-[2rem] p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Aktuelle Eingänge</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--foreground-soft)]">
                Die neuesten Leads mit Preisrahmen, Priorität und aktuellem Bearbeitungsstand.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/admin/anfragen?filter=open"
                className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold text-slate-950"
              >
                Nur offene
              </Link>
              <Link
                href="/admin/anfragen"
                className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
              >
                Alle Anfragen
              </Link>
            </div>
          </div>

          {recentInquiries.length === 0 ? (
            <div className="mt-8 rounded-[1.8rem] border border-dashed border-[var(--line)] bg-[var(--surface-muted)] px-6 py-8 text-sm leading-6 text-[var(--foreground-soft)]">
              <p className="font-semibold text-slate-950">Noch keine Anfrage vorhanden</p>
              <p className="mt-2">
                Sobald die erste Anfrage eingeht, sehen Sie hier Preisrahmen, Priorität und
                Bearbeitungsstand auf einen Blick.
              </p>
              <p className="mt-2 text-xs leading-5">
                Für einen guten Start sollten Preisprofil und Firmendaten vollständig gepflegt sein.
              </p>
            </div>
          ) : (
            <>
              <div className="mt-6 grid gap-4 lg:hidden">
                {recentInquiries.map((inquiry) => (
                  <article
                    key={inquiry.id}
                    className={`rounded-[1.7rem] border px-4 py-4 ${
                      inquiry.manualReviewRequired
                        ? "border-amber-300 bg-amber-50"
                        : "border-[var(--line)] bg-[var(--surface-muted)]"
                    }`}
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
                          {objectTypeLabels[inquiry.objectType]} · {inquiry.postalCode}
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
                      <th className="pb-3 font-medium">Objekt</th>
                      <th className="pb-3 font-medium">Preisrahmen</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Eingegangen</th>
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
                          {inquiry.manualReviewRequired ? (
                            <div className="mt-2">
                              <ManualReviewBadge />
                            </div>
                          ) : null}
                        </td>
                        <td className="py-4 text-slate-950">
                          <p className="font-medium">{objectTypeLabels[inquiry.objectType]}</p>
                          <p className="text-xs text-[var(--foreground-soft)]">{inquiry.postalCode}</p>
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
          <h2 className="text-xl font-semibold text-slate-950">Heute zuerst anpacken</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--foreground-soft)]">
            Offene Fälle mit manueller Prüfung, bei denen ein Rückruf oder eine kurze Einordnung
            wahrscheinlich zuerst den größten Unterschied macht.
          </p>

          {priorityInquiries.length === 0 ? (
            <div className="mt-6 rounded-[1.6rem] border border-dashed border-[var(--line)] bg-[var(--surface-muted)] px-5 py-5 text-sm leading-6 text-[var(--foreground-soft)]">
              Aktuell liegen keine offenen Sonderfälle mit Priorität vor.
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
                        {objectTypeLabels[inquiry.objectType]} · {inquiry.postalCode}
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
