import { hash } from "bcryptjs";
import {
  PrismaClient,
  type ExtraOption,
  type FillLevel,
  type FloorLevel,
  type InquiryStatus,
  type ObjectType,
  type WalkDistance,
} from "@prisma/client";

import { serializeInquirySnapshot } from "../src/lib/inquiries";
import { calculateEstimate } from "../src/lib/pricing/calculateEstimate";
import {
  getManualReviewReasons,
  requiresManualReview,
} from "../src/lib/pricing/manualReview";
import type { PricingConfig } from "../src/lib/pricing/types";
import type { PublicInquiryInput } from "../src/lib/validation";

const prisma = new PrismaClient();

const companySettingsId = "default-company-settings";
const pricingProfileId = "default-pricing-profile";

const companyDefaults = {
  id: companySettingsId,
  companyName: "Klarraum Entrümpelung Ruhr",
  contactEmail: "demo@klarraum-ruhr.de",
  contactPhone: "+49 201 987650",
  website: "https://www.klarraum-ruhr.de",
  street: "Rellinghauser Straße 18",
  postalCode: "45128",
  city: "Essen",
  serviceAreaNote: "Essen, Mülheim, Oberhausen, Duisburg und das westliche Ruhrgebiet",
  estimateFootnote:
    "Die angezeigte Kostenschätzung ist unverbindlich und dient der ersten Orientierung. Nach Sichtung vor Ort oder Rücksprache kann der Aufwand abweichen.",
  supportHours: "Mo-Fr 08:00-18:00, Sa 09:00-13:00",
} as const;

const pricingProfileDefaults = {
  id: pricingProfileId,
  name: "Standard Entrümpelung Ruhrgebiet",
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
  { zoneCode: "A", label: "Nahbereich Essen", postalPrefixes: "45", amount: 0 },
  {
    zoneCode: "B",
    label: "Ruhrgebiet nah",
    postalPrefixes: "44,46",
    amount: 25,
  },
  { zoneCode: "C", label: "Ruhrgebiet erweitert", postalPrefixes: "47,48,58", amount: 50 },
  { zoneCode: "D", label: "Fernbereich", postalPrefixes: "", amount: 85 },
] as const;

const pricingConfig: PricingConfig = {
  profileId: pricingProfileDefaults.id,
  profileName: pricingProfileDefaults.name,
  minimumOrderValue: pricingProfileDefaults.minimumOrderValue,
  baseRatePerEffectiveSqm: pricingProfileDefaults.baseRatePerEffectiveSqm,
  minFactor: pricingProfileDefaults.minFactor,
  maxFactor: pricingProfileDefaults.maxFactor,
  elevatorReductionFactor: pricingProfileDefaults.elevatorReductionFactor,
  objectBasePrices: { ...objectBasePrices },
  fillLevelFactors: { ...fillLevelFactors },
  floorSurcharges: { ...floorSurcharges },
  walkDistanceSurcharges: { ...walkDistanceSurcharges },
  extraOptionPrices: { ...extraOptionPrices },
  travelZones: travelZones.map((zone) => ({
    code: zone.zoneCode,
    label: zone.label,
    surcharge: zone.amount,
    postalPrefixes: zone.postalPrefixes
      ? zone.postalPrefixes.split(",").map((prefix) => prefix.trim())
      : [],
  })),
};

type DemoInquirySeed = {
  publicId: string;
  status: InquiryStatus;
  createdAt: Date;
  input: PublicInquiryInput;
};

