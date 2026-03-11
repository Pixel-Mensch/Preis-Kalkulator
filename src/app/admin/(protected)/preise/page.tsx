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
        description="Der Adminbereich ist erreichbar, aber für neue Kalkulationen fehlt ein aktives Preisprofil. Solange diese Konfiguration fehlt, sollten keine neuen Anfragen über den Rechner angenommen werden."
        actionHint="Ein aktives Preisprofil in der Datenbank anlegen, bevor neue Anfragen kalkuliert werden."
      />
    );
  }

  return (
    <section className="panel rounded-[2rem] p-6 sm:p-8">
      <div>
        <p className="eyebrow text-[var(--accent-deep)]">Preise</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Preise und Kalkulation</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--foreground-soft)]">
          Hier pflegen Sie die Werte für neue Anfragen. Bereits gespeicherte Vorgänge behalten
          ihren Snapshot und bleiben damit nachvollziehbar.
        </p>
      </div>

      {resolvedSearchParams.status === "saved" ? (
        <div className="mt-6">
          <AdminNotice variant="success" title="Preise gespeichert">
            Neue Werte gelten ab der nächsten Anfrage. Bestehende Vorgänge bleiben unverändert.
          </AdminNotice>
        </div>
      ) : null}
      {resolvedSearchParams.status === "invalid" ? (
        <div className="mt-6">
          <AdminNotice variant="error" title="Eingaben prüfen">
            Einige Preiswerte oder Zonenangaben sind ungültig. Bitte die betroffenen Felder
            kontrollieren und erneut speichern.
          </AdminNotice>
        </div>
      ) : null}

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <article className="rounded-[1.8rem] border border-[var(--line)] bg-[var(--surface-muted)] p-5">
          <h2 className="text-lg font-semibold text-slate-950">Worauf es hier ankommt</h2>
          <ul className="mt-4 space-y-2 text-sm leading-6 text-[var(--foreground-soft)]">
            <li>- Objektbasis und effektive Fläche bilden den Grundwert.</li>
            <li>- Etage, Laufweg, Extras und Zonen bilden den Zusatzaufwand ab.</li>
            <li>- Mindestwert und Preisspanne greifen erst zum Schluss.</li>
          </ul>
        </article>
        <article className="rounded-[1.8rem] border border-[var(--line)] bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-950">Typische Pflegefälle</h2>
          <ul className="mt-4 space-y-2 text-sm leading-6 text-[var(--foreground-soft)]">
            <li>- Mindestauftragswert anpassen</li>
            <li>- Zonen oder PLZ-Präfixe nachschärfen</li>
            <li>- Zuschläge für Extras oder schwierige Zugänge nachziehen</li>
          </ul>
        </article>
      </div>

      <form action={updatePricingSettingsAction} className="mt-8 space-y-8">
        <input type="hidden" name="pricingProfileId" value={pricingProfile.id} />

        <section className="rounded-[1.8rem] bg-[var(--surface-muted)] p-5">
          <div className="max-w-3xl">
            <h2 className="text-lg font-semibold text-slate-950">Profil und Rahmenwerte</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--foreground-soft)]">
              Diese Werte steuern Grundpreis, Mindestwert und die Spannbreite der angezeigten
              Kostenschätzung.
            </p>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-950">Profilname</span>
              <input
                name="profileName"
                defaultValue={pricingProfile.name}
                className="h-12 w-full rounded-2xl border border-[var(--line)] bg-white px-4 outline-none transition focus:border-[var(--accent)]"
              />
              <span className="mt-2 block text-xs leading-5 text-[var(--foreground-soft)]">
                Interne Bezeichnung für das aktive Preisprofil.
              </span>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-950">
                Mindestauftragswert
              </span>
              <input
                name="minimumOrderValue"
                type="number"
                inputMode="numeric"
                defaultValue={pricingProfile.minimumOrderValue}
                className="h-12 w-full rounded-2xl border border-[var(--line)] bg-white px-4 outline-none transition focus:border-[var(--accent)]"
              />
              <span className="mt-2 block text-xs leading-5 text-[var(--foreground-soft)]">
                Untergrenze, bevor die Preisspanne berechnet wird.
              </span>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-950">
                Basisrate pro effektivem m²
              </span>
              <input
                name="baseRatePerEffectiveSqm"
                type="number"
                inputMode="decimal"
                defaultValue={pricingProfile.baseRatePerEffectiveSqm}
                className="h-12 w-full rounded-2xl border border-[var(--line)] bg-white px-4 outline-none transition focus:border-[var(--accent)]"
              />
              <span className="mt-2 block text-xs leading-5 text-[var(--foreground-soft)]">
                Grundlage für die Flächenberechnung nach Füllgrad.
              </span>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-950">
                Aufzugsfaktor für Etagenaufschlag
              </span>
              <input
                name="elevatorReductionFactor"
                type="number"
                step="0.01"
                inputMode="decimal"
                defaultValue={pricingProfile.elevatorReductionFactor}
                className="h-12 w-full rounded-2xl border border-[var(--line)] bg-white px-4 outline-none transition focus:border-[var(--accent)]"
              />
              <span className="mt-2 block text-xs leading-5 text-[var(--foreground-soft)]">
                Reduziert den Etagenaufschlag, wenn ein Aufzug vorhanden ist.
              </span>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-950">Min-Faktor</span>
              <input
                name="minFactor"
                type="number"
                step="0.01"
                inputMode="decimal"
                defaultValue={pricingProfile.minFactor}
                className="h-12 w-full rounded-2xl border border-[var(--line)] bg-white px-4 outline-none transition focus:border-[var(--accent)]"
              />
              <span className="mt-2 block text-xs leading-5 text-[var(--foreground-soft)]">
                Untere Grenze der angezeigten Preisspanne.
              </span>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-950">Max-Faktor</span>
              <input
                name="maxFactor"
                type="number"
                step="0.01"
                inputMode="decimal"
                defaultValue={pricingProfile.maxFactor}
                className="h-12 w-full rounded-2xl border border-[var(--line)] bg-white px-4 outline-none transition focus:border-[var(--accent)]"
              />
              <span className="mt-2 block text-xs leading-5 text-[var(--foreground-soft)]">
                Obere Grenze der angezeigten Preisspanne.
              </span>
            </label>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-[1.8rem] bg-[var(--surface-muted)] p-5">
            <h2 className="text-lg font-semibold text-slate-950">Objektbasispreise</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--foreground-soft)]">
              Grundwert vor Fläche, Zugang und Extras.
            </p>
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
                      inputMode="numeric"
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
            <p className="mt-2 text-sm leading-6 text-[var(--foreground-soft)]">
              1.00 steht für den Normalfall. Höhere Faktoren erhöhen die effektive Fläche.
            </p>
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
                      inputMode="decimal"
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
            <p className="mt-2 text-sm leading-6 text-[var(--foreground-soft)]">
              Aufwand für Transport und Trageweg nach Etage.
            </p>
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
                      inputMode="numeric"
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
            <p className="mt-2 text-sm leading-6 text-[var(--foreground-soft)]">
              Zusatzaufwand je nach Entfernung vom Gebäude zum Fahrzeug.
            </p>
            <div className="mt-4 space-y-3">
              {walkDistances.map((walkDistance) => {
                const currentValue = pricingProfile.walkDistanceSurcharges.find(
                  (entry) => entry.walkDistance === walkDistance,
                )?.amount;

                return (
                  <label key={walkDistance} className="flex items-center justify-between gap-4">
                    <span className="text-sm text-slate-950">
                      {walkDistanceLabels[walkDistance]}
                    </span>
                    <input
                      name={`walkDistance.${walkDistance}`}
                      type="number"
                      inputMode="numeric"
                      defaultValue={currentValue}
                      className="h-11 w-32 rounded-2xl border border-[var(--line)] bg-white px-3 text-right outline-none transition focus:border-[var(--accent)]"
                    />
                  </label>
                );
              })}
            </div>
          </section>
        </div>

        <section className="rounded-[1.8rem] bg-[var(--surface-muted)] p-5">
          <div className="max-w-3xl">
            <h2 className="text-lg font-semibold text-slate-950">Extras und Einsatzzonen</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--foreground-soft)]">
              Hier pflegen Sie Zusatzleistungen sowie die Zonenlogik für Anfahrt und Einsatzgebiet.
            </p>
          </div>

          <div className="mt-5 grid gap-6 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-950">Extras</p>
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
                      inputMode="numeric"
                      defaultValue={currentValue}
                      className="h-11 w-32 rounded-2xl border border-[var(--line)] bg-white px-3 text-right outline-none transition focus:border-[var(--accent)]"
                    />
                  </label>
                );
              })}
            </div>

            <div>
              <div className="hidden grid-cols-[88px_1fr_120px] gap-3 px-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--foreground-soft)] sm:grid">
                <span>Zone</span>
                <span>PLZ-Präfixe</span>
                <span className="text-right">Aufschlag</span>
              </div>

              <div className="mt-3 space-y-4">
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
                      <div className="grid gap-3 sm:grid-cols-[88px_1fr_120px]">
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
                          inputMode="numeric"
                          defaultValue={travelZone.amount}
                          className="h-11 rounded-2xl border border-[var(--line)] px-3 text-right outline-none transition focus:border-[var(--accent)]"
                        />
                      </div>
                      <p className="mt-3 text-xs leading-5 text-[var(--foreground-soft)]">
                        Zone {travelZone.zoneCode}: Bezeichnung, PLZ-Präfixe kommagetrennt und
                        Aufschlag in Euro.
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <div className="sticky bottom-3 z-20 flex flex-col gap-3 rounded-[1.8rem] border border-[var(--line)] bg-white/95 px-4 py-4 shadow-[0_20px_34px_rgba(29,36,48,0.12)] backdrop-blur sm:flex-row sm:items-center sm:justify-between lg:static lg:rounded-3xl lg:bg-[var(--surface-muted)] lg:shadow-none lg:backdrop-blur-none">
          <p className="text-sm leading-6 text-[var(--foreground-soft)]">
            Änderungen gelten nur für neue Anfragen. Bestehende Vorgänge behalten ihren gespeicherten
            Stand.
          </p>
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
