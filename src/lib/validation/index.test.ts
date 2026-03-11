import { describe, expect, it } from "vitest";

import { parsePricingSettingsFormData, publicInquirySchema } from "@/lib/validation";

function createValidPricingFormData() {
  const formData = new FormData();

  formData.set("profileName", "Standard Entruempelung V1");
  formData.set("minimumOrderValue", "250");
  formData.set("baseRatePerEffectiveSqm", "14");
  formData.set("minFactor", "0.92");
  formData.set("maxFactor", "1.15");
  formData.set("elevatorReductionFactor", "0.6");

  for (const [key, value] of Object.entries({
    "objectBasePrice.APARTMENT": "120",
    "objectBasePrice.HOUSE": "180",
    "objectBasePrice.CELLAR": "80",
    "objectBasePrice.ATTIC": "90",
    "objectBasePrice.GARAGE": "70",
    "objectBasePrice.OFFICE": "150",
    "objectBasePrice.OTHER": "130",
    "fillLevelFactor.LOW": "0.6",
    "fillLevelFactor.NORMAL": "1",
    "fillLevelFactor.HEAVY": "1.35",
    "fillLevelFactor.EXTREME": "1.75",
    "floorSurcharge.GROUND": "0",
    "floorSurcharge.FLOOR_1": "20",
    "floorSurcharge.FLOOR_2": "45",
    "floorSurcharge.FLOOR_3": "75",
    "floorSurcharge.FLOOR_4_PLUS": "110",
    "walkDistance.SHORT": "0",
    "walkDistance.MEDIUM": "20",
    "walkDistance.LONG": "45",
    "extraOption.DISMANTLING": "80",
    "extraOption.KITCHEN_REMOVAL": "180",
    "extraOption.SWEPT_CLEAN": "50",
    "extraOption.EXPRESS": "150",
    "extraOption.EXTRA_AREA": "60",
    "extraOption.BULKY_ITEMS": "120",
    "travelZone.label.A": "Nahbereich",
    "travelZone.prefixes.A": "45",
    "travelZone.amount.A": "0",
    "travelZone.label.B": "Erweiterter Nahbereich",
    "travelZone.prefixes.B": "44,46",
    "travelZone.amount.B": "25",
    "travelZone.label.C": "Umland",
    "travelZone.prefixes.C": "47,48,58",
    "travelZone.amount.C": "50",
    "travelZone.label.D": "Fernbereich",
    "travelZone.prefixes.D": "",
    "travelZone.amount.D": "85",
  })) {
    formData.set(key, value);
  }

  return formData;
}

describe("parsePricingSettingsFormData", () => {
  it("parses a complete valid pricing settings form", () => {
    const result = parsePricingSettingsFormData(createValidPricingFormData());

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.baseRatePerEffectiveSqm).toBe(14);
      expect(result.data.objectBasePrices.APARTMENT).toBe(120);
      expect(result.data.fillLevelFactors.EXTREME).toBe(1.75);
      expect(result.data.travelZones.B.amount).toBe(25);
    }
  });

  it("rejects invalid numeric values", () => {
    const formData = createValidPricingFormData();
    formData.set("baseRatePerEffectiveSqm", "abc");

    const result = parsePricingSettingsFormData(formData);

    expect(result.success).toBe(false);
  });

  it("rejects an invalid factor range", () => {
    const formData = createValidPricingFormData();
    formData.set("minFactor", "1.2");
    formData.set("maxFactor", "1.1");

    const result = parsePricingSettingsFormData(formData);

    expect(result.success).toBe(false);
  });
});

describe("publicInquirySchema", () => {
  it("accepts a compact inquiry with additional areas", () => {
    const result = publicInquirySchema.safeParse({
      objectType: "HOUSE",
      additionalAreas: ["CELLAR", "ATTIC"],
      areaSqm: 140,
      roomCount: 6,
      fillLevel: "HEAVY",
      floorLevel: "GROUND",
      hasElevator: false,
      walkDistance: "MEDIUM",
      extraOptions: ["DISMANTLING"],
      problemFlags: [],
      postalCode: "45470",
      desiredDate: "2026-03-18",
      name: "Thomas Neumann",
      phone: "+49 171 3407752",
      email: "thomas.neumann@example.de",
      message: "Hausverkauf steht an.",
      website: undefined,
    });

    expect(result.success).toBe(true);
  });

  it("rejects duplicated or conflicting additional areas", () => {
    const result = publicInquirySchema.safeParse({
      objectType: "CELLAR",
      additionalAreas: ["CELLAR", "CELLAR"],
      areaSqm: 12,
      roomCount: undefined,
      fillLevel: "LOW",
      floorLevel: "GROUND",
      hasElevator: false,
      walkDistance: "SHORT",
      extraOptions: [],
      problemFlags: [],
      postalCode: "45127",
      desiredDate: undefined,
      name: "Test Kunde",
      phone: "0201 123456",
      email: "test@example.de",
      message: undefined,
      website: undefined,
    });

    expect(result.success).toBe(false);
  });
});
