"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { cn, formatCurrency } from "@/lib/format";
import { calculateEstimate } from "@/lib/pricing/calculateEstimate";
import { getManualReviewReasons } from "@/lib/pricing/manualReview";
import {
  additionalAreaLabels,
  additionalAreaOptions,
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
  type AdditionalArea,
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
  additionalAreas: AdditionalArea[];
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
  companyEmail: string;
  serviceAreaNote: string;
  estimateFootnote: string;
};

const steps = [
  {
    title: "Objekt und Aufwand",
    description:
      "Hauptobjekt, Zusatzbereiche und die wichtigsten Angaben für die Ersteinschätzung.",
  },
  {
    title: "Kontakt und Anfrage",
    description:
      "Zusammenfassung prüfen und die unverbindliche Anfrage in einem Schritt absenden.",
  },
] as const;

const initialState: WizardFormState = {
  objectType: "APARTMENT",
  additionalAreas: [],
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

function addUniqueItem<Value extends string>(currentValues: Value[], nextValue: Value) {
  return currentValues.includes(nextValue) ? currentValues : [...currentValues, nextValue];
}

function removeItem<Value extends string>(currentValues: Value[], valueToRemove: Value) {
  return currentValues.filter((value) => value !== valueToRemove);
}

function buildPayload(formState: WizardFormState) {
  const areaSqm = Number.parseInt(formState.areaSqm, 10);
  const roomCount = Number.parseInt(formState.roomCount, 10);
  const normalizedAdditionalAreas = formState.additionalAreas.filter(
    (value) => value !== formState.objectType,
  );

  if (!Number.isFinite(areaSqm) || areaSqm <= 0 || !/^\d{5}$/.test(formState.postalCode)) {
    return null;
  }

  return {
    objectType: formState.objectType,
    additionalAreas: normalizedAdditionalAreas,
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
    return Number.parseInt(formState.areaSqm, 10) > 0 && /^\d{5}$/.test(formState.postalCode);
  }

  const payload = buildPayload(formState);
  return Boolean(payload?.name && payload.phone && payload.email);
}

function getSelectClassName() {
  return "h-12 w-full rounded-2xl border border-[var(--line)] bg-white px-4 text-sm outline-none transition focus:border-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60";
}

export function CalculatorWizard({
  pricingConfig,
  companyName,
  companyPhone,
  companyEmail,
  serviceAreaNote,
  estimateFootnote,
}: CalculatorWizardProps) {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [formState, setFormState] = useState(initialState);
  const [additionalAreaDraft, setAdditionalAreaDraft] = useState<AdditionalArea | "">("");
  const [extraOptionDraft, setExtraOptionDraft] = useState<ExtraOption | "">("");
  const [problemFlagDraft, setProblemFlagDraft] = useState<ProblemFlag | "">("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const payload = buildPayload(formState);
  const estimate = payload ? calculateEstimate(pricingConfig, payload) : null;
  const manualReviewReasons =
    payload && estimate ? getManualReviewReasons(payload, estimate) : [];

  const selectedAdditionalAreaLabels = (payload?.additionalAreas ?? []).map(
    (value) => additionalAreaLabels[value],
  );
  const selectedExtraLabels = formState.extraOptions.map((value) => extraOptionLabels[value]);
  const selectedProblemFlagLabels = formState.problemFlags.map(
    (value) => problemFlagLabels[value],
  );
  const progressPercent = Math.round(((stepIndex + 1) / steps.length) * 100);
  const stepReady = canContinue(stepIndex, formState);
  const stepCtaHint =
    stepIndex === 0
      ? "Für den nächsten Schritt brauchen wir Hauptobjekt, Fläche und eine gültige PLZ."
      : "Zum Absenden brauchen wir Name, Telefon und E-Mail.";

  async function handleSubmit() {
    setErrorMessage(null);

    if (!payload || !payload.name || !payload.phone || !payload.email) {
      setErrorMessage("Bitte vervollständigen Sie Ihre Kontaktdaten.");
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

      if (response.status === 409 && data.inquiry?.publicId) {
        router.push(`/anfrage/gesendet/${data.inquiry.publicId}`);
        router.refresh();
        return;
      }

      if (!response.ok || !data.inquiry) {
        setErrorMessage(
          data.message ??
            "Die Anfrage konnte gerade nicht gespeichert werden. Bitte versuchen Sie es erneut.",
        );
        setIsSubmitting(false);
        return;
      }

      router.push(`/anfrage/gesendet/${data.inquiry.publicId}`);
      router.refresh();
    } catch {
      setErrorMessage(
        "Die Anfrage konnte gerade nicht gespeichert werden. Bitte versuchen Sie es erneut.",
      );
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
      <div className="panel overflow-hidden rounded-[2rem]">
        <div className="border-b border-[var(--line)] bg-[var(--surface-muted)] px-5 py-6 sm:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <p className="eyebrow text-[var(--accent-deep)]">{companyName}</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                Preisrahmen kompakt anfragen
              </h1>
              <p className="mt-3 text-sm leading-6 text-[var(--foreground-soft)] sm:text-base">
                In zwei kurzen Schritten erhalten Sie eine unverbindliche
                Kostenschätzung und senden uns gleichzeitig eine strukturierte Anfrage.
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--line)] bg-white/80 px-4 py-3 text-sm leading-6 text-[var(--foreground-soft)]">
              <p className="font-medium text-slate-950">Direkter Kontakt</p>
              <a
                href={`tel:${companyPhone}`}
                className="mt-1 block font-semibold text-[var(--accent-deep)]"
              >
                {companyPhone}
              </a>
              <a
                href={`mailto:${companyEmail}`}
                className="block text-xs font-medium text-[var(--foreground-soft)]"
              >
                {companyEmail}
              </a>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
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
                className={cn(
                  "rounded-3xl border px-4 py-3 text-left transition",
                  index === stepIndex
                    ? "border-[var(--accent)] bg-white text-slate-950 shadow-[0_16px_30px_rgba(199,100,45,0.12)]"
                    : index < stepIndex
                      ? "border-[var(--line)] bg-white/80 text-slate-950"
                      : "border-transparent bg-white/40 text-[var(--foreground-soft)]",
                )}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                      index === stepIndex
                        ? "bg-[var(--accent)] text-white"
                        : index < stepIndex
                          ? "bg-[var(--accent-soft)] text-[var(--accent-deep)]"
                          : "bg-white/85 text-[var(--foreground-soft)]",
                    )}
                  >
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em]">
                      Schritt {index + 1}
                    </p>
                    <p className="mt-1 text-sm font-semibold">{step.title}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div
            className="mt-5 rounded-3xl border border-[var(--line)] bg-white/75 px-4 py-4"
            aria-live="polite"
          >
            <div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--foreground-soft)]">
              <span>Fortschritt</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--surface)]">
              <div
                className="progress-bar h-full rounded-full bg-[linear-gradient(90deg,var(--accent),var(--accent-deep))]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="mt-3 text-xs leading-5 text-[var(--foreground-soft)]">
              {stepIndex === 0
                ? "Zuerst die Eckdaten zum Objekt und Aufwand erfassen."
                : "Jetzt die Kontaktdaten ergänzen und die Anfrage prüfen."}
            </p>
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
              <section className="rounded-[1.8rem] border border-[var(--line)] bg-[var(--surface-muted)] p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">1. Objekt festlegen</p>
                    <p className="mt-1 text-sm leading-6 text-[var(--foreground-soft)]">
                      Hauptobjekt auswählen und zusätzliche Bereiche ergänzen, falls Keller,
                      Dachboden oder Garage mit betroffen sind.
                    </p>
                  </div>
                  <span className="rounded-full border border-[var(--line)] bg-white px-3 py-1 text-xs font-semibold text-[var(--foreground-soft)]">
                    Pflicht: Objektart
                  </span>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-950">
                      Hauptobjekt
                    </span>
                    <select
                      className={getSelectClassName()}
                      value={formState.objectType}
                      onChange={(event) =>
                        setFormState((current) => ({
                          ...current,
                          objectType: event.target.value as ObjectType,
                          additionalAreas: current.additionalAreas.filter(
                            (value) => value !== event.target.value,
                          ),
                        }))
                      }
                    >
                      {objectTypes.map((value) => (
                        <option key={value} value={value}>
                          {objectTypeLabels[value]}
                        </option>
                      ))}
                    </select>
                    <span className="mt-2 block text-xs leading-5 text-[var(--foreground-soft)]">
                      Bitte den Bereich wählen, der den Hauptaufwand bestimmt.
                    </span>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-950">
                      Zusätzliche Bereiche
                    </span>
                    <select
                      className={getSelectClassName()}
                      value={additionalAreaDraft}
                      onChange={(event) => {
                        const nextValue = event.target.value as AdditionalArea | "";
                        setAdditionalAreaDraft(nextValue);

                        if (!nextValue || nextValue === formState.objectType) {
                          return;
                        }

                        setFormState((current) => ({
                          ...current,
                          additionalAreas: addUniqueItem(current.additionalAreas, nextValue),
                        }));
                        setAdditionalAreaDraft("");
                      }}
                    >
                      <option value="">Zusatzbereich auswählen</option>
                      {additionalAreaOptions
                        .filter((value) => value !== formState.objectType)
                        .map((value) => (
                          <option key={value} value={value}>
                            {additionalAreaLabels[value]}
                          </option>
                        ))}
                    </select>
                    <span className="mt-2 block text-xs leading-5 text-[var(--foreground-soft)]">
                      Zum Beispiel Keller, Dachboden oder Garage.
                    </span>
                  </label>
                </div>

                {selectedAdditionalAreaLabels.length > 0 ? (
                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--foreground-soft)]">
                      Aktuell ergänzt
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {payload?.additionalAreas.map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() =>
                            setFormState((current) => ({
                              ...current,
                              additionalAreas: removeItem(current.additionalAreas, value),
                            }))
                          }
                          className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white px-3 py-2 text-sm text-slate-950 shadow-[0_10px_18px_rgba(37,45,57,0.04)]"
                        >
                          {additionalAreaLabels[value]}
                          <span className="text-[var(--foreground-soft)]">x</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </section>

              <section className="rounded-[1.8rem] border border-[var(--line)] bg-white p-5">
                <p className="text-sm font-semibold text-slate-950">2. Aufwand und Zugang</p>
                <p className="mt-1 text-sm leading-6 text-[var(--foreground-soft)]">
                  Je genauer Fläche, Füllgrad und Zugang beschrieben sind, desto sinnvoller
                  fällt die erste Einschätzung aus.
                </p>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-950">
                      Gesamtfläche in m²
                    </span>
                    <input
                      inputMode="numeric"
                      type="number"
                      min="1"
                      required
                      className={getSelectClassName()}
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
                      className={getSelectClassName()}
                      value={formState.roomCount}
                      onChange={(event) =>
                        setFormState((current) => ({ ...current, roomCount: event.target.value }))
                      }
                      placeholder="z. B. 3"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-950">
                      Füllgrad
                    </span>
                    <select
                      className={getSelectClassName()}
                      value={formState.fillLevel}
                      onChange={(event) =>
                        setFormState((current) => ({
                          ...current,
                          fillLevel: event.target.value as FillLevel,
                        }))
                      }
                    >
                      {fillLevels.map((value) => (
                        <option key={value} value={value}>
                          {fillLevelLabels[value]}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-950">
                      Etage
                    </span>
                    <select
                      className={getSelectClassName()}
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
                      Aufzug
                    </span>
                    <select
                      className={getSelectClassName()}
                      value={formState.hasElevator ? "yes" : "no"}
                      onChange={(event) =>
                        setFormState((current) => ({
                          ...current,
                          hasElevator: event.target.value === "yes",
                        }))
                      }
                    >
                      <option value="no">Kein Aufzug</option>
                      <option value="yes">Aufzug vorhanden</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-950">
                      Laufweg
                    </span>
                    <select
                      className={getSelectClassName()}
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
              </section>

              <section className="rounded-[1.8rem] border border-[var(--line)] bg-[var(--surface-muted)] p-5">
                <p className="text-sm font-semibold text-slate-950">
                  3. Extras und besondere Situationen
                </p>
                <p className="mt-1 text-sm leading-6 text-[var(--foreground-soft)]">
                  Hier können Zusatzleistungen und Punkte ergänzt werden, die wir vorsichtig
                  oder persönlich prüfen sollten.
                </p>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-950">
                      Extras
                    </span>
                    <select
                      className={getSelectClassName()}
                      value={extraOptionDraft}
                      onChange={(event) => {
                        const nextValue = event.target.value as ExtraOption | "";
                        setExtraOptionDraft(nextValue);

                        if (!nextValue) {
                          return;
                        }

                        setFormState((current) => ({
                          ...current,
                          extraOptions: addUniqueItem(current.extraOptions, nextValue),
                        }));
                        setExtraOptionDraft("");
                      }}
                    >
                      <option value="">Extra hinzufügen</option>
                      {extraOptions.map((value) => (
                        <option key={value} value={value}>
                          {extraOptionLabels[value]}
                        </option>
                      ))}
                    </select>
                    <span className="mt-2 block text-xs leading-5 text-[var(--foreground-soft)]">
                      Zum Beispiel Demontage, Küche abbauen oder besenrein.
                    </span>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-950">
                      Sonderfälle
                    </span>
                    <select
                      className={getSelectClassName()}
                      value={problemFlagDraft}
                      onChange={(event) => {
                        const nextValue = event.target.value as ProblemFlag | "";
                        setProblemFlagDraft(nextValue);

                        if (!nextValue) {
                          return;
                        }

                        setFormState((current) => ({
                          ...current,
                          problemFlags: addUniqueItem(current.problemFlags, nextValue),
                        }));
                        setProblemFlagDraft("");
                      }}
                    >
                      <option value="">Sonderfall hinzufügen</option>
                      {problemFlags.map((value) => (
                        <option key={value} value={value}>
                          {problemFlagLabels[value]}
                        </option>
                      ))}
                    </select>
                    <span className="mt-2 block text-xs leading-5 text-[var(--foreground-soft)]">
                      Zum Beispiel Schimmel, Schädlingsbefall oder Sondermüll.
                    </span>
                  </label>
                </div>

                {selectedExtraLabels.length > 0 ? (
                  <div className="mt-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--foreground-soft)]">
                      Gewählte Extras
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {formState.extraOptions.map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() =>
                            setFormState((current) => ({
                              ...current,
                              extraOptions: removeItem(current.extraOptions, value),
                            }))
                          }
                          className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white px-3 py-2 text-sm text-slate-950"
                        >
                          {extraOptionLabels[value]}
                          <span className="text-[var(--foreground-soft)]">x</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                {selectedProblemFlagLabels.length > 0 ? (
                  <div className="mt-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-900">
                      Angegebene Sonderfälle
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {formState.problemFlags.map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() =>
                            setFormState((current) => ({
                              ...current,
                              problemFlags: removeItem(current.problemFlags, value),
                            }))
                          }
                          className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900"
                        >
                          {problemFlagLabels[value]}
                          <span className="text-amber-700">x</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </section>

              <section className="rounded-[1.8rem] border border-[var(--line)] bg-white p-5">
                <p className="text-sm font-semibold text-slate-950">4. Ort und Termin</p>
                <p className="mt-1 text-sm leading-6 text-[var(--foreground-soft)]">
                  Mit PLZ und Wunschdatum können wir Anfahrt und Verfügbarkeit besser
                  einordnen.
                </p>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-950">PLZ</span>
                    <input
                      inputMode="numeric"
                      maxLength={5}
                      required
                      className={getSelectClassName()}
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
                      className={getSelectClassName()}
                      value={formState.desiredDate}
                      onChange={(event) =>
                        setFormState((current) => ({
                          ...current,
                          desiredDate: event.target.value,
                        }))
                      }
                    />
                  </label>
                </div>
              </section>
            </div>
          ) : null}

          {stepIndex === 1 ? (
            <div className="space-y-5">
              <section className="overflow-hidden rounded-[1.8rem] border border-[var(--line)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(247,243,234,0.92))] p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-xl">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent-deep)]">
                      Vor dem Absenden
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                      Ihre unverbindliche Kostenschätzung
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--foreground-soft)]">
                      Prüfen Sie jetzt noch einmal die Angaben. Danach geht die Anfrage
                      direkt strukturiert an unser Team.
                    </p>
                  </div>
                  <div className="rounded-[1.7rem] bg-[var(--foreground)] px-5 py-5 text-white shadow-[0_16px_36px_rgba(29,36,48,0.22)]">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                      Preisrahmen aktuell
                    </p>
                    <p className="mt-3 text-3xl font-semibold tracking-tight">
                      {estimate
                        ? `${formatCurrency(estimate.rangeMin)} bis ${formatCurrency(estimate.rangeMax)}`
                        : "Noch nicht verfügbar"}
                    </p>
                    <p className="mt-3 max-w-xs text-sm leading-6 text-white/75">
                      Auf Basis der aktuellen Angaben und weiterhin unverbindlich.
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                  <div className="rounded-3xl border border-[var(--line)] bg-white/80 px-4 py-4">
                    <p className="text-[var(--foreground-soft)]">Hauptobjekt</p>
                    <p className="mt-1 font-medium text-slate-950">
                      {objectTypeLabels[formState.objectType]}
                    </p>
                  </div>
                  <div className="rounded-3xl border border-[var(--line)] bg-white/80 px-4 py-4">
                    <p className="text-[var(--foreground-soft)]">Zusätzliche Bereiche</p>
                    <p className="mt-1 font-medium text-slate-950">
                      {selectedAdditionalAreaLabels.length > 0
                        ? selectedAdditionalAreaLabels.join(", ")
                        : "Keine"}
                    </p>
                  </div>
                  <div className="rounded-3xl border border-[var(--line)] bg-white/80 px-4 py-4">
                    <p className="text-[var(--foreground-soft)]">Gesamtfläche</p>
                    <p className="mt-1 font-medium text-slate-950">
                      {formState.areaSqm ? `${formState.areaSqm} m²` : "Noch nicht angegeben"}
                    </p>
                  </div>
                  <div className="rounded-3xl border border-[var(--line)] bg-white/80 px-4 py-4">
                    <p className="text-[var(--foreground-soft)]">Zugang</p>
                    <p className="mt-1 font-medium text-slate-950">
                      {fillLevelLabels[formState.fillLevel]}, Etage{" "}
                      {floorLevelLabels[formState.floorLevel]}
                    </p>
                  </div>
                  <div className="rounded-3xl border border-[var(--line)] bg-white/80 px-4 py-4">
                    <p className="text-[var(--foreground-soft)]">Extras</p>
                    <p className="mt-1 font-medium text-slate-950">
                      {selectedExtraLabels.length > 0 ? selectedExtraLabels.join(", ") : "Keine"}
                    </p>
                  </div>
                  <div className="rounded-3xl border border-[var(--line)] bg-white/80 px-4 py-4">
                    <p className="text-[var(--foreground-soft)]">PLZ</p>
                    <p className="mt-1 font-medium text-slate-950">
                      {formState.postalCode || "Noch nicht angegeben"}
                    </p>
                  </div>
                </div>

                {manualReviewReasons.length > 0 ? (
                  <div className="mt-5 rounded-3xl border border-amber-300 bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-900">
                    <p className="font-semibold">Persönliche Prüfung vorgesehen</p>
                    <p className="mt-2">
                      Einige Angaben sprechen für eine kurze Rücksprache oder eine
                      Besichtigung. Sie sehen trotzdem weiterhin einen Preisrahmen.
                    </p>
                  </div>
                ) : (
                  <div className="mt-5 rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm leading-6 text-emerald-900">
                    Ihre Angaben sind schlüssig genug für eine erste Einordnung und eine
                    strukturierte Rückmeldung.
                  </div>
                )}
              </section>

              <section className="rounded-[1.8rem] border border-[var(--line)] bg-[var(--surface-muted)] p-5">
                <p className="text-sm font-semibold text-slate-950">Kontakt für die Rückmeldung</p>
                <p className="mt-1 text-sm leading-6 text-[var(--foreground-soft)]">
                  Wir melden uns in der Regel telefonisch oder per E-Mail. Je klarer die
                  Kontaktdaten sind, desto schneller kann die Anfrage bearbeitet werden.
                </p>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-950">Name</span>
                    <input
                      required
                      autoComplete="name"
                      className={getSelectClassName()}
                      placeholder="Vor- und Nachname"
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
                      required
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      className={getSelectClassName()}
                      placeholder="Telefon für Rückfragen"
                      value={formState.phone}
                      onChange={(event) =>
                        setFormState((current) => ({ ...current, phone: event.target.value }))
                      }
                    />
                  </label>
                </div>

                <label className="mt-4 block">
                  <span className="mb-2 block text-sm font-semibold text-slate-950">E-Mail</span>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    className={getSelectClassName()}
                    placeholder="name@example.de"
                    value={formState.email}
                    onChange={(event) =>
                      setFormState((current) => ({ ...current, email: event.target.value }))
                    }
                  />
                </label>

                <label className="mt-4 block">
                  <span className="mb-2 block text-sm font-semibold text-slate-950">
                    Hinweise (optional)
                  </span>
                  <textarea
                    rows={5}
                    className="w-full rounded-3xl border border-[var(--line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)]"
                    value={formState.message}
                    onChange={(event) =>
                      setFormState((current) => ({ ...current, message: event.target.value }))
                    }
                    placeholder="Zugang, Parkmöglichkeit, besondere Hinweise ..."
                  />
                </label>
              </section>

              <div className="rounded-3xl border border-[var(--line)] bg-white px-5 py-4 text-sm leading-6 text-[var(--foreground-soft)]">
                Mit dem Absenden senden Sie eine unverbindliche Anfrage. Die
                Kostenschätzung dient der ersten Orientierung und ersetzt bei
                Sonderfällen keine persönliche Prüfung.
              </div>

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
            <div
              className="mt-6 flex items-start gap-3 rounded-3xl border border-red-300 bg-red-50 px-4 py-4 text-sm text-red-800"
              role="alert"
              aria-live="polite"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 font-semibold text-red-700">
                !
              </span>
              <div>
                <p className="font-semibold">Bitte Angaben prüfen</p>
                <p className="mt-1 leading-6">{errorMessage}</p>
              </div>
            </div>
          ) : null}

          <div className="mt-8 flex flex-col gap-4 rounded-3xl border border-[var(--line)] bg-[var(--surface-muted)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-950">
                Schritt {stepIndex + 1} von {steps.length}
              </p>
              <p className="mt-1 text-xs leading-5 text-[var(--foreground-soft)]">
                {stepReady ? "Sie können mit diesem Stand weitergehen." : stepCtaHint}
              </p>
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  setStepIndex((current) => Math.max(0, current - 1));
                  setErrorMessage(null);
                }}
                disabled={stepIndex === 0}
                className="inline-flex h-12 items-center justify-center rounded-full border border-[var(--line)] bg-white px-6 text-sm font-semibold text-slate-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Zurück
              </button>

              {stepIndex < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (!stepReady) {
                      setErrorMessage(
                        "Bitte geben Sie mindestens Hauptobjekt, Gesamtfläche und eine gültige PLZ an.",
                      );
                      return;
                    }

                    setErrorMessage(null);
                    setStepIndex(1);
                  }}
                  disabled={!stepReady}
                  className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--accent)] px-6 text-sm font-semibold text-white transition hover:bg-[var(--accent-deep)] disabled:cursor-not-allowed disabled:opacity-55"
                >
                  Weiter zur Anfrage
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !stepReady}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-6 text-sm font-semibold text-white transition hover:bg-[var(--accent-deep)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                      Wird gesendet ...
                    </>
                  ) : (
                    "Unverbindliche Anfrage senden"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <aside className="space-y-5 lg:sticky lg:top-24">
        <div className="panel overflow-hidden rounded-[2rem]">
          <div className="border-b border-[var(--line)] bg-[var(--surface-muted)] px-6 py-5">
            <p className="eyebrow text-[var(--accent-deep)]">Live-Einschätzung</p>
            <p className="mt-3 text-sm leading-6 text-[var(--foreground-soft)]">
              Dieselbe Kalkulation wird für Vorschau, Speicherung, Admin-Ansicht und PDF
              verwendet.
            </p>
          </div>
          {estimate ? (
            <div className="p-6">
              <div className="rounded-[1.8rem] bg-[linear-gradient(180deg,rgba(199,100,45,0.14),rgba(199,100,45,0.06))] px-5 py-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-deep)]">
                  Voraussichtlicher Preisrahmen
                </p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                  {formatCurrency(estimate.rangeMin)} bis {formatCurrency(estimate.rangeMax)}
                </p>
                <p className="mt-3 text-sm leading-6 text-[var(--foreground-soft)]">
                  Unverbindliche Ersteinschätzung auf Basis Ihrer aktuellen Angaben.
                </p>
              </div>

              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[var(--foreground-soft)]">Hauptobjekt</dt>
                  <dd className="font-medium text-slate-950">
                    {objectTypeLabels[formState.objectType]}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[var(--foreground-soft)]">Zusatzbereiche</dt>
                  <dd className="font-medium text-slate-950">
                    {selectedAdditionalAreaLabels.length > 0
                      ? selectedAdditionalAreaLabels.join(", ")
                      : "Keine"}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[var(--foreground-soft)]">Effektive Fläche</dt>
                  <dd className="font-medium text-slate-950">{estimate.effectiveArea} m²</dd>
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

              <div className="mt-5 rounded-3xl border border-[var(--line)] bg-white px-4 py-4 text-sm leading-6 text-[var(--foreground-soft)]">
                Zusatzbereiche werden über die angegebene Gesamtfläche und die
                strukturierte Anfrage mitberücksichtigt.
              </div>
              {manualReviewReasons.length > 0 ? (
                <div className="mt-5 rounded-3xl border border-amber-300 bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-900">
                  <p className="font-semibold">Persönliche Prüfung vorgesehen</p>
                  <ul className="mt-2 space-y-1">
                    {manualReviewReasons.map((reason) => (
                      <li key={reason.code}>- {reason.message}</li>
                    ))}
                  </ul>
                  <p className="mt-3">
                    Sie sehen weiterhin einen Preisrahmen. Für die finale
                    Einschätzung melden wir uns nach kurzer Prüfung persönlich.
                  </p>
                </div>
              ) : (
                <div className="mt-5 rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm leading-6 text-emerald-900">
                  Aktuell spricht nichts gegen eine schnelle erste Einordnung Ihrer Anfrage.
                </div>
              )}
            </div>
          ) : (
            <div className="p-6">
              <div className="rounded-3xl bg-[var(--surface-muted)] px-5 py-5 text-sm leading-6 text-[var(--foreground-soft)]">
                <p className="font-semibold text-slate-950">So entsteht die Einschätzung</p>
                <ul className="mt-3 space-y-2">
                  <li>- Hauptobjekt und Fläche angeben</li>
                  <li>- Zugang und Besonderheiten ergänzen</li>
                  <li>- PLZ eintragen und Preisrahmen direkt sehen</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="panel rounded-[2rem] p-6 text-sm leading-6 text-[var(--foreground-soft)]">
          <p className="font-semibold text-slate-950">Einsatzgebiet und Kontakt</p>
          <p className="mt-3">{serviceAreaNote}</p>
          <p className="mt-3 font-medium text-slate-950">{companyPhone}</p>
          <p>{companyEmail}</p>
        </div>

        <div className="panel rounded-[2rem] p-6 text-sm leading-6 text-[var(--foreground-soft)]">
          <p className="font-semibold text-slate-950">Wichtiger Hinweis</p>
          <p className="mt-3">{estimateFootnote}</p>
        </div>
      </aside>
    </div>
  );
}
