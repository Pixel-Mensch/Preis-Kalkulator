import { updateCompanySettingsAction } from "@/app/admin/(protected)/actions";
import { AdminNotice } from "@/components/admin/admin-notice";
import { ConfigurationState } from "@/components/configuration-state";
import { getCompanySettingsState } from "@/lib/company";

type CompanySettingsPageProps = {
  searchParams: Promise<{
    status?: string;
  }>;
};

export default async function CompanySettingsPage({
  searchParams,
}: CompanySettingsPageProps) {
  const resolvedSearchParams = await searchParams;
  const { companySettings, isConfigured } = await getCompanySettingsState();

  if (!isConfigured) {
    return (
      <ConfigurationState
        title="Firmendaten fehlen noch"
        description="Für Landingpage, Rechner, PDF und E-Mail-Kontakt werden zentrale Firmendaten benötigt. Aktuell ist noch kein vollständiger Datensatz vorhanden."
        actionHint="Einen vollständigen CompanySettings-Datensatz anlegen, bevor die öffentliche Seite aktiv genutzt wird."
      />
    );
  }

  return (
    <section className="panel rounded-[2rem] p-6 sm:p-8">
      <div>
        <p className="eyebrow text-[var(--accent-deep)]">Firma</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Firmendaten und Außenwirkung</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--foreground-soft)]">
          Diese Angaben erscheinen auf Landingpage, Rechner, Erfolgsmeldung, Footer und PDF. Je
          sauberer diese Daten gepflegt sind, desto glaubwürdiger wirkt die öffentliche Seite.
        </p>
      </div>

      {resolvedSearchParams.status === "saved" ? (
        <div className="mt-6">
          <AdminNotice variant="success" title="Firmendaten gespeichert">
            Landingpage, Rechner und PDF nutzen jetzt die neuen Werte.
          </AdminNotice>
        </div>
      ) : null}
      {resolvedSearchParams.status === "invalid" ? (
        <div className="mt-6">
          <AdminNotice variant="error" title="Eingaben prüfen">
            Einige Firmendaten sind ungültig. Bitte die betroffenen Felder kontrollieren und erneut speichern.
          </AdminNotice>
        </div>
      ) : null}

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <article className="rounded-[1.8rem] border border-[var(--line)] bg-[var(--surface-muted)] p-5">
          <h2 className="text-lg font-semibold text-slate-950">Wo diese Daten sichtbar sind</h2>
          <ul className="mt-4 space-y-2 text-sm leading-6 text-[var(--foreground-soft)]">
            <li>- Firmenname und Kontakt erscheinen auf Landingpage, Rechner und Footer.</li>
            <li>- Einsatzgebiet und Hinweistext helfen Kunden bei Einordnung und Vertrauen.</li>
            <li>- Dieselben Werte werden auch in PDF und Erfolgsmeldung verwendet.</li>
          </ul>
        </article>
        <article className="rounded-[1.8rem] border border-[var(--line)] bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-950">Vor Livegang kurz prüfen</h2>
          <ul className="mt-4 space-y-2 text-sm leading-6 text-[var(--foreground-soft)]">
            <li>- Telefonnummer und E-Mail direkt erreichbar</li>
            <li>- Einsatzgebiet klar und natürlich formuliert</li>
            <li>- Hinweistext ruhig, ehrlich und unverbindlich</li>
          </ul>
        </article>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <form action={updateCompanySettingsAction} className="grid gap-6">
          <input type="hidden" name="companySettingsId" value={companySettings.id} />

          <section className="rounded-[1.8rem] bg-[var(--surface-muted)] p-5">
            <div className="max-w-3xl">
              <h2 className="text-lg font-semibold text-slate-950">Betrieb und Kontakt</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--foreground-soft)]">
                Diese Daten werden an mehreren Stellen öffentlich angezeigt und sollten sofort
                Vertrauen schaffen.
              </p>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-950">Firmenname</span>
                <input
                  name="companyName"
                  defaultValue={companySettings.companyName}
                  className="h-12 w-full rounded-2xl border border-[var(--line)] bg-white px-4 outline-none transition focus:border-[var(--accent)]"
                />
                <span className="mt-2 block text-xs leading-5 text-[var(--foreground-soft)]">
                  Wird in Header, Footer, PDF und Metadaten verwendet.
                </span>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-950">
                  Kontakt-E-Mail
                </span>
                <input
                  name="contactEmail"
                  type="email"
                  defaultValue={companySettings.contactEmail}
                  className="h-12 w-full rounded-2xl border border-[var(--line)] bg-white px-4 outline-none transition focus:border-[var(--accent)]"
                />
                <span className="mt-2 block text-xs leading-5 text-[var(--foreground-soft)]">
                  Für Rückfragen, Footer und PDF.
                </span>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-950">Telefon</span>
                <input
                  name="contactPhone"
                  defaultValue={companySettings.contactPhone}
                  className="h-12 w-full rounded-2xl border border-[var(--line)] bg-white px-4 outline-none transition focus:border-[var(--accent)]"
                />
                <span className="mt-2 block text-xs leading-5 text-[var(--foreground-soft)]">
                  Wird als primärer Kontakt hervorgehoben.
                </span>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-950">Website</span>
                <input
                  name="website"
                  defaultValue={companySettings.website ?? ""}
                  className="h-12 w-full rounded-2xl border border-[var(--line)] bg-white px-4 outline-none transition focus:border-[var(--accent)]"
                />
                <span className="mt-2 block text-xs leading-5 text-[var(--foreground-soft)]">
                  Optional. Wird im Footer verlinkt und für Metadaten genutzt.
                </span>
              </label>

              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-slate-950">
                  Erreichbarkeit / Servicezeiten
                </span>
                <input
                  name="supportHours"
                  defaultValue={companySettings.supportHours ?? ""}
                  className="h-12 w-full rounded-2xl border border-[var(--line)] bg-white px-4 outline-none transition focus:border-[var(--accent)]"
                />
                <span className="mt-2 block text-xs leading-5 text-[var(--foreground-soft)]">
                  Zum Beispiel „Mo-Fr 8:00-17:00 Uhr“.
                </span>
              </label>
            </div>
          </section>

          <section className="rounded-[1.8rem] bg-[var(--surface-muted)] p-5">
            <div className="max-w-3xl">
              <h2 className="text-lg font-semibold text-slate-950">Standort und Einsatzgebiet</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--foreground-soft)]">
                Diese Angaben schaffen regionale Glaubwürdigkeit und helfen bei der Einordnung des Einsatzgebiets.
              </p>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-slate-950">Straße</span>
                <input
                  name="street"
                  defaultValue={companySettings.street}
                  className="h-12 w-full rounded-2xl border border-[var(--line)] bg-white px-4 outline-none transition focus:border-[var(--accent)]"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-950">PLZ</span>
                <input
                  name="postalCode"
                  defaultValue={companySettings.postalCode}
                  className="h-12 w-full rounded-2xl border border-[var(--line)] bg-white px-4 outline-none transition focus:border-[var(--accent)]"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-950">Ort</span>
                <input
                  name="city"
                  defaultValue={companySettings.city}
                  className="h-12 w-full rounded-2xl border border-[var(--line)] bg-white px-4 outline-none transition focus:border-[var(--accent)]"
                />
              </label>

              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-slate-950">
                  Einsatzgebiet
                </span>
                <input
                  name="serviceAreaNote"
                  defaultValue={companySettings.serviceAreaNote}
                  className="h-12 w-full rounded-2xl border border-[var(--line)] bg-white px-4 outline-none transition focus:border-[var(--accent)]"
                />
                <span className="mt-2 block text-xs leading-5 text-[var(--foreground-soft)]">
                  Kurzer Satz wie „Einsatzgebiet in Essen, Mülheim und Umgebung“.
                </span>
              </label>
            </div>
          </section>

          <section className="rounded-[1.8rem] bg-[var(--surface-muted)] p-5">
            <div className="max-w-3xl">
              <h2 className="text-lg font-semibold text-slate-950">Kundenhinweis</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--foreground-soft)]">
                Dieser Text erscheint bei Rechner, Ergebnis und PDF. Er sollte ruhig, ehrlich und
                gut verständlich formuliert sein.
              </p>
            </div>

            <label className="mt-5 block">
              <span className="mb-2 block text-sm font-semibold text-slate-950">
                Fußnote für die Kostenschätzung
              </span>
              <textarea
                name="estimateFootnote"
                rows={4}
                defaultValue={companySettings.estimateFootnote}
                className="w-full rounded-3xl border border-[var(--line)] bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]"
              />
            </label>
          </section>

          <div className="sticky bottom-3 z-20 flex flex-col gap-3 rounded-[1.8rem] border border-[var(--line)] bg-white/95 px-4 py-4 shadow-[0_20px_34px_rgba(29,36,48,0.12)] backdrop-blur sm:flex-row sm:items-center sm:justify-between lg:static lg:rounded-3xl lg:bg-[var(--surface-muted)] lg:shadow-none lg:backdrop-blur-none">
            <p className="text-sm leading-6 text-[var(--foreground-soft)]">
              Änderungen wirken direkt auf öffentliche Seiten, Erfolgsmeldung und PDF.
            </p>
            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--accent)] px-6 text-sm font-semibold text-white transition hover:bg-[var(--accent-deep)]"
            >
              Firmendaten speichern
            </button>
          </div>
        </form>

        <aside className="space-y-4 xl:sticky xl:top-6 xl:h-fit">
          <section className="rounded-[1.8rem] border border-[var(--line)] bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-950">Aktuelle Vorschau</h2>
            <div className="mt-4 space-y-3 text-sm leading-6 text-[var(--foreground-soft)]">
              <p className="font-semibold text-slate-950">{companySettings.companyName}</p>
              <p>{companySettings.contactPhone}</p>
              <p>{companySettings.contactEmail}</p>
              <p>
                {companySettings.street}, {companySettings.postalCode} {companySettings.city}
              </p>
              <p>{companySettings.serviceAreaNote}</p>
            </div>
          </section>

          <section className="rounded-[1.8rem] border border-[var(--line)] bg-[var(--surface-muted)] p-5">
            <h2 className="text-lg font-semibold text-slate-950">Hinweis für die Außendarstellung</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--foreground-soft)]">
              Firmenname, Kontakt, Einsatzgebiet und Hinweistext werden zentral aus diesen
              Einstellungen gezogen. Damit bleibt die öffentliche Seite stimmig und der Betrieb
              wirkt an allen Stellen gleich.
            </p>
          </section>
        </aside>
      </div>
    </section>
  );
}
