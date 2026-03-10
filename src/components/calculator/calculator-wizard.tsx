"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { formatCurrency } from "@/lib/format";
import { calculateEstimate } from "@/lib/pricing/calculateEstimate";
import { getManualReviewReasons } from "@/lib/pricing/manualReview";
import {
  extraOptionLabels,
  extraOptions,
  fillLevelLabels,
  fillLevels,
  floorLevelLabels,
  floorLevels,
  objectTypeLabels,
  objectTypes,
  problemFlagLabels,
  problemFlags,
  type ExtraOption,
  type FillLevel,
  type FloorLevel,
  type ObjectType,
  type PricingConfig,
  type ProblemFlag,
  type WalkDistance,
  walkDistanceLabels,
  walkDistances,
} from "@/lib/pricing/types";

type WizardFormState = {
  objectType: ObjectType;
  areaSqm: string;
  roomCount: string;
  fillLevel: FillLevel;
  floorLevel: FloorLevel;
  hasElevator: boolean;
  walkDistance: WalkDistance;
  extraOptions: ExtraOption[];
  problemFlags: ProblemFlag[];
  postalCode: string;
  desiredDate: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  website: string;
};

type CalculatorWizardProps = {
  pricingConfig: PricingConfig;
  companyName: string;
  companyPhone: string;
};

const steps = [
  {
    title: "Objektdaten",
    description: "Was soll geraeumt werden und wie gross ist der Bereich?",
  },
  {
    title: "Zugang",
    description: "Wie aufwendig ist der Zugang zum Objekt?",
  },
  {
    title: "Extras",
    description: "Zusatzleistungen, Sonderfaelle und Postleitzahl.",
  },
  {
    title: "Kontakt",
    description: "Ergebnis pruefen und Anfrage absenden.",
  },
] as const;

const initialState: WizardFormState = {
  objectType: "APARTMENT",
  areaSqm: "",
  roomCount: "",
  fillLevel: "NORMAL",
  floorLevel: "GROUND",
  hasElevator: false,
  walkDistance: "SHORT",
  extraOptions: [],
  problemFlags: [],
  postalCode: "",
  desiredDate: "",
  name: "",
  phone: "",
  email: "",
  message: "",
  website: "",
};

function toggleItem<Value extends string>(currentValues: Value[], nextValue: Value) {
  return currentValues.includes(nextValue)
    ? currentValues.filter((value) => value !== nextValue)
    : [...currentValues, nextValue];
}

function buildPayload(formState: WizardFormState) {
  const areaSqm = Number.parseInt(formState.areaSqm, 10);
  const roomCount = Number.parseInt(formState.roomCount, 10);

  if (!Number.isFinite(areaSqm) || areaSqm <= 0 || !/^\d{5}$/.test(formState.postalCode)) {
    return null;
  }

  return {
    objectType: formState.objectType,
    areaSqm,
    roomCount: Number.isFinite(roomCount) && roomCount > 0 ? roomCount : undefined,
    fillLevel: formState.fillLevel,
    floorLevel: formState.floorLevel,
    hasElevator: formState.hasElevator,
    walkDistance: formState.walkDistance,
    extraOptions: formState.extraOptions,
    problemFlags: formState.problemFlags,
    postalCode: formState.postalCode,
    desiredDate: formState.desiredDate || undefined,
    name: formState.name.trim(),
    phone: formState.phone.trim(),
    email: formState.email.trim(),
    message: formState.message.trim() || undefined,
    website: formState.website.trim() || undefined,
  };
}

function canContinue(stepIndex: number, formState: WizardFormState) {
  if (stepIndex === 0) {
    return Number.parseInt(formState.areaSqm, 10) > 0;
  }

  if (stepIndex === 1) {
    return true;
  }

  if (stepIndex === 2) {
    return /^\d{5}$/.test(formState.postalCode);
  }

  const payload = buildPayload(formState);
  return Boolean(payload?.name && payload.phone && payload.email);
}

