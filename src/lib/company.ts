import "server-only";

import { prisma } from "@/lib/db";

export async function getCompanySettings() {
  const companySettings = await prisma.companySettings.findFirst({
    orderBy: {
      createdAt: "asc",
    },
  });

  if (!companySettings) {
    throw new Error("Company settings are missing. Run the seed command first.");
  }

  return companySettings;
}
