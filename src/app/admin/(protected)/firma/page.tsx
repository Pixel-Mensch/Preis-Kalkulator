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
        actionHint="Die Demo-Daten erneut einspielen oder einen CompanySettings-Datensatz anlegen. Erst danach sollte die öffentliche Demo verwendet werden."
      />
    );
  }

  return (
    <section className="panel rounded-[2rem] p-6 sm:p-8">
      <div>
        <p className="eyebrow text-[var(--accent-deep)]">Firma</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Firmeneinstellungen</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--foreground-soft)]">
          Diese Angaben werden auf der Landingpage, im Rechner und im PDF verwendet.
        </p>
      </div>

      {resolvedSearchParams.status === "saved" ? (
        <div className="mt-6">
          <AdminNotice variant="success">
            Firmendaten gespeichert. Landingpage, Rechner und PDF nutzen jetzt die neuen Werte.
          </AdminNotice>
        </div>
      ) : null}
      {resolvedSearchParams.status === "invalid" ? (
        <div className="mt-6">
          <AdminNotice variant="error">
            Einige Firmendaten sind ungültig. Bitte die Eingaben prüfen und erneut speichern.
          </AdminNotice>
        </div>
      ) : null}

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <form action={updateCompanySettingsAction} className="grid gap-6">
          <input type="hidden" name="companySettingsId" value={companySettings.id} />

          <section className="rounded-[1.8rem] bg-[var(--surface-muted)] p-5">
            <h2 className="text-lg font-semibold text-slate-950">Kontakt und Absender</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--foreground-soft)]">
              Diese Angaben erscheinen in Landingpage, Rechner, PDF und im Footer.
            </p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-950">Firmenname</span>
                <input
                  name="companyName"
                  defaultValue={companySettings.companyName}
                  className="h-12 w-full rounded-2xl border border-[var(--line)] bg-white px-4 outline-none transition focus:border-[var(--accent)]"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-950">
                  Kontakt E-Mail
                </span>
                <input
                  name="contactEmail"
                  type="email"
                  defaultValue={companySettings.contactEmail}
                  className="h-12 w-full rounded-2xl border border-[var(--line)] bg-white px-4 outline-none transition focus:border-[var(--accent)]"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-950">Telefon</span>
                <input
                  name="contactPhone"
                  defaultValue={companySettings.contactPhone}
                  className="h-12 w-full rounded-2xl border border-[var(--line)] bg-white px-4 outline-none transition focus:border-[var(--accent)]"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-950">Website</span>
                <input
                  name="website"
                  defaultValue={companySettings.website ?? ""}
                  className="h-12 w-full rounded-2xl border border-[var(--line)] bg-white px-4 outline-none transition focus:border-[var(--accent)]"
                />
              </label>
              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-slate-950">
                  Support-Zeiten
                </span>
                <input
                  name="supportHours"
                  defaultValue={companySettings.supportHours ?? ""}
                  className="h-12 w-full rounded-2xl border border-[var(--line)] bg-white px-4 outline-none transition focus:border-[var(--accent)]"
                />
              </label>
            </div>
          </section>

          <section className="rounded-[1.8rem] bg-[var(--surface-muted)] p-5">
            <h2 className="text-lg font-semibold text-slate-950">Standort und Einsatzgebiet</h2>
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
              </label>
            </div>
          </section>

          <section className="rounded-[1.8rem] bg-[var(--surface-muted)] p-5">
            <h2 className="text-lg font-semibold text-slate-950">Kundenhinweis</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--foreground-soft)]">
              Dieser Hinweis erscheint bei Rechner, Ergebnis und PDF. Formulierung ruhig,
              klar und unverbindlich halten.
            </p>
            <label className="mt-5 block">
              <span className="mb-2 block text-sm font-semibold text-slate-950">
                Fußnote für Einschätzung
              </span>
              <textarea
                name="estimateFootnote"
                rows={4}
                defaultValue={companySettings.estimateFootnote}
                className="w-full rounded-3xl border border-[var(--line)] bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]"
              />
            </label>
          </section>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--accent)] px-6 text-sm font-semibold text-white transition hover:bg-[var(--accent-deep)]"
            >
              Firmendaten speichern
            </button>
          </div>
        </form>

        <aside className="space-y-4">
          <section className="rounded-[1.8rem] border border-[var(--line)] bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-950">Aktuelle Vorschau</h2>
            <div className="mt-4 space-y-3 text-sm leading-6 text-[var(--foreground-soft)]">
              <p className="font-semibold text-slate-950">{companySettings.companyName}</p>
              <p>{companySettings.contactPhone}</p>
              <p>{companySettings.contactEmail}</p>
              <p>
                {companySettings.street}, {companySettings.postalCode}{" "}
                {companySettings.city}
              </p>
              <p>{companySettings.serviceAreaNote}</p>
            </div>
          </section>

          <section className="rounded-[1.8rem] border border-[var(--line)] bg-[var(--surface-muted)] p-5">
            <h2 className="text-lg font-semibold text-slate-950">Branding-Hinweis</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--foreground-soft)]">
              Firmenname, Kontakt, Einsatzgebiet und Hinweistext werden zentral aus
              diesen Einstellungen gezogen. Damit lässt sich die Installation später
              pro Betrieb schnell anpassen.
            </p>
          </section>
        </aside>
      </div>
    </section>
  );
}
