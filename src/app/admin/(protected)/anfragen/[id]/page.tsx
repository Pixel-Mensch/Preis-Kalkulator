import Link from "next/link";
import { notFound } from "next/navigation";

import { updateInquiryStatusAction } from "@/app/admin/(protected)/actions";
import { AdminNotice } from "@/components/admin/admin-notice";
import { ManualReviewBadge } from "@/components/admin/manual-review-badge";
import { StatusBadge } from "@/components/admin/status-badge";
import { prisma } from "@/lib/db";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/format";
import {
  parseJsonValue,
  type InquiryCalculationSnapshot,
} from "@/lib/inquiries";
import {
  additionalAreaLabels,
  extraOptionLabels,
  fillLevelLabels,
  floorLevelLabels,
  inquiryStatusLabels,
  inquiryStatuses,
  objectTypeLabels,
  problemFlagLabels,
  walkDistanceLabels,
} from "@/lib/pricing/types";

type InquiryDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    status?: string;
  }>;
};

export default async function InquiryDetailPage({
  params,
  searchParams,
}: InquiryDetailPageProps) {
  const [{ id }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const inquiry = await prisma.inquiry.findUnique({
    where: {
      id,
    },
  });

  if (!inquiry) {
    notFound();
  }

  const snapshot = parseJsonValue<InquiryCalculationSnapshot>(inquiry.calculationSnapshot);
  const extraOptions = parseJsonValue<string[]>(inquiry.extraOptions);
  const problemFlags = parseJsonValue<string[]>(inquiry.problemFlags);
  const manualReviewReasons = parseJsonValue<Array<{ code: string; message: string }>>(
    inquiry.manualReviewReasons,
  );
  const additionalAreas = snapshot.input.additionalAreas ?? [];
  const extraTotal = snapshot.estimate.extraSurcharges.reduce(
    (sum, surcharge) => sum + surcharge.amount,
    0,
  );

  return (
    <div className="space-y-6">
      <section className="panel rounded-[2rem] p-6 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <Link
              href="/admin/anfragen"
              className="text-sm font-semibold text-[var(--accent-deep)]"
            >
              Zurueck zur Liste
            </Link>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-balance">
              {inquiry.customerName}
            </h1>
            <p className="mt-2 text-sm text-[var(--foreground-soft)]">
              Vorgangsnummer {inquiry.publicId} - Eingegangen am{" "}
              {formatDateTime(inquiry.createdAt)}
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--foreground-soft)]">
              Strukturierte Anfrage mit gespeichertem Kalkulations-Snapshot. Spaetere
              Preisupdates veraendern diesen Vorgang nicht rueckwirkend.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <StatusBadge status={inquiry.status} />
            {inquiry.manualReviewRequired ? <ManualReviewBadge /> : null}
            <a
              href={`/api/admin/inquiries/${inquiry.id}/pdf`}
              className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--accent)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--accent-deep)]"
            >
              PDF herunterladen
            </a>
          </div>
        </div>
      </section>

      {resolvedSearchParams.status === "updated" ? (
        <AdminNotice variant="success">Status erfolgreich gespeichert.</AdminNotice>
      ) : null}
      {resolvedSearchParams.status === "invalid" ? (
        <AdminNotice variant="error">
          Status konnte nicht gespeichert werden. Bitte Eingaben pruefen und erneut versuchen.
        </AdminNotice>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <article className="panel rounded-[2rem] p-6">
            <h2 className="text-xl font-semibold text-slate-950">Kontakt und Termin</h2>
            <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-[var(--foreground-soft)]">Telefon</dt>
                <dd className="mt-1 font-medium text-slate-950">{inquiry.customerPhone}</dd>
              </div>
              <div>
                <dt className="text-[var(--foreground-soft)]">E-Mail</dt>
                <dd className="mt-1 font-medium text-slate-950">{inquiry.customerEmail}</dd>
              </div>
              <div>
                <dt className="text-[var(--foreground-soft)]">PLZ</dt>
                <dd className="mt-1 font-medium text-slate-950">{inquiry.postalCode}</dd>
              </div>
              <div>
                <dt className="text-[var(--foreground-soft)]">Wunschdatum</dt>
                <dd className="mt-1 font-medium text-slate-950">
                  {formatDate(inquiry.desiredDate)}
                </dd>
              </div>
            </dl>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <a
                href={`tel:${inquiry.customerPhone}`}
                className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--line)] px-4 text-sm font-semibold text-slate-950 transition hover:bg-white"
              >
                Kunde anrufen
              </a>
              <a
                href={`mailto:${inquiry.customerEmail}`}
                className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--line)] px-4 text-sm font-semibold text-slate-950 transition hover:bg-white"
              >
                E-Mail schreiben
              </a>
            </div>
            {inquiry.message ? (
              <div className="mt-5 rounded-3xl bg-[var(--surface-muted)] px-5 py-4 text-sm leading-6 text-[var(--foreground-soft)]">
                <p className="font-semibold text-slate-950">Hinweis des Kunden</p>
                <p className="mt-2">{inquiry.message}</p>
              </div>
            ) : null}
          </article>

          <article className="panel rounded-[2rem] p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Objekt und Aufwand</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--foreground-soft)]">
                  Zusammenfassung der Anfrage mit allen Angaben, die in die
                  Kostenschaetzung eingeflossen sind.
                </p>
              </div>
              <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-muted)] px-4 py-3 text-sm">
                <p className="text-[var(--foreground-soft)]">Kostenschaetzung</p>
                <p className="mt-1 text-lg font-semibold text-slate-950">
                  {formatCurrency(inquiry.estimateMin)} bis {formatCurrency(inquiry.estimateMax)}
                </p>
              </div>
            </div>

            <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <dt className="text-[var(--foreground-soft)]">Hauptobjekt</dt>
                <dd className="mt-1 font-medium text-slate-950">
                  {objectTypeLabels[inquiry.objectType]}
                </dd>
              </div>
              <div>
                <dt className="text-[var(--foreground-soft)]">Zusatzbereiche</dt>
                <dd className="mt-1 font-medium text-slate-950">
                  {additionalAreas.length > 0
                    ? additionalAreas.map((value) => additionalAreaLabels[value]).join(", ")
                    : "Keine"}
                </dd>
              </div>
              <div>
                <dt className="text-[var(--foreground-soft)]">Flaeche</dt>
                <dd className="mt-1 font-medium text-slate-950">{inquiry.areaSqm} m2</dd>
              </div>
              <div>
                <dt className="text-[var(--foreground-soft)]">Zimmer</dt>
                <dd className="mt-1 font-medium text-slate-950">
                  {inquiry.roomCount ?? "Nicht angegeben"}
                </dd>
              </div>
              <div>
                <dt className="text-[var(--foreground-soft)]">Fuellgrad</dt>
                <dd className="mt-1 font-medium text-slate-950">
                  {fillLevelLabels[inquiry.fillLevel]}
                </dd>
              </div>
              <div>
                <dt className="text-[var(--foreground-soft)]">Etage / Aufzug</dt>
                <dd className="mt-1 font-medium text-slate-950">
                  {floorLevelLabels[inquiry.floorLevel]} /{" "}
                  {inquiry.hasElevator ? "Aufzug vorhanden" : "kein Aufzug"}
                </dd>
              </div>
              <div>
                <dt className="text-[var(--foreground-soft)]">Laufweg</dt>
                <dd className="mt-1 font-medium text-slate-950">
                  {walkDistanceLabels[inquiry.walkDistance]}
                </dd>
              </div>
              <div>
                <dt className="text-[var(--foreground-soft)]">Anfahrtszone</dt>
                <dd className="mt-1 font-medium text-slate-950">
                  {snapshot.estimate.travelZoneLabel}
                </dd>
              </div>
              <div>
                <dt className="text-[var(--foreground-soft)]">Preisprofil</dt>
                <dd className="mt-1 font-medium text-slate-950">
                  {snapshot.pricingConfig.profileName}
                </dd>
              </div>
              <div>
                <dt className="text-[var(--foreground-soft)]">Snapshot erstellt</dt>
                <dd className="mt-1 font-medium text-slate-950">
                  {formatDateTime(snapshot.createdAt)}
                </dd>
              </div>
            </dl>
          </article>

          <article className="panel rounded-[2rem] p-6">
            <h2 className="text-xl font-semibold text-slate-950">Kostenaufschluesselung</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--foreground-soft)]">
              Diese Aufteilung stammt aus dem gespeicherten Kalkulations-Snapshot und
              bleibt fuer diesen Vorgang unveraendert.
            </p>

            <div className="mt-6 grid gap-3 rounded-3xl bg-[var(--surface-muted)] p-5 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[var(--foreground-soft)]">Objektbasis</span>
                <span className="font-medium text-slate-950">
                  {formatCurrency(snapshot.estimate.basePrice)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-[var(--foreground-soft)]">Effektive Flaeche</span>
                <span className="font-medium text-slate-950">
                  {snapshot.estimate.effectiveArea} m2
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-[var(--foreground-soft)]">Kosten effektive Flaeche</span>
                <span className="font-medium text-slate-950">
                  {formatCurrency(snapshot.estimate.effectiveAreaCost)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-[var(--foreground-soft)]">Etagenaufschlag</span>
                <span className="font-medium text-slate-950">
                  {formatCurrency(snapshot.estimate.floorSurcharge)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-[var(--foreground-soft)]">Laufweg</span>
                <span className="font-medium text-slate-950">
                  {formatCurrency(snapshot.estimate.walkDistanceSurcharge)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-[var(--foreground-soft)]">Anfahrtszone</span>
                <span className="font-medium text-slate-950">
                  {formatCurrency(snapshot.estimate.travelZoneSurcharge)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-[var(--foreground-soft)]">Extras gesamt</span>
                <span className="font-medium text-slate-950">{formatCurrency(extraTotal)}</span>
              </div>
              {snapshot.estimate.extraSurcharges.map((extra) => (
                <div key={extra.code} className="flex items-center justify-between gap-4">
                  <span className="pl-3 text-[var(--foreground-soft)]">
                    {extra.label}
                  </span>
                  <span className="font-medium text-slate-950">
                    {formatCurrency(extra.amount)}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between gap-4">
                <span className="text-[var(--foreground-soft)]">Zwischensumme vor Mindestwert</span>
                <span className="font-medium text-slate-950">
                  {formatCurrency(snapshot.estimate.subtotalBeforeMinimum)}
                </span>
              </div>
              {snapshot.estimate.minimumOrderApplied ? (
                <div className="rounded-3xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
                  Der Mindestauftragswert wurde auf diese Anfrage angewendet.
                </div>
              ) : null}
              <div className="flex items-center justify-between gap-4 border-t border-[var(--line)] pt-3">
                <span className="font-semibold text-slate-950">Kalkulationswert</span>
                <span className="font-semibold text-slate-950">
                  {formatCurrency(snapshot.estimate.subtotal)}
                </span>
              </div>
            </div>
          </article>

          <article className="panel rounded-[2rem] p-6">
            <h2 className="text-xl font-semibold text-slate-950">Extras und Hinweise</h2>
            <div className="mt-5 grid gap-6 md:grid-cols-2">
              <div>
                <p className="text-sm font-semibold text-slate-950">Extras</p>
                <ul className="mt-3 space-y-2 text-sm text-[var(--foreground-soft)]">
                  {extraOptions.length > 0 ? (
                    extraOptions.map((value) => (
                      <li key={value}>
                        - {extraOptionLabels[value as keyof typeof extraOptionLabels]}
                      </li>
                    ))
                  ) : (
                    <li>Keine Extras gewaehlt.</li>
                  )}
                </ul>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-950">Problemflags</p>
                <ul className="mt-3 space-y-2 text-sm text-[var(--foreground-soft)]">
                  {problemFlags.length > 0 ? (
                    problemFlags.map((value) => (
                      <li key={value}>
                        - {problemFlagLabels[value as keyof typeof problemFlagLabels]}
                      </li>
                    ))
                  ) : (
                    <li>Keine Problemflags angegeben.</li>
                  )}
                </ul>
              </div>
            </div>
            {manualReviewReasons.length > 0 ? (
              <div className="mt-6 rounded-3xl border border-amber-300 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
                <p className="font-semibold">Gruende fuer manuelle Pruefung</p>
                <ul className="mt-2 space-y-1">
                  {manualReviewReasons.map((reason) => (
                    <li key={reason.code}>- {reason.message}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </article>
        </div>

        <aside className="space-y-6">
          <section className="panel rounded-[2rem] p-6">
            <h2 className="text-xl font-semibold text-slate-950">Status aendern</h2>
            <form action={updateInquiryStatusAction} className="mt-5 space-y-4">
              <input type="hidden" name="inquiryId" value={inquiry.id} />
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-950">Status</span>
                <select
                  name="status"
                  defaultValue={inquiry.status}
                  className="h-12 w-full rounded-2xl border border-[var(--line)] bg-white px-4 outline-none transition focus:border-[var(--accent)]"
                >
                  {inquiryStatuses.map((status) => (
                    <option key={status} value={status}>
                      {inquiryStatusLabels[status]}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="submit"
                className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[var(--accent)] px-6 text-sm font-semibold text-white transition hover:bg-[var(--accent-deep)]"
              >
                Status speichern
              </button>
            </form>
          </section>

          <section className="panel rounded-[2rem] p-6">
            <h2 className="text-xl font-semibold text-slate-950">Demo- und PDF-Hinweis</h2>
            <div className="mt-4 space-y-3 text-sm leading-6 text-[var(--foreground-soft)]">
              <p>
                Das PDF zieht dieselben Kontakt- und Kalkulationsdaten wie diese
                Detailansicht.
              </p>
              <p>
                Ideal fuer Vorfuehrungen: Preisprofil anpassen, neue Anfrage anlegen und
                diesen Snapshot mit dem naechsten Vorgang vergleichen.
              </p>
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}
