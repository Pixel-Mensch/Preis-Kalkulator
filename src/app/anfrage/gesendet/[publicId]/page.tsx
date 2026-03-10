import Link from "next/link";
import { notFound } from "next/navigation";

import { formatCurrency, formatDateTime } from "@/lib/format";
import { prisma } from "@/lib/db";

type SuccessPageProps = {
  params: Promise<{
    publicId: string;
  }>;
};

export default async function InquirySuccessPage({ params }: SuccessPageProps) {
  const { publicId } = await params;
  const inquiry = await prisma.inquiry.findUnique({
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
  });

  if (!inquiry) {
    notFound();
  }

  return (
    <main className="app-shell">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-5 py-12 sm:px-8">
        <div className="panel rounded-[2rem] p-8 sm:p-10">
          <p className="eyebrow text-[var(--accent-deep)]">Anfrage eingegangen</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Vielen Dank, {inquiry.customerName}.
          </h1>
          <p className="mt-4 text-base leading-7 text-[var(--foreground-soft)]">
            Deine Anfrage wurde gespeichert. Die unverbindliche Einschaetzung liegt
            aktuell bei{" "}
            <span className="font-semibold text-slate-950">
              {formatCurrency(inquiry.estimateMin)} bis {formatCurrency(inquiry.estimateMax)}
            </span>
            .
          </p>
          {inquiry.manualReviewRequired ? (
            <div className="mt-6 rounded-3xl border border-amber-300 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
              Wegen einzelner Risikofaktoren markiert das System deinen Fall fuer eine
              manuelle Pruefung. Du erhaeltst trotzdem zeitnah eine persoenliche
              Rueckmeldung.
            </div>
          ) : null}
          <dl className="mt-8 grid gap-4 rounded-3xl bg-[var(--surface-muted)] p-5 text-sm sm:grid-cols-2">
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
      </div>
    </main>
  );
}
