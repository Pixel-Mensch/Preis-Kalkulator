import { hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const companySettingsId = "default-company-settings";
const pricingProfileId = "default-pricing-profile";

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "ChangeMe123!";

  await prisma.companySettings.upsert({
    where: { id: companySettingsId },
    create: {
      id: companySettingsId,
      companyName: "Klarraum Entruempelung",
      contactEmail: "kontakt@klarraum-entruempelung.de",
      contactPhone: "+49 201 1234567",
      website: "https://www.klarraum-entruempelung.de",
      street: "Musterstrasse 10",
      postalCode: "45127",
      city: "Essen",
      serviceAreaNote: "Essen, Muelheim, Oberhausen und Umgebung",
      estimateFootnote:
        "Diese Einschaetzung ist unverbindlich. Der finale Preis kann nach Sichtung vor Ort abweichen.",
      supportHours: "Mo-Fr 08:00-18:00",
    },
    update: {
      companyName: "Klarraum Entruempelung",
      serviceAreaNote: "Essen, Muelheim, Oberhausen und Umgebung",
      estimateFootnote:
        "Diese Einschaetzung ist unverbindlich. Der finale Preis kann nach Sichtung vor Ort abweichen.",
    },
  });

  await prisma.pricingProfile.upsert({
    where: { id: pricingProfileId },
    create: {
      id: pricingProfileId,
      name: "Standard Entruempelung V1",
      isActive: true,
      minimumOrderValue: 250,
      baseRatePerEffectiveSqm: 14,
      minFactor: 0.92,
      maxFactor: 1.15,
      elevatorReductionFactor: 0.6,
    },
    update: {
      name: "Standard Entruempelung V1",
      isActive: true,
      minimumOrderValue: 250,
      baseRatePerEffectiveSqm: 14,
      minFactor: 0.92,
      maxFactor: 1.15,
      elevatorReductionFactor: 0.6,
    },
  });

  const objectBasePrices = {
    APARTMENT: 120,
    HOUSE: 180,
    CELLAR: 80,
    ATTIC: 90,
    GARAGE: 70,
    OFFICE: 150,
    OTHER: 130,
  } as const;

  for (const [objectType, amount] of Object.entries(objectBasePrices)) {
    await prisma.objectBasePrice.upsert({
      where: {
        profileId_objectType: {
          profileId: pricingProfileId,
          objectType: objectType as keyof typeof objectBasePrices,
        },
      },
      create: {
        profileId: pricingProfileId,
        objectType: objectType as keyof typeof objectBasePrices,
        amount,
      },
      update: { amount },
    });
  }

  const fillLevelFactors = {
    LOW: 0.6,
    NORMAL: 1,
    HEAVY: 1.35,
    EXTREME: 1.75,
  } as const;

  for (const [fillLevel, factor] of Object.entries(fillLevelFactors)) {
    await prisma.fillLevelFactor.upsert({
      where: {
        profileId_fillLevel: {
          profileId: pricingProfileId,
          fillLevel: fillLevel as keyof typeof fillLevelFactors,
        },
      },
      create: {
        profileId: pricingProfileId,
        fillLevel: fillLevel as keyof typeof fillLevelFactors,
        factor,
      },
      update: { factor },
    });
  }

  const floorSurcharges = {
    GROUND: 0,
    FLOOR_1: 20,
    FLOOR_2: 45,
    FLOOR_3: 75,
    FLOOR_4_PLUS: 110,
  } as const;

  for (const [floorLevel, amount] of Object.entries(floorSurcharges)) {
    await prisma.floorSurcharge.upsert({
      where: {
        profileId_floorLevel: {
          profileId: pricingProfileId,
          floorLevel: floorLevel as keyof typeof floorSurcharges,
        },
      },
      create: {
        profileId: pricingProfileId,
        floorLevel: floorLevel as keyof typeof floorSurcharges,
        amount,
      },
      update: { amount },
    });
  }

  const walkDistanceSurcharges = {
    SHORT: 0,
    MEDIUM: 20,
    LONG: 45,
  } as const;

  for (const [walkDistance, amount] of Object.entries(walkDistanceSurcharges)) {
    await prisma.walkDistanceSurcharge.upsert({
      where: {
        profileId_walkDistance: {
          profileId: pricingProfileId,
          walkDistance: walkDistance as keyof typeof walkDistanceSurcharges,
        },
      },
      create: {
        profileId: pricingProfileId,
        walkDistance: walkDistance as keyof typeof walkDistanceSurcharges,
        amount,
      },
      update: { amount },
    });
  }

  const extraOptionPrices = {
    DISMANTLING: 80,
    KITCHEN_REMOVAL: 180,
    SWEPT_CLEAN: 50,
    EXPRESS: 150,
    EXTRA_AREA: 60,
    BULKY_ITEMS: 120,
  } as const;

  for (const [extraOption, amount] of Object.entries(extraOptionPrices)) {
    await prisma.extraOptionPrice.upsert({
      where: {
        profileId_extraOption: {
          profileId: pricingProfileId,
          extraOption: extraOption as keyof typeof extraOptionPrices,
        },
      },
      create: {
        profileId: pricingProfileId,
        extraOption: extraOption as keyof typeof extraOptionPrices,
        amount,
      },
      update: { amount },
    });
  }

  const travelZones = [
    { zoneCode: "A", label: "Nahbereich", postalPrefixes: "45", amount: 0 },
    { zoneCode: "B", label: "Erweiterter Nahbereich", postalPrefixes: "44,46", amount: 25 },
    { zoneCode: "C", label: "Umland", postalPrefixes: "47,48,58", amount: 50 },
    { zoneCode: "D", label: "Fernbereich", postalPrefixes: "", amount: 85 },
  ] as const;

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

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    create: {
      email: adminEmail,
      name: "Administrator",
      passwordHash: await hash(adminPassword, 12),
    },
    update: {
      name: "Administrator",
      passwordHash: await hash(adminPassword, 12),
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
