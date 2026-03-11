import { NextResponse } from "next/server";

import { getCompanySettingsOrNull } from "@/lib/company";
import { prisma } from "@/lib/db";
import { assertRuntimeEnvironment, getRuntimeEnvironmentSummary } from "@/lib/env";
import { getActivePricingConfigOrNull } from "@/lib/pricing/config";
import { RATE_LIMIT_IMPLEMENTATION } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    assertRuntimeEnvironment();
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        readyForCustomer: false,
        checks: {
          environment: false,
          database: false,
          companySettings: false,
          pricingProfile: false,
          adminUser: false,
        },
        message: error instanceof Error ? error.message : "Invalid runtime environment.",
      },
      { status: 503 },
    );
  }

  try {
    const [companySettings, pricingConfig, adminUserCount] = await Promise.all([
      getCompanySettingsOrNull(),
      getActivePricingConfigOrNull(),
      prisma.adminUser.count(),
    ]);

    const readyForCustomer =
      Boolean(companySettings) && Boolean(pricingConfig) && adminUserCount > 0;

    return NextResponse.json(
      {
        status: readyForCustomer ? "ok" : "degraded",
        mode: "single-instance",
        readyForCustomer,
        rateLimitMode: RATE_LIMIT_IMPLEMENTATION,
        runtime: getRuntimeEnvironmentSummary(),
        checks: {
          environment: true,
          database: true,
          companySettings: Boolean(companySettings),
          pricingProfile: Boolean(pricingConfig),
          adminUser: adminUserCount > 0,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        readyForCustomer: false,
        checks: {
          environment: true,
          database: false,
          companySettings: false,
          pricingProfile: false,
          adminUser: false,
        },
        message:
          error instanceof Error ? error.message : "Database health check failed.",
      },
      { status: 503 },
    );
  }
}
