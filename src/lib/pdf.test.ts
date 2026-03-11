import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";

import type { InquiryCalculationSnapshot } from "@/lib/inquiries";
import { generateInquiryPdf } from "@/lib/pdf";

const companySettings = {
  companyName: "KlarRaum Ruhr",
  contactEmail: "info@klarraum-ruhr.de",
  contactPhone: "0201 123456",
  street: "Musterstrasse 12",
  postalCode: "45127",
  city: "Essen",
  estimateFootnote:
    "Diese Einschaetzung ist unverbindlich und kann sich nach Sichtung, Besichtigung oder weiteren Angaben aendern.",
};

const inquiry = {
  publicId: "ABC123",
  customerName: "Sabine Krueger",
  customerEmail: "sabine@example.de",
  customerPhone: "+49 173 2211044",
  postalCode: "45131",
  desiredDate: new Date("2026-03-20T00:00:00.000Z"),
  message: "Bitte im Hof klingeln.",
  manualReviewRequired: false,
};

function createSnapshot(): InquiryCalculationSnapshot {
  return {
    createdAt: "2026-03-11T10:00:00.000Z",
    pricingConfig: {
      profileId: "profile-1",
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
    },
    estimate: {
      travelZoneCode: "A",
      travelZoneLabel: "Nahbereich",
      travelZoneMatched: true,
      effectiveArea: 58,
      basePrice: 120,
      effectiveAreaCost: 812,
      floorSurcharge: 45,
      walkDistanceSurcharge: 0,
      travelZoneSurcharge: 0,
      extraSurcharges: [],
      subtotalBeforeMinimum: 977,
      subtotal: 977,
      minimumOrderApplied: false,
      rangeMin: 900,
      rangeMax: 1120,
      rangeText: "900 EUR bis 1.120 EUR",
    },
    manualReviewReasons: [],
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
      desiredDate: "2026-03-20",
      name: "Sabine Krueger",
      phone: "+49 173 2211044",
      email: "sabine@example.de",
      message: "Bitte im Hof klingeln.",
      website: undefined,
    },
  };
}

describe("generateInquiryPdf", () => {
  it("creates a single page for compact inquiries", async () => {
    const pdfBytes = await generateInquiryPdf({
      companySettings,
      inquiry,
      snapshot: createSnapshot(),
    });
    const pdf = await PDFDocument.load(pdfBytes);

    expect(pdf.getPageCount()).toBe(1);
  });

  it("adds extra pages for long notes and many manual review reasons", async () => {
    const snapshot = createSnapshot();
    const longMessage = Array.from({ length: 40 }, (_, index) =>
      `Langer Kundenhinweis ${index + 1} mit Zugang, Parken und Abstimmung.`,
    ).join(" ");

    snapshot.estimate.travelZoneMatched = false;
    snapshot.manualReviewReasons = Array.from({ length: 45 }, (_, index) => ({
      code: `REASON_${index + 1}`,
      message: `Manuelle Pruefung Grund ${index + 1} mit weiterem Erklaerungstext fuer den PDF-Export.`,
    }));
    snapshot.input.extraOptions = [
      "DISMANTLING",
      "KITCHEN_REMOVAL",
      "SWEPT_CLEAN",
      "EXPRESS",
      "EXTRA_AREA",
      "BULKY_ITEMS",
    ];

    const pdfBytes = await generateInquiryPdf({
      companySettings,
      inquiry: {
        ...inquiry,
        manualReviewRequired: true,
        message: longMessage,
      },
      snapshot,
    });
    const pdf = await PDFDocument.load(pdfBytes);

    expect(pdf.getPageCount()).toBeGreaterThan(1);
  });
});
