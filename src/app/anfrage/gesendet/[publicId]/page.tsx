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
      <main className="mx-auto max-w-4xl px-5 py-10 sm:px-8 lg:py-14">
        <div className="panel rounded-[2rem] p-8 sm:p-10">
          <p className="eyebrow text-[var(--accent-deep)]">Anfrage eingegangen</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Vielen Dank, {inquiry.customerName}.
          </h1>
          <p className="mt-4 text-base leading-7 text-[var(--foreground-soft)]">
            Ihre Anfrage wurde gespeichert. Die aktuelle unverbindliche Einschaetzung
            liegt bei{" "}
            <span className="font-semibold text-slate-950">
              {formatCurrency(inquiry.estimateMin)} bis {formatCurrency(inquiry.estimateMax)}
            </span>
            .
          </p>

          {inquiry.manualReviewRequired ? (
            <div className="mt-6 rounded-3xl border border-amber-300 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
              Ihre Anfrage enthaelt Angaben, die wir persoenlich pruefen sollten. Der
              Preisrahmen bleibt unverbindlich. Wir melden uns mit einer sorgfaeltigen
              Rueckmeldung bei Ihnen.
            </div>
          ) : (
            <div className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm leading-6 text-emerald-900">
              Ihre Angaben sind vollstaendig genug fuer eine erste Einordnung. Wir koennen
              jetzt gezielter auf Ihre Anfrage reagieren.
            </div>
          )}

          <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
            <dl className="grid gap-4 rounded-3xl bg-[var(--surface-muted)] p-5 text-sm sm:grid-cols-2">
              <div>
                <dt className="font-medium text-slate-950">Vorgangsnummer</dt>
                <dd className="mt-1 font-mono text-[var(--foreground-soft)]">
                  {inquiry.publicId}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-slate-950">Eingegangen</dt>
                <dd className="mt-1 text-[var(--foreground-soft)]">
                  {formatDateTime(inquiry.createdAt)}
                </dd>
              </div>
            </dl>

            <div className="rounded-3xl border border-[var(--line)] bg-white p-5 text-sm">
              <p className="font-semibold text-slate-950">Wie es jetzt weitergeht</p>
              <ul className="mt-3 space-y-2 leading-6 text-[var(--foreground-soft)]">
                <li>- Wir pruefen Ihre Angaben und melden uns bei Bedarf mit Rueckfragen.</li>
                <li>- Bei besonderen Faellen empfehlen wir meist eine kurze Abstimmung oder Besichtigung.</li>
                <li>- Sie erreichen uns direkt unter {companySettings.contactPhone} oder {companySettings.contactEmail}.</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/rechner"
              className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--accent)] px-6 text-sm font-semibold text-white transition hover:bg-[var(--accent-deep)]"
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
