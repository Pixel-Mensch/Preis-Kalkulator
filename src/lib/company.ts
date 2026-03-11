import "server-only";

import { prisma } from "@/lib/db";

export const fallbackCompanySettings = {
  id: "fallback-company-settings",
  companyName: "Öffentliche Anfrage",
  contactEmail: "",
  contactPhone: "",
  website: null,
  street: "",
  postalCode: "",
  city: "Region wird festgelegt",
  serviceAreaNote: "Einsatzgebiet und Kontaktdaten werden aktuell vorbereitet.",
  estimateFootnote:
    "Die angezeigte Kostenschätzung ist unverbindlich und dient der ersten Orientierung.",
  supportHours: null,
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
