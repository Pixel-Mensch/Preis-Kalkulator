import { describe, expect, it } from "vitest";

import { calculateEstimate } from "@/lib/pricing/calculateEstimate";
import { getManualReviewReasons } from "@/lib/pricing/manualReview";
import type { EstimateInput, PricingConfig } from "@/lib/pricing/types";

const pricingConfig: PricingConfig = {
  profileId: "profile",
  profileName: "Standard",
  minimumOrderValue: 250,
  baseRatePerEffectiveSqm: 14,
  minFactor: 0.92,
  maxFactor: 1.15,
  elevatorReductionFactor: 0.6,
  objectBasePrices: {
    APARTMENT: 120,
    HOUSE: 180,
    CELLAR: 80,
    ATTIC: 90,
    GARAGE: 70,
    OFFICE: 150,
    OTHER: 130,
  },
  fillLevelFactors: {
    LOW: 0.6,
    NORMAL: 1,
    HEAVY: 1.35,
    EXTREME: 1.75,
  },
  floorSurcharges: {
    GROUND: 0,
    FLOOR_1: 20,
    FLOOR_2: 45,
    FLOOR_3: 75,
    FLOOR_4_PLUS: 110,
  },
  walkDistanceSurcharges: {
    SHORT: 0,
    MEDIUM: 20,
    LONG: 45,
  },
  extraOptionPrices: {
    DISMANTLING: 80,
    KITCHEN_REMOVAL: 180,
    SWEPT_CLEAN: 50,
    EXPRESS: 150,
    EXTRA_AREA: 60,
    BULKY_ITEMS: 120,
  },
  travelZones: [
    { code: "A", label: "Nahbereich", surcharge: 0, postalPrefixes: ["45"] },
    { code: "B", label: "Erweitert", surcharge: 25, postalPrefixes: ["44", "46"] },
    { code: "C", label: "Umland", surcharge: 50, postalPrefixes: ["47", "48"] },
    { code: "D", label: "Fernbereich", surcharge: 85, postalPrefixes: [] },
  ],
};

describe("calculateEstimate", () => {
  it("calculates a realistic range for a normal apartment inquiry", () => {
    const result = calculateEstimate(pricingConfig, {
      objectType: "APARTMENT",
      areaSqm: 60,
      roomCount: 3,
      fillLevel: "NORMAL",
      floorLevel: "FLOOR_2",
      hasElevator: true,
      walkDistance: "MEDIUM",
      extraOptions: ["SWEPT_CLEAN"],
      problemFlags: [],
      postalCode: "45127",
    });

    expect(result.travelZoneCode).toBe("A");
    expect(result.floorSurcharge).toBe(27);
    expect(result.subtotal).toBe(1057);
    expect(result.rangeMin).toBe(970);
    expect(result.rangeMax).toBe(1220);
  });

  it("applies the minimum order value for very small jobs", () => {
    const result = calculateEstimate(pricingConfig, {
      objectType: "CELLAR",
      areaSqm: 5,
      roomCount: 1,
      fillLevel: "LOW",
      floorLevel: "GROUND",
      hasElevator: false,
      walkDistance: "SHORT",
      extraOptions: [],
      problemFlags: [],
      postalCode: "45144",
    });

    expect(result.minimumOrderApplied).toBe(true);
    expect(result.subtotal).toBe(250);
    expect(result.rangeMin).toBe(230);
    expect(result.rangeMax).toBe(290);
  });

  it("flags manual review for large high-risk combinations", () => {
    const input: EstimateInput = {
      objectType: "HOUSE",
      areaSqm: 280,
      roomCount: 10,
      fillLevel: "EXTREME",
      floorLevel: "FLOOR_4_PLUS",
      hasElevator: false,
      walkDistance: "LONG",
      extraOptions: ["KITCHEN_REMOVAL", "BULKY_ITEMS"],
      problemFlags: ["HOARDING"],
      postalCode: "50999",
    };

    const estimate = calculateEstimate(pricingConfig, input);
    const reasons = getManualReviewReasons(input, estimate);

    expect(estimate.travelZoneCode).toBe("D");
    expect(reasons.map((reason) => reason.code)).toEqual(
      expect.arrayContaining([
        "LARGE_AREA",
        "EXTREME_ACCESS",
        "LARGE_HOUSE",
        "LONG_DISTANCE_LARGE_JOB",
        "FLAG_HOARDING",
      ]),
    );
  });
});
