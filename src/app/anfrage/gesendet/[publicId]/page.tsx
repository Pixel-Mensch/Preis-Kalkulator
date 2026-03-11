import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteShell } from "@/components/site-shell";
import { getCompanySettings } from "@/lib/company";
import { prisma } from "@/lib/db";
import { formatCurrency, formatDateTime } from "@/lib/format";

type SuccessPageProps = {
  params: Promise<{
    publicId: string;
  }>;
};

export default async function InquirySuccessPage({ params }: SuccessPageProps) {
  const { publicId } = await params;
  const [companySettings, inquiry] = await Promise.all([
    getCompanySettings(),
    prisma.inquiry.findUnique({
      where: {
        publicId,
      },
      select: {
        publicId: true,
        customerName: true,
        estimateMin: true,
        estimateMax: true,
        manualReviewRequired: true,
        createdAt: true,
      },
    }),
  ]);

  if (!inquiry) {
    notFound();
  }

  const nextSteps = [
    `Wir prüfen Ihre Angaben und melden uns bei Bedarf mit Rückfragen.`,
    `Bei besonderen Fällen empfehlen wir meist eine kurze Abstimmung oder Besichtigung.`,
    `Sie erreichen uns direkt unter ${companySettings.contactPhone} oder ${companySettings.contactEmail}.`,
  ];

  return (
    <SiteShell
      companyName={companySettings.companyName}
      contactPhone={companySettings.contactPhone}
      contactEmail={companySettings.contactEmail}
      website={companySettings.website}
      city={companySettings.city}
      serviceAreaNote={companySettings.serviceAreaNote}
      supportHours={companySettings.supportHours}
    >
      <main className="mx-auto max-w-4xl px-5 py-10 sm:px-8 lg:py-16">
        <div className="panel rounded-[2rem] p-8 sm:p-10">
          {/* Kopfzeile */}
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)]">
              <svg
                className="h-6 w-6 text-emerald-600"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M5 13l4 4L19 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <p className="eyebrow text-[var(--accent-deep)]">
                Anfrage eingegangen
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                Vielen Dank, {inquiry.customerName}.
              </h1>
            </div>
          </div>

          <p className="mt-6 text-base leading-7 text-[var(--foreground-soft)]">
            Ihre Anfrage wurde gespeichert. Die aktuelle unverbindliche
            Einschätzung liegt bei{" "}
            <span className="font-semibold text-slate-950">
              {formatCurrency(inquiry.estimateMin)} bis{" "}
              {formatCurrency(inquiry.estimateMax)}
            </span>
            .
          </p>

          {inquiry.manualReviewRequired ? (
            <div className="mt-5 flex items-start gap-3 rounded-3xl border border-amber-300 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
              <svg
                className="mt-0.5 h-4 w-4 shrink-0 text-amber-600"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M8 2L14 13H2L8 2z"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8 7v3M8 11.5v.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <span>
                Ihre Anfrage enthält Angaben, die wir persönlich prüfen sollten.
                Der Preisrahmen bleibt unverbindlich. Wir melden uns mit einer
                sorgfältigen Rückmeldung bei Ihnen.
              </span>
            </div>
          ) : (
            <div className="mt-5 flex items-start gap-3 rounded-3xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm leading-6 text-emerald-900">
              <svg
                className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M3 8.5L6.5 12L13 5"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>
                Ihre Angaben sind vollständig genug für eine erste Einordnung.
                Wir können jetzt gezielter auf Ihre Anfrage reagieren.
              </span>
            </div>
          )}

          {/* Info-Raster */}
          <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
            <dl className="grid gap-4 rounded-3xl bg-[var(--surface-muted)] p-5 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--foreground-soft)]">
                  Vorgangsnummer
                </dt>
                <dd className="mt-1.5 font-mono text-[var(--foreground)]">
                  {inquiry.publicId}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--foreground-soft)]">
                  Eingegangen
                </dt>
                <dd className="mt-1.5 text-[var(--foreground)]">
                  {formatDateTime(inquiry.createdAt)}
                </dd>
              </div>
            </dl>

            <div className="rounded-3xl border border-[var(--line)] bg-white p-5 text-sm">
              <p className="font-semibold text-slate-950">
                Wie es jetzt weitergeht
              </p>
              <ul className="mt-3 space-y-2.5 leading-6 text-[var(--foreground-soft)]">
                {nextSteps.map((step, index) => (
                  <li key={index} className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-xs font-bold text-[var(--accent-deep)]">
                      {index + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ul>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <a
                  href={`tel:${companySettings.contactPhone}`}
                  className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--line)] px-4 text-sm font-semibold text-slate-950 transition hover:bg-[var(--surface-muted)]"
                >
                  Direkt anrufen
                </a>
                <a
                  href={`mailto:${companySettings.contactEmail}`}
                  className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--line)] px-4 text-sm font-semibold text-slate-950 transition hover:bg-[var(--surface-muted)]"
                >
                  E-Mail senden
                </a>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/rechner"
              className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--accent)] px-6 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(199,100,45,0.3)] transition hover:bg-[var(--accent-deep)]"
            >
              Neue Anfrage starten
            </Link>
            <Link
              href="/"
              className="inline-flex h-12 items-center justify-center rounded-full border border-[var(--line)] px-6 text-sm font-semibold text-slate-950 transition hover:bg-white"
            >
              Zur Startseite
            </Link>
          </div>
        </div>
      </main>
    </SiteShell>
  );
}
