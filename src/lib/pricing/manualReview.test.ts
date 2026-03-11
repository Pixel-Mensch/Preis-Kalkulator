import { describe, expect, it } from "vitest";

import { calculateEstimate } from "@/lib/pricing/calculateEstimate";
import { getManualReviewReasons, requiresManualReview } from "@/lib/pricing/manualReview";
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

function createEstimate(input: EstimateInput) {
  return calculateEstimate(pricingConfig, input);
}

describe("manual review rules", () => {
  it("does not require manual review for a standard apartment case", () => {
    const input: EstimateInput = {
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
    };

    const reasons = getManualReviewReasons(input, createEstimate(input));

    expect(reasons).toHaveLength(0);
    expect(requiresManualReview(reasons)).toBe(false);
  });

  it("marks explicit problem flags for manual review", () => {
    const input: EstimateInput = {
      objectType: "APARTMENT",
      additionalAreas: [],
      areaSqm: 85,
      roomCount: 3,
      fillLevel: "HEAVY",
      floorLevel: "FLOOR_1",
      hasElevator: false,
      walkDistance: "SHORT",
      extraOptions: [],
      problemFlags: ["MOLD", "PEST_INFESTATION"],
      postalCode: "45127",
    };

    const reasons = getManualReviewReasons(input, createEstimate(input));

    expect(reasons.map((reason) => reason.code)).toEqual(
      expect.arrayContaining(["FLAG_MOLD", "FLAG_PEST_INFESTATION"]),
    );
    expect(requiresManualReview(reasons)).toBe(true);
  });

  it("marks postal codes outside configured prefixes for manual review", () => {
    const input: EstimateInput = {
      objectType: "APARTMENT",
      additionalAreas: [],
      areaSqm: 75,
      roomCount: 3,
      fillLevel: "NORMAL",
      floorLevel: "FLOOR_1",
      hasElevator: false,
      walkDistance: "SHORT",
      extraOptions: [],
      problemFlags: [],
      postalCode: "50999",
    };

    const reasons = getManualReviewReasons(input, createEstimate(input));

    expect(reasons.map((reason) => reason.code)).toContain("OUTSIDE_SERVICE_AREA");
    expect(requiresManualReview(reasons)).toBe(true);
  });
});
