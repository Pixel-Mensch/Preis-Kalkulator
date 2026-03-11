import { NextResponse } from "next/server";

import { getCompanySettingsOrNull } from "@/lib/company";
import { prisma } from "@/lib/db";
import { assertRuntimeEnvironment, getRuntimeEnvironmentSummary } from "@/lib/env";
import { getActivePricingConfigOrNull } from "@/lib/pricing/config";
import { RATE_LIMIT_IMPLEMENTATION } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

type HealthChecks = {
  environment: boolean;
  database: boolean;
  companySettings: boolean;
  pricingProfile: boolean;
  adminUser: boolean;
};

function getCheckDetails(checks: HealthChecks) {
  return [
    {
      key: "environment",
      label: "Laufzeitumgebung",
      ok: checks.environment,
      detail: checks.environment
        ? "Die erforderlichen Runtime-Werte sind gesetzt."
        : "Mindestens eine notwendige Umgebungsvariable fehlt oder ist nicht freigabefähig.",
    },
    {
      key: "database",
      label: "Datenbank",
      ok: checks.database,
      detail: checks.database
        ? "Die Anwendung kann auf Datenbank und Tabellen zugreifen."
        : "Der Datenbankzugriff ist gestört oder der Verbindungsaufbau schlägt fehl.",
    },
    {
      key: "companySettings",
      label: "Firmendaten",
      ok: checks.companySettings,
      detail: checks.companySettings
        ? "Name, Kontakt und Außendarstellung sind hinterlegt."
        : "Firmendaten für die öffentliche Anfrage fehlen noch.",
    },
    {
      key: "pricingProfile",
      label: "Preisprofil",
      ok: checks.pricingProfile,
      detail: checks.pricingProfile
        ? "Ein aktives Preisprofil steht für neue Anfragen bereit."
        : "Ein aktives Preisprofil für neue Anfragen fehlt noch.",
    },
    {
      key: "adminUser",
      label: "Adminzugang",
      ok: checks.adminUser,
      detail: checks.adminUser
        ? "Mindestens ein Adminzugang ist vorhanden."
        : "Es ist noch kein Adminzugang eingerichtet.",
    },
  ] as const;
}

function extractIssues(error: unknown) {
  if (!(error instanceof Error)) {
    return [];
  }

  return error.message
    .split("\n")
    .map((line) => line.replace(/^- /, "").trim())
    .filter((line) => line && !line.startsWith("Invalid "));
}

function getNextSteps(checks: HealthChecks) {
  const nextSteps: string[] = [];

  if (!checks.environment) {
    nextSteps.push("Runtime-Umgebungswerte prüfen und fehlende Platzhalter ersetzen.");
  }

  if (!checks.database) {
    nextSteps.push("Datenbankverbindung, Dateirechte und Migrationen kontrollieren.");
  }

  if (!checks.companySettings) {
    nextSteps.push("Firmendaten im Adminbereich oder Bootstrap vervollständigen.");
  }

  if (!checks.pricingProfile) {
    nextSteps.push("Ein aktives Preisprofil für neue Anfragen hinterlegen.");
  }

  if (!checks.adminUser) {
    nextSteps.push("Adminzugang per Bootstrap oder Admin-Sync einrichten.");
  }

  return nextSteps;
}

function getSummary(status: "ok" | "degraded" | "error", readyForCustomer: boolean) {
  if (status === "ok" && readyForCustomer) {
    return "Instanz ist betriebsbereit und die öffentliche Anfrage kann genutzt werden.";
  }

  if (status === "degraded") {
    return "Instanz läuft, aber die öffentliche Anfrage ist noch nicht vollständig freigegeben.";
  }

  return "Instanz ist aktuell nicht betriebsbereit.";
}

export async function GET() {
  try {
    assertRuntimeEnvironment();
  } catch (error) {
    const checks = {
      environment: false,
      database: false,
      companySettings: false,
      pricingProfile: false,
      adminUser: false,
    } satisfies HealthChecks;

    return NextResponse.json(
      {
        status: "error",
        readyForCustomer: false,
        checks,
        checkDetails: getCheckDetails(checks),
        summary: getSummary("error", false),
        nextSteps: getNextSteps(checks),
        issues: extractIssues(error),
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
    const checks = {
      environment: true,
      database: true,
      companySettings: Boolean(companySettings),
      pricingProfile: Boolean(pricingConfig),
      adminUser: adminUserCount > 0,
    } satisfies HealthChecks;
    const status = readyForCustomer ? "ok" : "degraded";

    return NextResponse.json(
      {
        status,
        mode: "single-instance",
        readyForCustomer,
        rateLimitMode: RATE_LIMIT_IMPLEMENTATION,
        runtime: getRuntimeEnvironmentSummary(),
        checks,
        checkDetails: getCheckDetails(checks),
        summary: getSummary(status, readyForCustomer),
        nextSteps: getNextSteps(checks),
      },
      { status: 200 },
    );
  } catch (error) {
    const checks = {
      environment: true,
      database: false,
      companySettings: false,
      pricingProfile: false,
      adminUser: false,
    } satisfies HealthChecks;

    return NextResponse.json(
      {
        status: "error",
        readyForCustomer: false,
        checks,
        checkDetails: getCheckDetails(checks),
        summary: getSummary("error", false),
        nextSteps: getNextSteps(checks),
        issues: extractIssues(error),
        message:
          error instanceof Error ? error.message : "Database health check failed.",
      },
      { status: 503 },
    );
  }
}
