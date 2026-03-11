import { updatePricingSettingsAction } from "@/app/admin/(protected)/actions";
import { AdminNotice } from "@/components/admin/admin-notice";
import { ConfigurationState } from "@/components/configuration-state";
import { prisma } from "@/lib/db";
import {
  extraOptionLabels,
  extraOptions,
  fillLevelLabels,
  fillLevels,
  floorLevelLabels,
  floorLevels,
  objectTypeLabels,
  objectTypes,
  travelZoneCodes,
  walkDistanceLabels,
  walkDistances,
} from "@/lib/pricing/types";

type PricingSettingsPageProps = {
  searchParams: Promise<{
    status?: string;
  }>;
};

export default async function PricingSettingsPage({
  searchParams,
}: PricingSettingsPageProps) {
  const resolvedSearchParams = await searchParams;
  const pricingProfile = await prisma.pricingProfile.findFirst({
    where: {
      isActive: true,
    },
    include: {
      objectBasePrices: true,
      fillLevelFactors: true,
      floorSurcharges: true,
      walkDistanceSurcharges: true,
      extraOptionPrices: true,
      travelZones: true,
    },
  });

  if (!pricingProfile) {
    return (
      <ConfigurationState
        title="Kein aktives Preisprofil vorhanden"
        description="Der Adminbereich ist erreichbar, aber für neue Kalkulationen fehlt ein aktives Preisprofil. Solange diese Konfiguration fehlt, sollten keine neuen Demo- oder Pilotanfragen angenommen werden."
        actionHint="Die Demo-Daten erneut einspielen oder ein aktives Preisprofil in der Datenbank anlegen. Lokal hilft `npm run db:seed` oder `npm run db:reset-demo`."
      />
    );
  }

  return (
    <section className="panel rounded-[2rem] p-6 sm:p-8">
      <div>
        <p className="eyebrow text-[var(--accent-deep)]">Preise</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Preiseinstellungen</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--foreground-soft)]">
          Alle Werte wirken nur auf künftige Kalkulationen. Bestehende Anfragen behalten
          ihren gespeicherten Snapshot.
        </p>
      </div>

      {resolvedSearchParams.status === "saved" ? (
        <div className="mt-6">
          <AdminNotice variant="success">
            Preiseinstellungen gespeichert. Neue Werte gelten ab der nächsten Anfrage.
          </AdminNotice>
        </div>
      ) : null}
      {resolvedSearchParams.status === "invalid" ? (
        <div className="mt-6">
          <AdminNotice variant="error">
            Einige Eingaben sind ungültig. Bitte die Werte prüfen und erneut speichern.
          </AdminNotice>
        </div>
      ) : null}

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <article className="rounded-[1.8rem] border border-[var(--line)] bg-[var(--surface-muted)] p-5">
          <h2 className="text-lg font-semibold text-slate-950">So wirkt die Kalkulation</h2>
          <ul className="mt-4 space-y-2 text-sm leading-6 text-[var(--foreground-soft)]">
            <li>- Objektbasispreis plus effektive Fläche bilden den Grundwert.</li>
            <li>- Etage, Aufzug, Laufweg, Extras und Anfahrtszone ergänzen den Aufwand.</li>
            <li>- Mindestauftragswert und Preisspanne werden erst zum Schluss angewendet.</li>
          </ul>
        </article>
        <article className="rounded-[1.8rem] border border-[var(--line)] bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-950">Wichtig für Demo und Betrieb</h2>
          <p className="mt-4 text-sm leading-6 text-[var(--foreground-soft)]">
            Neue Werte greifen nur für künftige Anfragen. Bereits gespeicherte
            Vorgänge behalten ihren Kalkulations-Snapshot und bleiben dadurch
            nachvollziehbar.
          </p>
        </article>
      </div>

      <form action={updatePricingSettingsAction} className="mt-8 space-y-8">
        <input type="hidden" name="pricingProfileId" value={pricingProfile.id} />

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-950">Profilname</span>
            <input
              name="profileName"
              defaultValue={pricingProfile.name}
              className="h-12 w-full rounded-2xl border border-[var(--line)] bg-white px-4 outline-none transition focus:border-[var(--accent)]"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-950">
              Mindestauftragswert
            </span>
            <input
              name="minimumOrderValue"
              type="number"
              defaultValue={pricingProfile.minimumOrderValue}
              className="h-12 w-full rounded-2xl border border-[var(--line)] bg-white px-4 outline-none transition focus:border-[var(--accent)]"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-950">
              Basisrate pro effektivem m²
            </span>
            <input
              name="baseRatePerEffectiveSqm"
              type="number"
              defaultValue={pricingProfile.baseRatePerEffectiveSqm}
              className="h-12 w-full rounded-2xl border border-[var(--line)] bg-white px-4 outline-none transition focus:border-[var(--accent)]"
            />
          </label>
          <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-950">
              Aufzugsfaktor für Etagenaufschlag
            </span>
            <input
              name="elevatorReductionFactor"
              type="number"
              step="0.01"
              defaultValue={pricingProfile.elevatorReductionFactor}
              className="h-12 w-full rounded-2xl border border-[var(--line)] bg-white px-4 outline-none transition focus:border-[var(--accent)]"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-950">Min-Faktor</span>
            <input
              name="minFactor"
              type="number"
              step="0.01"
              defaultValue={pricingProfile.minFactor}
              className="h-12 w-full rounded-2xl border border-[var(--line)] bg-white px-4 outline-none transition focus:border-[var(--accent)]"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-950">Max-Faktor</span>
            <input
              name="maxFactor"
              type="number"
              step="0.01"
              defaultValue={pricingProfile.maxFactor}
              className="h-12 w-full rounded-2xl border border-[var(--line)] bg-white px-4 outline-none transition focus:border-[var(--accent)]"
            />
          </label>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-[1.8rem] bg-[var(--surface-muted)] p-5">
            <h2 className="text-lg font-semibold text-slate-950">Objektbasispreise</h2>
            <div className="mt-4 space-y-3">
              {objectTypes.map((objectType) => {
                const currentValue = pricingProfile.objectBasePrices.find(
                  (entry) => entry.objectType === objectType,
                )?.amount;

                return (
                  <label key={objectType} className="flex items-center justify-between gap-4">
                    <span className="text-sm text-slate-950">{objectTypeLabels[objectType]}</span>
                    <input
                      name={`objectBasePrice.${objectType}`}
                      type="number"
                      defaultValue={currentValue}
                      className="h-11 w-32 rounded-2xl border border-[var(--line)] bg-white px-3 text-right outline-none transition focus:border-[var(--accent)]"
                    />
                  </label>
                );
              })}
            </div>
          </section>

          <section className="rounded-[1.8rem] bg-[var(--surface-muted)] p-5">
            <h2 className="text-lg font-semibold text-slate-950">Füllgradfaktoren</h2>
            <div className="mt-4 space-y-3">
              {fillLevels.map((fillLevel) => {
                const currentValue = pricingProfile.fillLevelFactors.find(
                  (entry) => entry.fillLevel === fillLevel,
                )?.factor;

                return (
                  <label key={fillLevel} className="flex items-center justify-between gap-4">
                    <span className="text-sm text-slate-950">{fillLevelLabels[fillLevel]}</span>
                    <input
                      name={`fillLevelFactor.${fillLevel}`}
                      type="number"
                      step="0.01"
                      defaultValue={currentValue}
                      className="h-11 w-32 rounded-2xl border border-[var(--line)] bg-white px-3 text-right outline-none transition focus:border-[var(--accent)]"
                    />
                  </label>
                );
              })}
            </div>
          </section>

          <section className="rounded-[1.8rem] bg-[var(--surface-muted)] p-5">
            <h2 className="text-lg font-semibold text-slate-950">Etagenaufschläge</h2>
            <div className="mt-4 space-y-3">
              {floorLevels.map((floorLevel) => {
                const currentValue = pricingProfile.floorSurcharges.find(
                  (entry) => entry.floorLevel === floorLevel,
                )?.amount;

                return (
                  <label key={floorLevel} className="flex items-center justify-between gap-4">
                    <span className="text-sm text-slate-950">{floorLevelLabels[floorLevel]}</span>
                    <input
                      name={`floorSurcharge.${floorLevel}`}
                      type="number"
                      defaultValue={currentValue}
                      className="h-11 w-32 rounded-2xl border border-[var(--line)] bg-white px-3 text-right outline-none transition focus:border-[var(--accent)]"
                    />
                  </label>
                );
              })}
            </div>
          </section>

          <section className="rounded-[1.8rem] bg-[var(--surface-muted)] p-5">
            <h2 className="text-lg font-semibold text-slate-950">Laufwege</h2>
            <div className="mt-4 space-y-3">
              {walkDistances.map((walkDistance) => {
                const currentValue = pricingProfile.walkDistanceSurcharges.find(
                  (entry) => entry.walkDistance === walkDistance,
                )?.amount;

                return (
                  <label key={walkDistance} className="flex items-center justify-between gap-4">
                    <span className="text-sm text-slate-950">{walkDistanceLabels[walkDistance]}</span>
                    <input
                      name={`walkDistance.${walkDistance}`}
                      type="number"
                      defaultValue={currentValue}
                      className="h-11 w-32 rounded-2xl border border-[var(--line)] bg-white px-3 text-right outline-none transition focus:border-[var(--accent)]"
                    />
                  </label>
                );
              })}
            </div>
          </section>

          <section className="rounded-[1.8rem] bg-[var(--surface-muted)] p-5 lg:col-span-2">
            <h2 className="text-lg font-semibold text-slate-950">Extras und Zonen</h2>
            <div className="mt-4 grid gap-6 lg:grid-cols-2">
              <div className="space-y-3">
                {extraOptions.map((extraOption) => {
                  const currentValue = pricingProfile.extraOptionPrices.find(
                    (entry) => entry.extraOption === extraOption,
                  )?.amount;

                  return (
                    <label key={extraOption} className="flex items-center justify-between gap-4">
                      <span className="text-sm text-slate-950">{extraOptionLabels[extraOption]}</span>
                      <input
                        name={`extraOption.${extraOption}`}
                        type="number"
                        defaultValue={currentValue}
                        className="h-11 w-32 rounded-2xl border border-[var(--line)] bg-white px-3 text-right outline-none transition focus:border-[var(--accent)]"
                      />
                    </label>
                  );
                })}
              </div>

              <div className="space-y-4">
                {travelZoneCodes.map((zoneCode) => {
                  const travelZone = pricingProfile.travelZones.find(
                    (entry) => entry.zoneCode === zoneCode,
                  );

                  if (!travelZone) {
                    return null;
                  }

                  return (
                    <div
                      key={travelZone.id}
                      className="rounded-3xl border border-[var(--line)] bg-white p-4"
                    >
                      <div className="grid gap-3 sm:grid-cols-[90px_1fr_120px]">
                        <input
                          name={`travelZone.label.${travelZone.zoneCode}`}
                          defaultValue={travelZone.label}
                          className="h-11 rounded-2xl border border-[var(--line)] px-3 outline-none transition focus:border-[var(--accent)]"
                        />
                        <input
                          name={`travelZone.prefixes.${travelZone.zoneCode}`}
                          defaultValue={travelZone.postalPrefixes}
                          className="h-11 rounded-2xl border border-[var(--line)] px-3 outline-none transition focus:border-[var(--accent)]"
                        />
                        <input
                          name={`travelZone.amount.${travelZone.zoneCode}`}
                          type="number"
                          defaultValue={travelZone.amount}
                          className="h-11 rounded-2xl border border-[var(--line)] px-3 text-right outline-none transition focus:border-[var(--accent)]"
                        />
                      </div>
                      <p className="mt-3 text-xs leading-5 text-[var(--foreground-soft)]">
                        Zone {travelZone.zoneCode}: Bezeichnung, PLZ-Präfixe
                        kommagetrennt und Aufschlag in Euro.
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--accent)] px-6 text-sm font-semibold text-white transition hover:bg-[var(--accent-deep)]"
          >
            Preise speichern
          </button>
        </div>
      </form>
    </section>
  );
}
