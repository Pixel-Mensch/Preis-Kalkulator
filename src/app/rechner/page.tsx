import { CalculatorWizard } from "@/components/calculator/calculator-wizard";
import { ConfigurationState } from "@/components/configuration-state";
import { SiteShell } from "@/components/site-shell";
import { getCompanySettingsState } from "@/lib/company";
import { getActivePricingConfigOrNull } from "@/lib/pricing/config";

export default async function CalculatorPage() {
  const [{ companySettings, isConfigured }, pricingConfig] = await Promise.all([
    getCompanySettingsState(),
    getActivePricingConfigOrNull(),
  ]);
  const isCalculatorAvailable = isConfigured && Boolean(pricingConfig);

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
      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:py-10">
        {isCalculatorAvailable && pricingConfig ? (
          <CalculatorWizard
            pricingConfig={pricingConfig}
            companyName={companySettings.companyName}
            companyPhone={companySettings.contactPhone}
            companyEmail={companySettings.contactEmail}
            serviceAreaNote={companySettings.serviceAreaNote}
            estimateFootnote={companySettings.estimateFootnote}
          />
        ) : (
          <ConfigurationState
            title="Der Rechner ist gerade noch nicht einsatzbereit"
            description="Für eine belastbare Kostenschätzung brauchen wir vollständige Firmendaten und ein aktives Preisprofil. Solange diese Konfiguration fehlt, wird keine Anfrage entgegengenommen."
            actionHint="Im Adminbereich Firmendaten und Preise vervollständigen oder lokal `npm run db:seed` beziehungsweise `npm run db:reset-demo` ausführen."
          />
        )}
      </main>
    </SiteShell>
  );
}
