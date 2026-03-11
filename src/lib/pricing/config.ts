import "server-only";

import { prisma } from "@/lib/db";
import {
  extraOptions,
  fillLevels,
  floorLevels,
  objectTypes,
  travelZoneCodes,
  type ExtraOption,
  type FillLevel,
  type FloorLevel,
  type ObjectType,
  type PricingConfig,
  type TravelZoneCode,
  type WalkDistance,
  walkDistances,
} from "@/lib/pricing/types";

async function getActivePricingProfileRow() {
  return prisma.pricingProfile.findFirst({
    where: {
      isActive: true,
    },
    include: {
      objectBasePrices: true,
      fillLevelFactors: true,
      floorSurcharges: true,
      walkDistanceSurcharges: true,
      extraOptionPrices: true,
      travelZones: true,
    },
  });
}

type PricingProfileRow = NonNullable<Awaited<ReturnType<typeof getActivePricingProfileRow>>>;

function requireAmount(
  matchedAmount: number | undefined,
  label: string,
) {
  if (typeof matchedAmount !== "number") {
    throw new Error(`Missing pricing configuration for ${label}`);
  }

  return matchedAmount;
}

function buildNumericRecord<Key extends string>(
  keys: readonly Key[],
  resolver: (key: Key) => number,
) {
  return Object.fromEntries(keys.map((key) => [key, resolver(key)])) as Record<Key, number>;
}

export function mapPricingProfileToConfig(profile: PricingProfileRow): PricingConfig {
  const objectBasePrices = buildNumericRecord<ObjectType>(objectTypes, (objectType) =>
    requireAmount(
      profile.objectBasePrices.find((entry) => entry.objectType === objectType)?.amount,
      objectType,
    ),
  );

  const fillLevelFactors = buildNumericRecord<FillLevel>(fillLevels, (fillLevel) =>
    requireAmount(
      profile.fillLevelFactors.find((entry) => entry.fillLevel === fillLevel)?.factor,
      fillLevel,
    ),
  );

  const floorSurcharges = buildNumericRecord<FloorLevel>(floorLevels, (floorLevel) =>
    requireAmount(
      profile.floorSurcharges.find((entry) => entry.floorLevel === floorLevel)?.amount,
      floorLevel,
    ),
  );

  const walkDistanceSurcharges = buildNumericRecord<WalkDistance>(
    walkDistances,
    (walkDistance) =>
      requireAmount(
        profile.walkDistanceSurcharges.find(
          (entry) => entry.walkDistance === walkDistance,
        )?.amount,
        walkDistance,
      ),
  );

  const extraOptionPrices = buildNumericRecord<ExtraOption>(extraOptions, (extraOption) =>
    requireAmount(
      profile.extraOptionPrices.find((entry) => entry.extraOption === extraOption)?.amount,
      extraOption,
    ),
  );

  const travelZones = travelZoneCodes.map((zoneCode) => {
    const zone = profile.travelZones.find((entry) => entry.zoneCode === zoneCode);

    if (!zone) {
      throw new Error(`Missing travel zone configuration for ${zoneCode}`);
    }

    return {
      code: zone.zoneCode as TravelZoneCode,
      label: zone.label,
      surcharge: zone.amount,
      postalPrefixes: zone.postalPrefixes
        .split(",")
        .map((prefix) => prefix.trim())
        .filter(Boolean),
    };
  });

  return {
    profileId: profile.id,
    profileName: profile.name,
    minimumOrderValue: profile.minimumOrderValue,
    baseRatePerEffectiveSqm: profile.baseRatePerEffectiveSqm,
    minFactor: profile.minFactor,
    maxFactor: profile.maxFactor,
    elevatorReductionFactor: profile.elevatorReductionFactor,
    objectBasePrices,
    fillLevelFactors,
    floorSurcharges,
    walkDistanceSurcharges,
    extraOptionPrices,
    travelZones,
  };
}

export async function getActivePricingConfig() {
  const profile = await getActivePricingProfileRow();

  if (!profile) {
    throw new Error("No active pricing profile found.");
  }

  return mapPricingProfileToConfig(profile);
}

export async function getActivePricingConfigOrNull() {
  const profile = await getActivePricingProfileRow();

  if (!profile) {
    return null;
  }

  try {
    return mapPricingProfileToConfig(profile);
  } catch {
    return null;
  }
}