export function CalculatorWizard({
  pricingConfig,
  companyName,
  companyPhone,
}: CalculatorWizardProps) {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [formState, setFormState] = useState(initialState);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const payload = buildPayload(formState);
  const estimate = payload ? calculateEstimate(pricingConfig, payload) : null;
  const manualReviewReasons =
    payload && estimate ? getManualReviewReasons(payload, estimate) : [];

  async function handleSubmit() {
    setErrorMessage(null);

    if (!payload || !payload.name || !payload.phone || !payload.email) {
      setErrorMessage("Bitte vervollstaendige deine Kontaktdaten.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as {
        message?: string;
        inquiry?: { publicId: string };
      };

      if (!response.ok || !data.inquiry) {
        setErrorMessage(
          data.message ??
            "Die Anfrage konnte gerade nicht gespeichert werden. Bitte versuche es erneut.",
        );
        setIsSubmitting(false);
        return;
      }

      router.push(`/anfrage/gesendet/${data.inquiry.publicId}`);
      router.refresh();
    } catch {
      setErrorMessage(
        "Die Anfrage konnte gerade nicht gespeichert werden. Bitte versuche es erneut.",
      );
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
      <div className="panel overflow-hidden rounded-[2rem]">
        <div className="grid-glow relative border-b border-[var(--line)] bg-[var(--surface-muted)] px-5 py-6 sm:px-8">
          <div className="relative z-10 flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow text-[var(--accent-deep)]">{companyName}</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                Unverbindliche Kostenschaetzung in wenigen Schritten
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--foreground-soft)] sm:text-base">
                Der Rechner liefert eine erste Preisspanne. Faelle mit Sonderrisiken
                werden klar als manuelle Pruefung markiert.
              </p>
            </div>
            <div className="hidden rounded-3xl border border-[var(--line)] bg-white/80 px-4 py-3 text-right text-sm text-[var(--foreground-soft)] sm:block">
              <p className="font-medium text-slate-950">Rueckfragen?</p>
              <a href={`tel:${companyPhone}`} className="mt-1 block font-semibold text-[var(--accent-deep)]">
                {companyPhone}
              </a>
            </div>
          </div>

          <div className="relative z-10 mt-6 grid gap-3 sm:grid-cols-4">
            {steps.map((step, index) => (
              <button
                key={step.title}
                type="button"
                onClick={() => {
                  if (index <= stepIndex) {
                    setStepIndex(index);
                    setErrorMessage(null);
                  }
                }}
                aria-current={index === stepIndex ? "step" : undefined}
                className={`rounded-3xl border px-4 py-3 text-left transition ${
                  index === stepIndex
                    ? "border-[var(--accent)] bg-white text-slate-950"
                    : index < stepIndex
                      ? "border-[var(--line)] bg-white/70 text-slate-950"
                      : "border-transparent bg-white/40 text-[var(--foreground-soft)]"
                }`}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em]">
                  Schritt {index + 1}
                </p>
                <p className="mt-2 text-sm font-semibold">{step.title}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="px-5 py-6 sm:px-8 sm:py-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-950">{steps[stepIndex].title}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--foreground-soft)]">
              {steps[stepIndex].description}
            </p>
          </div>

          {stepIndex === 0 ? (
            <div className="space-y-6">
              <div>
                <label className="mb-3 block text-sm font-semibold text-slate-950">
                  Objektart
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  {objectTypes.map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFormState((current) => ({ ...current, objectType: value }))}
                      aria-pressed={formState.objectType === value}
                      className={`rounded-3xl border px-4 py-4 text-left transition ${
                        formState.objectType === value
                          ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                          : "border-[var(--line)] bg-white hover:border-[var(--accent)]/50"
                      }`}
                    >
                      <span className="text-sm font-semibold text-slate-950">
                        {objectTypeLabels[value]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-950">
                    Flaeche in m2
                  </span>
                  <input
                    inputMode="numeric"
                    type="number"
                    min="1"
                    className="h-12 w-full rounded-2xl border border-[var(--line)] bg-white px-4 outline-none transition focus:border-[var(--accent)]"
                    value={formState.areaSqm}
                    onChange={(event) =>
                      setFormState((current) => ({ ...current, areaSqm: event.target.value }))
                    }
                    placeholder="z. B. 85"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-950">
                    Zimmeranzahl (optional)
                  </span>
                  <input
                    inputMode="numeric"
                    type="number"
                    min="1"
                    className="h-12 w-full rounded-2xl border border-[var(--line)] bg-white px-4 outline-none transition focus:border-[var(--accent)]"
                    value={formState.roomCount}
                    onChange={(event) =>
                      setFormState((current) => ({ ...current, roomCount: event.target.value }))
                    }
                    placeholder="z. B. 3"
                  />
                </label>
              </div>
            </div>
          ) : null}

          {stepIndex === 1 ? (
            <div className="space-y-6">
              <div>
                <label className="mb-3 block text-sm font-semibold text-slate-950">
                  Fuellgrad
                </label>
                <div className="grid gap-3 sm:grid-cols-4">
                  {fillLevels.map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFormState((current) => ({ ...current, fillLevel: value }))}
                      aria-pressed={formState.fillLevel === value}
                      className={`rounded-3xl border px-4 py-4 text-left transition ${
                        formState.fillLevel === value
                          ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                          : "border-[var(--line)] bg-white hover:border-[var(--accent)]/50"
                      }`}
                    >
                      <span className="text-sm font-semibold text-slate-950">
                        {fillLevelLabels[value]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-950">Etage</span>
                  <select
                    className="h-12 w-full rounded-2xl border border-[var(--line)] bg-white px-4 outline-none transition focus:border-[var(--accent)]"
                    value={formState.floorLevel}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        floorLevel: event.target.value as FloorLevel,
                      }))
                    }
                  >
                    {floorLevels.map((value) => (
                      <option key={value} value={value}>
                        {floorLevelLabels[value]}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-950">
                    Laufweg
                  </span>
                  <select
                    className="h-12 w-full rounded-2xl border border-[var(--line)] bg-white px-4 outline-none transition focus:border-[var(--accent)]"
                    value={formState.walkDistance}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        walkDistance: event.target.value as WalkDistance,
                      }))
                    }
                  >
                    {walkDistances.map((value) => (
                      <option key={value} value={value}>
                        {walkDistanceLabels[value]}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-white px-4 py-4">
                <input
                  type="checkbox"
                  checked={formState.hasElevator}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      hasElevator: event.target.checked,
                    }))
                  }
                />
                <span className="text-sm font-medium text-slate-950">Aufzug vorhanden</span>
              </label>
            </div>
          ) : null}

          {stepIndex === 2 ? (
            <div className="space-y-6">
              <div>
                <label className="mb-3 block text-sm font-semibold text-slate-950">Extras</label>
                <div className="grid gap-3 sm:grid-cols-2">
                  {extraOptions.map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        setFormState((current) => ({
                          ...current,
                          extraOptions: toggleItem(current.extraOptions, value),
                        }))
                      }
                      aria-pressed={formState.extraOptions.includes(value)}
                      className={`rounded-3xl border px-4 py-4 text-left transition ${
                        formState.extraOptions.includes(value)
                          ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                          : "border-[var(--line)] bg-white hover:border-[var(--accent)]/50"
                      }`}
                    >
                      <span className="text-sm font-semibold text-slate-950">
                        {extraOptionLabels[value]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-3 block text-sm font-semibold text-slate-950">
                  Sonderfaelle / Problemflags
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  {problemFlags.map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        setFormState((current) => ({
                          ...current,
                          problemFlags: toggleItem(current.problemFlags, value),
                        }))
                      }
                      aria-pressed={formState.problemFlags.includes(value)}
                      className={`rounded-3xl border px-4 py-4 text-left transition ${
                        formState.problemFlags.includes(value)
                          ? "border-amber-500 bg-amber-50"
                          : "border-[var(--line)] bg-white hover:border-amber-300"
                      }`}
                    >
                      <span className="text-sm font-semibold text-slate-950">
                        {problemFlagLabels[value]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-950">PLZ</span>
                  <input
                    inputMode="numeric"
                    maxLength={5}
                    className="h-12 w-full rounded-2xl border border-[var(--line)] bg-white px-4 outline-none transition focus:border-[var(--accent)]"
                    value={formState.postalCode}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        postalCode: event.target.value.replace(/\D/g, "").slice(0, 5),
                      }))
                    }
                    placeholder="45127"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-950">
                    Wunschdatum (optional)
                  </span>
                  <input
                    type="date"
                    className="h-12 w-full rounded-2xl border border-[var(--line)] bg-white px-4 outline-none transition focus:border-[var(--accent)]"
                    value={formState.desiredDate}
                    onChange={(event) =>
                      setFormState((current) => ({ ...current, desiredDate: event.target.value }))
                    }
                  />
                </label>
              </div>
            </div>
          ) : null}

          {stepIndex === 3 ? (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-950">Name</span>
                  <input
                    className="h-12 w-full rounded-2xl border border-[var(--line)] bg-white px-4 outline-none transition focus:border-[var(--accent)]"
                    value={formState.name}
                    onChange={(event) =>
                      setFormState((current) => ({ ...current, name: event.target.value }))
                    }
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-950">
                    Telefon
                  </span>
                  <input
                    className="h-12 w-full rounded-2xl border border-[var(--line)] bg-white px-4 outline-none transition focus:border-[var(--accent)]"
                    value={formState.phone}
                    onChange={(event) =>
                      setFormState((current) => ({ ...current, phone: event.target.value }))
                    }
                  />
                </label>
              </div>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-950">E-Mail</span>
                <input
                  type="email"
                  className="h-12 w-full rounded-2xl border border-[var(--line)] bg-white px-4 outline-none transition focus:border-[var(--accent)]"
                  value={formState.email}
                  onChange={(event) =>
                    setFormState((current) => ({ ...current, email: event.target.value }))
                  }
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-950">
                  Hinweise (optional)
                </span>
                <textarea
                  rows={5}
                  className="w-full rounded-3xl border border-[var(--line)] bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]"
                  value={formState.message}
                  onChange={(event) =>
                    setFormState((current) => ({ ...current, message: event.target.value }))
                  }
                  placeholder="Zugang, Parkmoeglichkeit, besondere Hinweise ..."
                />
              </label>
              <label className="hidden">
                Website
                <input
                  tabIndex={-1}
                  autoComplete="off"
                  value={formState.website}
                  onChange={(event) =>
                    setFormState((current) => ({ ...current, website: event.target.value }))
                  }
                />
              </label>
            </div>
          ) : null}

          {errorMessage ? (
            <div className="mt-6 rounded-3xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
              {errorMessage}
            </div>
          ) : null}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-[var(--foreground-soft)]">
              Schritt {stepIndex + 1} von {steps.length}
            </div>
            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  setStepIndex((current) => Math.max(0, current - 1));
                  setErrorMessage(null);
                }}
                disabled={stepIndex === 0}
                className="inline-flex h-12 items-center justify-center rounded-full border border-[var(--line)] px-6 text-sm font-semibold text-slate-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Zurueck
              </button>
              {stepIndex < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (!canContinue(stepIndex, formState)) {
                      setErrorMessage("Bitte fuelle die benoetigten Angaben dieses Schritts aus.");
                      return;
                    }

                    setErrorMessage(null);
                    setStepIndex((current) => Math.min(steps.length - 1, current + 1));
                  }}
                  className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--accent)] px-6 text-sm font-semibold text-white transition hover:bg-[var(--accent-deep)]"
                >
                  Weiter
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--accent)] px-6 text-sm font-semibold text-white transition hover:bg-[var(--accent-deep)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Wird gesendet ..." : "Anfrage absenden"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <aside className="space-y-5 lg:sticky lg:top-24">
        <div className="panel rounded-[2rem] p-6">
          <p className="eyebrow text-[var(--accent-deep)]">Live-Einschaetzung</p>
          {estimate ? (
            <>
              <div className="mt-4 rounded-3xl bg-[var(--surface-muted)] px-5 py-5">
                <p className="text-sm text-[var(--foreground-soft)]">Aktuelle Preisspanne</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                  {formatCurrency(estimate.rangeMin)} bis {formatCurrency(estimate.rangeMax)}
                </p>
                <p className="mt-3 text-sm leading-6 text-[var(--foreground-soft)]">
                  Unverbindliche Einschaetzung auf Basis deiner Eingaben.
                </p>
              </div>
              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[var(--foreground-soft)]">Objektbasis</dt>
                  <dd className="font-medium text-slate-950">{formatCurrency(estimate.basePrice)}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[var(--foreground-soft)]">Effektive Flaeche</dt>
                  <dd className="font-medium text-slate-950">{estimate.effectiveArea} m2</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[var(--foreground-soft)]">Anfahrtszone</dt>
                  <dd className="font-medium text-slate-950">{estimate.travelZoneLabel}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[var(--foreground-soft)]">Zwischensumme</dt>
                  <dd className="font-medium text-slate-950">{formatCurrency(estimate.subtotal)}</dd>
                </div>
              </dl>
              {manualReviewReasons.length > 0 ? (
                <div className="mt-5 rounded-3xl border border-amber-300 bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-900">
                  <p className="font-semibold">Manuelle Pruefung empfohlen</p>
                  <ul className="mt-2 space-y-1">
                    {manualReviewReasons.map((reason) => (
                      <li key={reason.code}>- {reason.message}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="mt-5 rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm leading-6 text-emerald-900">
                  Die Angaben wirken fuer eine automatische Ersteinschaetzung plausibel.
                </div>
              )}
            </>
          ) : (
            <div className="mt-4 rounded-3xl bg-[var(--surface-muted)] px-5 py-5 text-sm leading-6 text-[var(--foreground-soft)]">
              Gib mindestens Objektart, Flaeche und PLZ an. Dann berechnet der Rechner
              sofort eine erste Preisspanne.
            </div>
          )}
        </div>
        <div className="panel rounded-[2rem] p-6 text-sm leading-6 text-[var(--foreground-soft)]">
          <p className="font-semibold text-slate-950">Wichtiger Hinweis</p>
          <p className="mt-3">
            Diese Ausgabe ist eine unverbindliche Kostenschaetzung. Ein genauer Preis kann
            nach Sichtung vor Ort oder nach genauerer Pruefung abweichen.
          </p>
        </div>
      </aside>
    </div>
  );
}
