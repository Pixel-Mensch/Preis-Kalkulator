import { PrismaClient, type ExtraOption, type FillLevel, type FloorLevel, type ObjectType, type TravelZoneCode, type WalkDistance } from "@prisma/client";

import { assertRuntimeEnvironment } from "../src/lib/env";
import { applyDatabaseMigrations } from "./lib/apply-database-migrations";
import { loadLocalEnvFile } from "./lib/load-local-env";

const pricingProfileId = "default-pricing-profile";

const pricingProfileDefaults = {
  id: pricingProfileId,
  name: "Standard Entrümpelung",
  isActive: true,
  minimumOrderValue: 250,
  baseRatePerEffectiveSqm: 14,
  minFactor: 0.92,
  maxFactor: 1.15,
  elevatorReductionFactor: 0.6,
} as const;

const objectBasePrices = {
  APARTMENT: 120,
  HOUSE: 180,
  CELLAR: 80,
  ATTIC: 90,
  GARAGE: 70,
  OFFICE: 150,
  OTHER: 130,
} as const satisfies Record<ObjectType, number>;

const fillLevelFactors = {
  LOW: 0.6,
  NORMAL: 1,
  HEAVY: 1.35,
  EXTREME: 1.75,
} as const satisfies Record<FillLevel, number>;

const floorSurcharges = {
  GROUND: 0,
  FLOOR_1: 20,
  FLOOR_2: 45,
  FLOOR_3: 75,
  FLOOR_4_PLUS: 110,
} as const satisfies Record<FloorLevel, number>;

const walkDistanceSurcharges = {
  SHORT: 0,
  MEDIUM: 20,
  LONG: 45,
} as const satisfies Record<WalkDistance, number>;

const extraOptionPrices = {
  DISMANTLING: 80,
  KITCHEN_REMOVAL: 180,
  SWEPT_CLEAN: 50,
  EXPRESS: 150,
  EXTRA_AREA: 60,
  BULKY_ITEMS: 120,
} as const satisfies Record<ExtraOption, number>;

const travelZones = [
  { zoneCode: "A", label: "Nahbereich", postalPrefixes: "", amount: 0 },
  { zoneCode: "B", label: "Zone B", postalPrefixes: "", amount: 25 },
  { zoneCode: "C", label: "Zone C", postalPrefixes: "", amount: 50 },
  { zoneCode: "D", label: "Fernbereich", postalPrefixes: "", amount: 85 },
] as const satisfies ReadonlyArray<{
  zoneCode: TravelZoneCode;
  label: string;
  postalPrefixes: string;
  amount: number;
}>;

function typedEntries<Key extends string, Value>(record: Record<Key, Value>) {
  return Object.entries(record) as Array<[Key, Value]>;
}

function ensureProductionNodeEnvDefault() {
  const runtimeProcessEnv = process.env as Record<string, string | undefined>;

  if (!runtimeProcessEnv.NODE_ENV) {
    runtimeProcessEnv.NODE_ENV = "production";
  }
}

async function ensurePricingProfile(prisma: PrismaClient) {
  await prisma.pricingProfile.upsert({
    where: { id: pricingProfileId },
    create: pricingProfileDefaults,
    update: pricingProfileDefaults,
  });

  for (const [objectType, amount] of typedEntries(objectBasePrices)) {
    await prisma.objectBasePrice.upsert({
      where: {
        profileId_objectType: {
          profileId: pricingProfileId,
          objectType,
        },
      },
      create: {
        profileId: pricingProfileId,
        objectType,
        amount,
      },
      update: { amount },
    });
  }

  for (const [fillLevel, factor] of typedEntries(fillLevelFactors)) {
    await prisma.fillLevelFactor.upsert({
      where: {
        profileId_fillLevel: {
          profileId: pricingProfileId,
          fillLevel,
        },
      },
      create: {
        profileId: pricingProfileId,
        fillLevel,
        factor,
      },
      update: { factor },
    });
  }

  for (const [floorLevel, amount] of typedEntries(floorSurcharges)) {
    await prisma.floorSurcharge.upsert({
      where: {
        profileId_floorLevel: {
          profileId: pricingProfileId,
          floorLevel,
        },
      },
      create: {
        profileId: pricingProfileId,
        floorLevel,
        amount,
      },
      update: { amount },
    });
  }

  for (const [walkDistance, amount] of typedEntries(walkDistanceSurcharges)) {
    await prisma.walkDistanceSurcharge.upsert({
      where: {
        profileId_walkDistance: {
          profileId: pricingProfileId,
          walkDistance,
        },
      },
      create: {
        profileId: pricingProfileId,
        walkDistance,
        amount,
      },
      update: { amount },
    });
  }

  for (const [extraOption, amount] of typedEntries(extraOptionPrices)) {
    await prisma.extraOptionPrice.upsert({
      where: {
        profileId_extraOption: {
          profileId: pricingProfileId,
          extraOption,
        },
      },
      create: {
        profileId: pricingProfileId,
        extraOption,
        amount,
      },
      update: { amount },
    });
  }

  for (const travelZone of travelZones) {
    await prisma.travelZone.upsert({
      where: {
        profileId_zoneCode: {
          profileId: pricingProfileId,
          zoneCode: travelZone.zoneCode,
        },
      },
      create: {
        profileId: pricingProfileId,
        zoneCode: travelZone.zoneCode,
        label: travelZone.label,
        postalPrefixes: travelZone.postalPrefixes,
        amount: travelZone.amount,
      },
      update: {
        label: travelZone.label,
        postalPrefixes: travelZone.postalPrefixes,
        amount: travelZone.amount,
      },
    });
  }
}

