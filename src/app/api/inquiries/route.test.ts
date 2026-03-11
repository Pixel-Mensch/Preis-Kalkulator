import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  calculateEstimateMock: vi.fn(),
  getActivePricingConfigOrNullMock: vi.fn(),
  getManualReviewReasonsMock: vi.fn(),
  requiresManualReviewMock: vi.fn(),
  createInquiryMock: vi.fn(),
  createPublicInquiryIdMock: vi.fn(),
  serializeInquirySnapshotMock: vi.fn(),
  checkRateLimitMock: vi.fn(),
  beginSubmissionGuardMock: vi.fn(),
  clearSubmissionGuardMock: vi.fn(),
  completeSubmissionGuardMock: vi.fn(),
}));

vi.mock("@/lib/pricing/calculateEstimate", () => ({
  calculateEstimate: mocks.calculateEstimateMock,
}));

vi.mock("@/lib/pricing/config", () => ({
  getActivePricingConfigOrNull: mocks.getActivePricingConfigOrNullMock,
}));

vi.mock("@/lib/pricing/manualReview", () => ({
  getManualReviewReasons: mocks.getManualReviewReasonsMock,
  requiresManualReview: mocks.requiresManualReviewMock,
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    inquiry: {
      create: mocks.createInquiryMock,
    },
  },
}));

vi.mock("@/lib/inquiries", () => ({
  createPublicInquiryId: mocks.createPublicInquiryIdMock,
  serializeInquirySnapshot: mocks.serializeInquirySnapshotMock,
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: mocks.checkRateLimitMock,
  beginSubmissionGuard: mocks.beginSubmissionGuardMock,
  clearSubmissionGuard: mocks.clearSubmissionGuardMock,
  completeSubmissionGuard: mocks.completeSubmissionGuardMock,
}));

import { POST } from "@/app/api/inquiries/route";

const pricingConfig = {
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
  travelZones: [],
};

const estimate = {
  travelZoneCode: "A",
  travelZoneLabel: "Nahbereich",
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
  rangeText: "900 € bis 1.120 €",
};

const validPayload = {
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
  name: "Sabine Krüger",
  phone: "+49 173 2211044",
  email: "Sabine.Krueger@example.de",
  website: undefined,
  message: "Bitte im Hof klingeln.",
};

function createJsonRequest(body: string) {
  return new Request("http://localhost/api/inquiries", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": "127.0.0.1",
    },
    body,
  });
}

describe("POST /api/inquiries", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.checkRateLimitMock.mockReturnValue({
      allowed: true,
      remaining: 4,
      resetAt: Date.now() + 1000,
    });
    mocks.beginSubmissionGuardMock.mockReturnValue({
      allowed: true,
      isPending: true,
      inquiryPublicId: undefined,
      resetAt: Date.now() + 30000,
    });
    mocks.getActivePricingConfigOrNullMock.mockResolvedValue(pricingConfig);
    mocks.calculateEstimateMock.mockReturnValue(estimate);
    mocks.getManualReviewReasonsMock.mockReturnValue([]);
    mocks.requiresManualReviewMock.mockReturnValue(false);
    mocks.createPublicInquiryIdMock.mockReturnValue("ABC123");
    mocks.serializeInquirySnapshotMock.mockReturnValue("{\"snapshot\":true}");
    mocks.createInquiryMock.mockResolvedValue({
      publicId: "ABC123",
      estimateMin: 900,
      estimateMax: 1120,
      manualReviewRequired: false,
    });
  });

  it("returns 400 for invalid JSON bodies", async () => {
    const response = await POST(createJsonRequest("{invalid"));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toContain("nicht verarbeitet");
    expect(mocks.createInquiryMock).not.toHaveBeenCalled();
  });

  it("returns 503 if pricing configuration is unavailable", async () => {
    mocks.getActivePricingConfigOrNullMock.mockResolvedValue(null);

    const response = await POST(createJsonRequest(JSON.stringify(validPayload)));
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.message).toContain("nicht vollständig eingerichtet");
    expect(mocks.createInquiryMock).not.toHaveBeenCalled();
  });

  it("returns 409 with the existing inquiry id for duplicate submits", async () => {
    mocks.beginSubmissionGuardMock.mockReturnValue({
      allowed: false,
      isPending: false,
      inquiryPublicId: "EXIST123",
      resetAt: Date.now() + 30000,
    });

    const response = await POST(createJsonRequest(JSON.stringify(validPayload)));
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.inquiry.publicId).toBe("EXIST123");
    expect(mocks.createInquiryMock).not.toHaveBeenCalled();
  });

  it("stores a valid inquiry and completes the submission guard", async () => {
    const response = await POST(createJsonRequest(JSON.stringify(validPayload)));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.inquiry.publicId).toBe("ABC123");
    expect(mocks.createInquiryMock).toHaveBeenCalledTimes(1);
    expect(mocks.createInquiryMock.mock.calls[0][0].data.customerEmail).toBe(
      "sabine.krueger@example.de",
    );
    expect(mocks.createInquiryMock.mock.calls[0][0].data.desiredDate).toBeInstanceOf(Date);
    expect(mocks.completeSubmissionGuardMock).toHaveBeenCalledWith(
      expect.any(String),
      "ABC123",
    );
  });
});
