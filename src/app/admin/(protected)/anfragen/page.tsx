import type { Prisma } from "@prisma/client";
import Link from "next/link";

import { AdminNotice } from "@/components/admin/admin-notice";
import { ManualReviewBadge } from "@/components/admin/manual-review-badge";
import { StatusBadge } from "@/components/admin/status-badge";
import { prisma } from "@/lib/db";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { objectTypeLabels } from "@/lib/pricing/types";

const openStatuses = ["NEW", "IN_PROGRESS", "SITE_VISIT_SCHEDULED"] as const;

const filters = [
  { value: "all", label: "Alle" },
  { value: "new", label: "Neu" },
  { value: "open", label: "Offen" },
  { value: "manual", label: "Manuelle Prüfung" },
  { value: "follow-up", label: "Besichtigung / Angebot" },
] as const;

type InquiryListPageProps = {
  searchParams: Promise<{
    filter?: string;
    q?: string;
    status?: string;
  }>;
};

export default async function InquiryListPage({ searchParams }: InquiryListPageProps) {
  const resolvedSearchParams = await searchParams;
  const activeFilter = filters.some((item) => item.value === resolvedSearchParams.filter)
    ? resolvedSearchParams.filter!
    : "all";
  const query = resolvedSearchParams.q?.trim() ?? "";

  const where: Prisma.InquiryWhereInput = {};

  if (activeFilter === "new") {
    where.status = "NEW";
  }

  if (activeFilter === "open") {
    where.status = {
      in: [...openStatuses],
    };
  }

  if (activeFilter === "manual") {
    where.manualReviewRequired = true;
    where.status = {
      in: [...openStatuses],
    };
  }

  if (activeFilter === "follow-up") {
    where.status = {
      in: ["SITE_VISIT_SCHEDULED", "OFFER_SENT"],
    };
  }

  if (query) {
    where.OR = [
      {
        customerName: {
          contains: query,
        },
      },
      {
        postalCode: {
          contains: query,
        },
      },
      {
        publicId: {
          contains: query,
        },
      },
    ];
  }

  const [inquiries, inquiryCount, newInquiryCount, openInquiryCount, manualReviewCount, followUpCount] =
    await Promise.all([
      prisma.inquiry.findMany({
        where,
        orderBy:
          activeFilter === "manual"
            ? [{ createdAt: "asc" }]
            : [{ manualReviewRequired: "desc" }, { createdAt: "desc" }],
      }),
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
          status: {
            in: ["SITE_VISIT_SCHEDULED", "OFFER_SENT"],
          },
        },
      }),
    ]);

  const filterCounts: Record<(typeof filters)[number]["value"], number> = {
    all: inquiryCount,
    new: newInquiryCount,
    open: openInquiryCount,
    manual: manualReviewCount,
    "follow-up": followUpCount,
  };

  return (
    <section className="panel rounded-[2rem] p-6 sm:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="eyebrow text-[var(--accent-deep)]">Anfragen</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Anfragen im Überblick</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--foreground-soft)]">
            Leads filtern, nach Namen oder PLZ suchen und offene Fälle ohne unnötige Klicks
            priorisieren.
          </p>
        </div>
        <p className="text-sm text-[var(--foreground-soft)]">
          {inquiries.length} Treffer · {inquiryCount} Einträge insgesamt
        </p>
      </div>

      {resolvedSearchParams.status === "invalid" ? (
        <div className="mt-6">
          <AdminNotice variant="error" title="Vorgang nicht gefunden">
            Die gewünschte Anfrage konnte nicht geladen oder aktualisiert werden.
          </AdminNotice>
        </div>
      ) : null}

      <div className="mt-8 flex flex-col gap-4 rounded-[1.8rem] border border-[var(--line)] bg-[var(--surface-muted)] p-4">
        <form className="flex flex-col gap-3 lg:flex-row">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Nach Name, PLZ oder Vorgangsnummer suchen"
            className="h-12 w-full rounded-2xl border border-[var(--line)] bg-white px-4 outline-none transition focus:border-[var(--accent)]"
          />
          {activeFilter !== "all" ? <input type="hidden" name="filter" value={activeFilter} /> : null}
          <button
            type="submit"
            className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--accent)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--accent-deep)]"
          >
            Suchen
          </button>
          {(query || activeFilter !== "all") ? (
            <Link
              href="/admin/anfragen"
              className="inline-flex h-12 items-center justify-center rounded-full border border-[var(--line)] bg-white px-5 text-sm font-semibold text-slate-950 transition hover:bg-[var(--surface)]"
            >
              Zurücksetzen
            </Link>
          ) : null}
        </form>

        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => {
            const isActive = activeFilter === filter.value;
            const href =
              query.length > 0
                ? `/admin/anfragen?filter=${filter.value}&q=${encodeURIComponent(query)}`
                : `/admin/anfragen?filter=${filter.value}`;

            return (
              <a
                key={filter.value}
                href={filter.value === "all" && query.length === 0 ? "/admin/anfragen" : href}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "border-[var(--accent)] bg-[var(--accent-soft)] text-slate-950"
                    : "border-[var(--line)] bg-white text-[var(--foreground-soft)] hover:bg-[var(--surface)]"
                }`}
              >
                <span>{filter.label}</span>
                <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs text-slate-950">
                  {filterCounts[filter.value]}
                </span>
              </a>
            );
          })}
        </div>
      </div>

      {query ? (
        <div className="mt-4 rounded-3xl border border-[var(--line)] bg-white px-4 py-3 text-sm leading-6 text-[var(--foreground-soft)]">
          Suche nach <span className="font-semibold text-slate-950">{query}</span>
        </div>
      ) : null}

      {inquiries.length === 0 ? (
        <div className="mt-8 rounded-[1.8rem] border border-dashed border-[var(--line)] bg-[var(--surface-muted)] px-6 py-8 text-sm leading-6 text-[var(--foreground-soft)]">
          <p className="font-semibold text-slate-950">
            {inquiryCount === 0 ? "Noch keine Anfragen gespeichert" : "Keine passenden Anfragen gefunden"}
          </p>
          <p className="mt-2">
            {inquiryCount === 0
              ? "Sobald neue Anfragen eingehen, erscheint hier die komplette Übersicht mit Kontakt, Preisrahmen und Bearbeitungsstatus."
              : "Passen Sie Filter oder Suche an, um wieder passende Vorgänge anzuzeigen."}
          </p>
          <div className="mt-4">
            <Link
              href={inquiryCount === 0 ? "/rechner" : "/admin/anfragen"}
              className="inline-flex rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
            >
              {inquiryCount === 0 ? "Zum Rechner" : "Alle Anfragen anzeigen"}
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-4 lg:hidden">
            {inquiries.map((inquiry) => (
              <article
                key={inquiry.id}
                className={`rounded-[1.8rem] border px-5 py-5 ${
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

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--foreground-soft)]">
                      Kontakt
                    </p>
                    <p className="mt-2 text-sm text-slate-950">{inquiry.customerEmail}</p>
                    <p className="text-sm text-slate-950">{inquiry.customerPhone}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--foreground-soft)]">
                      Preisrahmen
                    </p>
                    <p className="mt-2 text-base font-semibold text-slate-950">
                      {formatCurrency(inquiry.estimateMin)} bis {formatCurrency(inquiry.estimateMax)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <p className="text-xs text-[var(--foreground-soft)]">
                    Vorgang {inquiry.publicId} · {formatDateTime(inquiry.createdAt)}
                  </p>
                  {inquiry.manualReviewRequired ? <ManualReviewBadge /> : null}
                </div>
              </article>
            ))}
          </div>

          <div className="mt-8 hidden overflow-x-auto lg:block">
            <table className="min-w-full text-left text-sm">
              <thead className="text-[var(--foreground-soft)]">
                <tr>
                  <th className="pb-3 font-medium">Kunde</th>
                  <th className="pb-3 font-medium">Kontakt</th>
                  <th className="pb-3 font-medium">Objekt</th>
                  <th className="pb-3 font-medium">Preisrahmen</th>
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
                      <p className="mt-1 text-xs text-[var(--foreground-soft)]">
                        Vorgang {inquiry.publicId}
                      </p>
                    </td>
                    <td className="py-4 text-[var(--foreground-soft)]">
                      <p>{inquiry.customerPhone}</p>
                      <p className="text-xs">{inquiry.customerEmail}</p>
                    </td>
                    <td className="py-4 text-slate-950">
                      <p className="font-medium">{objectTypeLabels[inquiry.objectType]}</p>
                      <p className="text-xs text-[var(--foreground-soft)]">{inquiry.postalCode}</p>
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
        </>
      )}
    </section>
  );
}