async function maybeCreateCompanySettings(prisma: PrismaClient) {
  const environmentValues = {
    companyName: process.env.COMPANY_NAME?.trim(),
    contactEmail: process.env.COMPANY_EMAIL?.trim().toLowerCase(),
    contactPhone: process.env.COMPANY_PHONE?.trim(),
    website: process.env.COMPANY_WEBSITE?.trim() || null,
    street: process.env.COMPANY_STREET?.trim(),
    postalCode: process.env.COMPANY_POSTAL_CODE?.trim(),
    city: process.env.COMPANY_CITY?.trim(),
    serviceAreaNote: process.env.COMPANY_SERVICE_AREA_NOTE?.trim(),
    estimateFootnote: process.env.COMPANY_ESTIMATE_FOOTNOTE?.trim(),
    supportHours: process.env.COMPANY_SUPPORT_HOURS?.trim() || null,
  };

  const requiredKeys = [
    "companyName",
    "contactEmail",
    "contactPhone",
    "street",
    "postalCode",
    "city",
    "serviceAreaNote",
    "estimateFootnote",
  ] as const;

  const providedRequiredValues = requiredKeys.filter((key) => Boolean(environmentValues[key]));

  if (providedRequiredValues.length === 0) {
    console.log(
      "Skipping company settings bootstrap because no COMPANY_* environment values were provided.",
    );
    return;
  }

  if (providedRequiredValues.length !== requiredKeys.length) {
    throw new Error(
      "Incomplete company bootstrap values. Provide all required COMPANY_* variables or none of them.",
    );
  }

  await prisma.companySettings.upsert({
    where: {
      id: "default-company-settings",
    },
    create: {
      id: "default-company-settings",
      companyName: environmentValues.companyName!,
      contactEmail: environmentValues.contactEmail!,
      contactPhone: environmentValues.contactPhone!,
      website: environmentValues.website,
      street: environmentValues.street!,
      postalCode: environmentValues.postalCode!,
      city: environmentValues.city!,
      serviceAreaNote: environmentValues.serviceAreaNote!,
      estimateFootnote: environmentValues.estimateFootnote!,
      supportHours: environmentValues.supportHours,
    },
    update: {
      companyName: environmentValues.companyName!,
      contactEmail: environmentValues.contactEmail!,
      contactPhone: environmentValues.contactPhone!,
      website: environmentValues.website,
      street: environmentValues.street!,
      postalCode: environmentValues.postalCode!,
      city: environmentValues.city!,
      serviceAreaNote: environmentValues.serviceAreaNote!,
      estimateFootnote: environmentValues.estimateFootnote!,
      supportHours: environmentValues.supportHours,
    },
  });

  console.log("Company settings were created or updated from COMPANY_* environment values.");
}

async function main() {
  loadLocalEnvFile();
  ensureProductionNodeEnvDefault();
  assertRuntimeEnvironment();

  console.log("Applying schema bootstrap for single-instance setup.");
  await applyDatabaseMigrations();

  console.log("Synchronizing admin credentials from environment.");
  const { main: syncAdminUser } = await import("./sync-admin-user");
  await syncAdminUser();

  const prisma = new PrismaClient();

  try {
    await ensurePricingProfile(prisma);
    await maybeCreateCompanySettings(prisma);
  } finally {
    await prisma.$disconnect();
  }

  console.log("Single-instance bootstrap finished.");
  console.log(
    "Next step: log into /admin, verify company data and pricing values, then check /api/health.",
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
