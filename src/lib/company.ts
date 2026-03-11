import "server-only";

import { prisma } from "@/lib/db";

export const fallbackCompanySettings = {
  id: "fallback-company-settings",
  companyName: "Entrümpler Angebotsrechner",
  contactEmail: "kontakt@example.de",
  contactPhone: "+49 000 000000",
  website: null,
  street: "Musterstraße 1",
  postalCode: "00000",
  city: "Musterstadt",
  serviceAreaNote: "Das Einsatzgebiet wird gerade eingerichtet.",
  estimateFootnote:
    "Die angezeigte Kostenschätzung ist unverbindlich und dient der ersten Orientierung.",
  supportHours: "Bitte Firmendaten im Adminbereich vervollständigen.",
  createdAt: new Date(0),
  updatedAt: new Date(0),
} as const;

export async function getCompanySettingsOrNull() {
  return prisma.companySettings.findFirst({
    orderBy: {
      createdAt: "asc",
    },
  });
}

export async function getCompanySettingsState() {
  const companySettings = await getCompanySettingsOrNull();

  return {
    companySettings: companySettings ?? fallbackCompanySettings,
    isConfigured: Boolean(companySettings),
  };
}

export async function getCompanySettings() {
  const companySettings = await getCompanySettingsOrNull();

  if (!companySettings) {
    throw new Error("Company settings are missing. Run the seed command first.");
  }

  return companySettings;
}
