import { CalculatorWizard } from "@/components/calculator/calculator-wizard";
import { SiteShell } from "@/components/site-shell";
import { getCompanySettings } from "@/lib/company";
import { getActivePricingConfig } from "@/lib/pricing/config";

export default async function CalculatorPage() {
  const [companySettings, pricingConfig] = await Promise.all([
    getCompanySettings(),
    getActivePricingConfig(),
  ]);

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
        <CalculatorWizard
          pricingConfig={pricingConfig}
          companyName={companySettings.companyName}
          companyPhone={companySettings.contactPhone}
          companyEmail={companySettings.contactEmail}
          serviceAreaNote={companySettings.serviceAreaNote}
          estimateFootnote={companySettings.estimateFootnote}
        />
      </main>
    </SiteShell>
  );
}
