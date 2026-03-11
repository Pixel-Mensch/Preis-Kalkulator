import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCompanySettingsOrNullMock: vi.fn(),
  adminUserCountMock: vi.fn(),
  assertRuntimeEnvironmentMock: vi.fn(),
  getRuntimeEnvironmentSummaryMock: vi.fn(),
  getActivePricingConfigOrNullMock: vi.fn(),
}));

vi.mock("@/lib/company", () => ({
  getCompanySettingsOrNull: mocks.getCompanySettingsOrNullMock,
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    adminUser: {
      count: mocks.adminUserCountMock,
    },
  },
}));

vi.mock("@/lib/env", () => ({
  assertRuntimeEnvironment: mocks.assertRuntimeEnvironmentMock,
  getRuntimeEnvironmentSummary: mocks.getRuntimeEnvironmentSummaryMock,
}));

vi.mock("@/lib/pricing/config", () => ({
  getActivePricingConfigOrNull: mocks.getActivePricingConfigOrNullMock,
}));

vi.mock("@/lib/rate-limit", () => ({
  RATE_LIMIT_IMPLEMENTATION: "memory-single-instance",
}));

import { GET } from "@/app/api/health/route";

describe("GET /api/health", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.assertRuntimeEnvironmentMock.mockReturnValue(undefined);
    mocks.getRuntimeEnvironmentSummaryMock.mockReturnValue({
      nodeEnv: "production",
      databaseMode: "sqlite",
      runDbMigrateOnStart: true,
    });
    mocks.getCompanySettingsOrNullMock.mockResolvedValue({
      id: "company-1",
    });
    mocks.getActivePricingConfigOrNullMock.mockResolvedValue({
      profileId: "profile-1",
    });
    mocks.adminUserCountMock.mockResolvedValue(1);
  });

  it("returns a ready summary when the instance is fully configured", async () => {
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe("ok");
    expect(body.readyForCustomer).toBe(true);
    expect(body.summary).toContain("betriebsbereit");
    expect(body.nextSteps).toEqual([]);
    expect(body.checkDetails).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "companySettings",
          ok: true,
        }),
      ]),
    );
  });

  it("returns degraded details and next steps when customer readiness is incomplete", async () => {
    mocks.getCompanySettingsOrNullMock.mockResolvedValue(null);
    mocks.getActivePricingConfigOrNullMock.mockResolvedValue(null);
    mocks.adminUserCountMock.mockResolvedValue(0);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe("degraded");
    expect(body.readyForCustomer).toBe(false);
    expect(body.summary).toContain("noch nicht vollständig freigegeben");
    expect(body.nextSteps).toEqual(
      expect.arrayContaining([
        "Firmendaten im Adminbereich oder Bootstrap vervollständigen.",
        "Ein aktives Preisprofil für neue Anfragen hinterlegen.",
        "Adminzugang per Bootstrap oder Admin-Sync einrichten.",
      ]),
    );
  });

  it("returns structured issues when runtime validation fails", async () => {
    mocks.assertRuntimeEnvironmentMock.mockImplementation(() => {
      throw new Error(
        "Invalid runtime environment:\n- SESSION_SECRET still uses a placeholder value.",
      );
    });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.status).toBe("error");
    expect(body.summary).toContain("nicht betriebsbereit");
    expect(body.issues).toContain("SESSION_SECRET still uses a placeholder value.");
    expect(body.nextSteps).toContain(
      "Runtime-Umgebungswerte prüfen und fehlende Platzhalter ersetzen.",
    );
  });
});
