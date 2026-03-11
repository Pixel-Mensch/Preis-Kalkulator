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
      street={companySettings.street}
      postalCode={companySettings.postalCode}
      city={companySettings.city}
      serviceAreaNote={companySettings.serviceAreaNote}
      supportHours={companySettings.supportHours}
      isConfigured={isConfigured}
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
            eyebrow="Rechner noch nicht freigegeben"
            title="Der Online-Rechner ist im Moment noch nicht verfügbar"
            description="Für eine belastbare Kostenschätzung brauchen wir vollständige Firmendaten und ein aktives Preisprofil. Solange diese Angaben fehlen, wird keine neue Anfrage angenommen."
            actionLabel="Vor Wiederfreigabe erledigen"
            actionHint="Im Adminbereich Firmendaten und Preise vervollständigen, danach den Rechner einmal mit einem Testfall prüfen."
          />
        )}
      </main>
    </SiteShell>
  );
}