const demoInquiries: DemoInquirySeed[] = [
  {
    publicId: "DEMO1001",
    status: "NEW",
    createdAt: new Date("2026-03-07T08:30:00.000Z"),
    input: {
      objectType: "APARTMENT",
      additionalAreas: ["CELLAR"],
      areaSqm: 58,
      roomCount: 2,
      fillLevel: "NORMAL",
      floorLevel: "FLOOR_2",
      hasElevator: false,
      walkDistance: "SHORT",
      extraOptions: ["SWEPT_CLEAN"],
      problemFlags: [],
      postalCode: "45131",
      desiredDate: "2026-03-14",
      name: "Sabine Krüger",
      phone: "+49 173 2211044",
      email: "sabine.krueger@example.de",
      website: undefined,
      message:
        "Die Wohnung ist bereits gekündigt. Zugang über den Innenhof, Parken kurz vor dem Haus möglich.",
    },
  },
  {
    publicId: "DEMO1002",
    status: "SITE_VISIT_SCHEDULED",
    createdAt: new Date("2026-03-06T13:10:00.000Z"),
    input: {
      objectType: "HOUSE",
      additionalAreas: ["CELLAR", "ATTIC"],
      areaSqm: 140,
      roomCount: 6,
      fillLevel: "HEAVY",
      floorLevel: "GROUND",
      hasElevator: false,
      walkDistance: "MEDIUM",
      extraOptions: ["DISMANTLING", "KITCHEN_REMOVAL", "SWEPT_CLEAN"],
      problemFlags: [],
      postalCode: "45470",
      desiredDate: "2026-03-18",
      name: "Thomas Neumann",
      phone: "+49 171 3407752",
      email: "thomas.neumann@example.de",
      website: undefined,
      message:
        "Hausverkauf steht an. Die Küche soll komplett entfernt werden, im Keller stehen noch Werkbänke.",
    },
  },
  {
    publicId: "DEMO1003",
    status: "IN_PROGRESS",
    createdAt: new Date("2026-03-08T10:25:00.000Z"),
    input: {
      objectType: "APARTMENT",
      additionalAreas: [],
      areaSqm: 85,
      roomCount: 3,
      fillLevel: "EXTREME",
      floorLevel: "FLOOR_4_PLUS",
      hasElevator: false,
      walkDistance: "MEDIUM",
      extraOptions: ["BULKY_ITEMS"],
      problemFlags: ["HOARDING", "MOLD"],
      postalCode: "47051",
      desiredDate: "2026-03-16",
      name: "Aylin Demir",
      phone: "+49 176 4489213",
      email: "aylin.demir@example.de",
      website: undefined,
      message:
        "Bitte zunächst telefonisch abstimmen. Im Schlafzimmer gibt es Schimmel an einer Außenwand.",
    },
  },
  {
    publicId: "DEMO1004",
    status: "OFFER_SENT",
    createdAt: new Date("2026-03-05T07:50:00.000Z"),
    input: {
      objectType: "GARAGE",
      additionalAreas: [],
      areaSqm: 34,
      roomCount: undefined,
      fillLevel: "HEAVY",
      floorLevel: "GROUND",
      hasElevator: false,
      walkDistance: "LONG",
      extraOptions: ["EXTRA_AREA", "BULKY_ITEMS"],
      problemFlags: [],
      postalCode: "44623",
      desiredDate: "2026-03-13",
      name: "Michael Hoffmann",
      phone: "+49 152 88934017",
      email: "m.hoffmann@example.de",
      website: undefined,
      message:
        "Zur Garage gehört noch ein kleiner Nebenraum. Einige schwere Metallregale müssen mit raus.",
    },
  },
];

function typedEntries<Key extends string, Value>(record: Record<Key, Value>) {
  return Object.entries(record) as Array<[Key, Value]>;
}

async function upsertPricingRows() {
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

async function seedDemoInquiries() {
  const inquiryCount = await prisma.inquiry.count();

  if (inquiryCount > 0) {
    return;
  }

  for (const demoInquiry of demoInquiries) {
    const estimate = calculateEstimate(pricingConfig, demoInquiry.input);
    const manualReviewReasons = getManualReviewReasons(demoInquiry.input, estimate);
    const manualReviewRequired = requiresManualReview(manualReviewReasons);

    await prisma.inquiry.create({
      data: {
        publicId: demoInquiry.publicId,
        pricingProfileId: pricingProfileId,
        status: demoInquiry.status,
        customerName: demoInquiry.input.name,
        customerEmail: demoInquiry.input.email,
        customerPhone: demoInquiry.input.phone,
        postalCode: demoInquiry.input.postalCode,
        desiredDate: demoInquiry.input.desiredDate
          ? new Date(demoInquiry.input.desiredDate)
          : null,
        message: demoInquiry.input.message,
        objectType: demoInquiry.input.objectType,
        areaSqm: demoInquiry.input.areaSqm,
        roomCount: demoInquiry.input.roomCount,
        fillLevel: demoInquiry.input.fillLevel,
        floorLevel: demoInquiry.input.floorLevel,
        hasElevator: demoInquiry.input.hasElevator,
        walkDistance: demoInquiry.input.walkDistance,
        travelZoneCode: estimate.travelZoneCode,
        extraOptions: JSON.stringify(demoInquiry.input.extraOptions),
        problemFlags: JSON.stringify(demoInquiry.input.problemFlags),
        manualReviewRequired,
        manualReviewReasons: JSON.stringify(manualReviewReasons),
        estimateMin: estimate.rangeMin,
        estimateMax: estimate.rangeMax,
        inputSnapshot: JSON.stringify(demoInquiry.input),
        calculationSnapshot: serializeInquirySnapshot({
          createdAt: demoInquiry.createdAt.toISOString(),
          pricingConfig,
          estimate,
          manualReviewReasons,
          input: demoInquiry.input,
        }),
        createdAt: demoInquiry.createdAt,
        updatedAt: demoInquiry.createdAt,
      },
    });
  }
}

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "demo@klarraum-ruhr.de";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "ChangeMe123!";

  await prisma.companySettings.upsert({
    where: { id: companySettingsId },
    create: companyDefaults,
    update: companyDefaults,
  });

  await prisma.pricingProfile.upsert({
    where: { id: pricingProfileId },
    create: pricingProfileDefaults,
    update: pricingProfileDefaults,
  });

  await upsertPricingRows();

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    create: {
      email: adminEmail,
      name: "Demo Admin",
      passwordHash: await hash(adminPassword, 12),
    },
    update: {
      name: "Demo Admin",
      passwordHash: await hash(adminPassword, 12),
    },
  });

  await seedDemoInquiries();
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
