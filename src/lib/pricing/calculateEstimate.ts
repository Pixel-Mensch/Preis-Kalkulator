import { formatCurrency } from "@/lib/format";
import {
  extraOptionLabels,
  type EstimateInput,
  type EstimateResult,
  type PricingConfig,
} from "@/lib/pricing/types";
import { resolveTravelZone } from "@/lib/pricing/zoneResolver";

function roundDownToNearestTen(value: number) {
  return Math.floor(value / 10) * 10;
}

function roundUpToNearestTen(value: number) {
  return Math.ceil(value / 10) * 10;
}

export function calculateEstimate(
  pricingConfig: PricingConfig,
  input: EstimateInput,
): EstimateResult {
  const travelZone = resolveTravelZone(input.postalCode, pricingConfig.travelZones);

  if (!travelZone) {
    throw new Error("No travel zone configuration is available.");
  }

  const effectiveArea = Number(
    (input.areaSqm * pricingConfig.fillLevelFactors[input.fillLevel]).toFixed(1),
  );
  const basePrice = pricingConfig.objectBasePrices[input.objectType];
  const effectiveAreaCost = Math.round(effectiveArea * pricingConfig.baseRatePerEffectiveSqm);

  const rawFloorSurcharge = pricingConfig.floorSurcharges[input.floorLevel];
  const floorSurcharge =
    input.hasElevator && input.floorLevel !== "GROUND"
      ? Math.round(rawFloorSurcharge * pricingConfig.elevatorReductionFactor)
      : rawFloorSurcharge;

  const walkDistanceSurcharge =
    pricingConfig.walkDistanceSurcharges[input.walkDistance];

  const extraSurcharges = input.extraOptions.map((extraOption) => ({
    code: extraOption,
    label: extraOptionLabels[extraOption],
    amount: pricingConfig.extraOptionPrices[extraOption],
  }));

  const extraTotal = extraSurcharges.reduce((sum, surcharge) => sum + surcharge.amount, 0);

  const subtotalBeforeMinimum =
    basePrice +
    effectiveAreaCost +
    floorSurcharge +
    walkDistanceSurcharge +
    extraTotal +
    travelZone.surcharge;

  const subtotal = Math.max(subtotalBeforeMinimum, pricingConfig.minimumOrderValue);
  const minimumOrderApplied = subtotalBeforeMinimum < pricingConfig.minimumOrderValue;

  const rangeMin = roundDownToNearestTen(subtotal * pricingConfig.minFactor);
  const calculatedMax = roundUpToNearestTen(subtotal * pricingConfig.maxFactor);
  const rangeMax = calculatedMax <= rangeMin ? rangeMin + 20 : calculatedMax;

  return {
    travelZoneCode: travelZone.code,
    travelZoneLabel: travelZone.label,
    effectiveArea,
    basePrice,
    effectiveAreaCost,
    floorSurcharge,
    walkDistanceSurcharge,
    travelZoneSurcharge: travelZone.surcharge,
    extraSurcharges,
    subtotalBeforeMinimum,
    subtotal,
    minimumOrderApplied,
    rangeMin,
    rangeMax,
    rangeText: `${formatCurrency(rangeMin)} bis ${formatCurrency(rangeMax)}`,
  };
}
