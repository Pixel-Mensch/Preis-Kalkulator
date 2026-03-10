import { updateCompanySettingsAction } from "@/app/admin/(protected)/actions";
import { AdminNotice } from "@/components/admin/admin-notice";
import { getCompanySettings } from "@/lib/company";

type CompanySettingsPageProps = {
  searchParams: Promise<{
    status?: string;
  }>;
};

export default async function CompanySettingsPage({
  searchParams,
}: CompanySettingsPageProps) {
  const resolvedSearchParams = await searchParams;
  const companySettings = await getCompanySettings();

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
            Einige Firmendaten sind ungueltig. Bitte die Eingaben pruefen und erneut speichern.
          </AdminNotice>
        </div>
      ) : null}

      <form action={updateCompanySettingsAction} className="mt-8 grid gap-4 md:grid-cols-2">
        <input type="hidden" name="companySettingsId" value={companySettings.id} />

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-950">Firmenname</span>
          <input
            name="companyName"
            defaultValue={companySettings.companyName}
            className="h-12 w-full rounded-2xl border border-[var(--line)] bg-white px-4 outline-none transition focus:border-[var(--accent)]"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-950">Kontakt E-Mail</span>
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
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-950">Strasse</span>
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
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-950">Support-Zeiten</span>
          <input
            name="supportHours"
            defaultValue={companySettings.supportHours ?? ""}
            className="h-12 w-full rounded-2xl border border-[var(--line)] bg-white px-4 outline-none transition focus:border-[var(--accent)]"
          />
        </label>
        <label className="block md:col-span-2">
          <span className="mb-2 block text-sm font-semibold text-slate-950">Einsatzgebiet</span>
          <input
            name="serviceAreaNote"
            defaultValue={companySettings.serviceAreaNote}
            className="h-12 w-full rounded-2xl border border-[var(--line)] bg-white px-4 outline-none transition focus:border-[var(--accent)]"
          />
        </label>
        <label className="block md:col-span-2">
          <span className="mb-2 block text-sm font-semibold text-slate-950">
            Fussnote fuer Einschaetzung
          </span>
          <textarea
            name="estimateFootnote"
            rows={4}
            defaultValue={companySettings.estimateFootnote}
            className="w-full rounded-3xl border border-[var(--line)] bg-white px-4 py-3 outline-none transition focus:border-[var(--accent)]"
          />
        </label>

        <div className="md:col-span-2 flex justify-end">
          <button
            type="submit"
            className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--accent)] px-6 text-sm font-semibold text-white transition hover:bg-[var(--accent-deep)]"
          >
            Firmendaten speichern
          </button>
        </div>
      </form>
    </section>
  );
}
