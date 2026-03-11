import { z } from "zod";

const runtimeModeSchema = z.enum(["development", "test", "production"]);

const runtimeEnvironmentSchema = z.object({
  NODE_ENV: runtimeModeSchema,
  DATABASE_URL: z.string().trim().min(1, "DATABASE_URL is required."),
  SESSION_SECRET: z.string().trim().min(1, "SESSION_SECRET is required."),
  PORT: z.coerce.number().int().min(1).max(65535),
  HOSTNAME: z.string().trim().min(1),
  RUN_DB_MIGRATE_ON_START: z.boolean(),
});

const bootstrapEnvironmentSchema = z.object({
  ADMIN_EMAIL: z.string().trim().toLowerCase().email("ADMIN_EMAIL must be a valid email address."),
  ADMIN_PASSWORD: z
    .string()
    .min(12, "ADMIN_PASSWORD must contain at least 12 characters."),
  ADMIN_NAME: z.string().trim().min(2).max(120),
});

type RuntimeEnvironment = z.infer<typeof runtimeEnvironmentSchema>;
type BootstrapEnvironment = z.infer<typeof bootstrapEnvironmentSchema>;

let cachedRuntimeEnvironment: RuntimeEnvironment | null = null;

function formatIssues(error: z.ZodError) {
  return error.issues.map((issue) => `- ${issue.message}`).join("\n");
}

function parseBooleanLike(value: string | undefined, defaultValue: boolean) {
  if (value === undefined) {
    return defaultValue;
  }

  const normalizedValue = value.trim().toLowerCase();

  if (["1", "true", "yes", "on"].includes(normalizedValue)) {
    return true;
  }

  if (["0", "false", "no", "off"].includes(normalizedValue)) {
    return false;
  }

  return defaultValue;
}

function getRuntimeEnvironmentInput() {
  const nodeEnvironment = process.env.NODE_ENV ?? "development";
  const isProduction = nodeEnvironment === "production";

  return {
    NODE_ENV: nodeEnvironment,
    DATABASE_URL: process.env.DATABASE_URL ?? (isProduction ? undefined : "file:./dev.db"),
    SESSION_SECRET:
      process.env.SESSION_SECRET ??
      (isProduction ? undefined : "development-only-session-secret-change-me"),
    PORT: process.env.PORT ?? "3000",
    HOSTNAME: process.env.HOSTNAME ?? "0.0.0.0",
    RUN_DB_MIGRATE_ON_START: parseBooleanLike(
      process.env.RUN_DB_MIGRATE_ON_START,
      true,
    ),
  };
}

function validateProductionConstraints(environment: RuntimeEnvironment) {
  if (environment.NODE_ENV !== "production") {
    return;
  }

  const issues: string[] = [];

  if (environment.SESSION_SECRET.length < 32) {
    issues.push("- SESSION_SECRET must contain at least 32 characters in production.");
  }

  if (
    [
      "replace-with-a-long-random-string",
      "development-only-session-secret-change-me",
    ].includes(environment.SESSION_SECRET)
  ) {
    issues.push("- SESSION_SECRET still uses a placeholder value.");
  }

  if (!environment.DATABASE_URL.trim()) {
    issues.push("- DATABASE_URL must not be empty in production.");
  }

  if (issues.length > 0) {
    throw new Error(`Invalid runtime environment:\n${issues.join("\n")}`);
  }
}

export function getRuntimeEnvironment() {
  if (cachedRuntimeEnvironment) {
    return cachedRuntimeEnvironment;
  }

  const parsedEnvironment = runtimeEnvironmentSchema.safeParse(getRuntimeEnvironmentInput());

  if (!parsedEnvironment.success) {
    throw new Error(
      `Invalid runtime environment:\n${formatIssues(parsedEnvironment.error)}`,
    );
  }

  validateProductionConstraints(parsedEnvironment.data);
  cachedRuntimeEnvironment = parsedEnvironment.data;
  return cachedRuntimeEnvironment;
}

export function assertRuntimeEnvironment() {
  return getRuntimeEnvironment();
}

export function getBootstrapEnvironment() {
  const parsedEnvironment = bootstrapEnvironmentSchema.safeParse({
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    ADMIN_NAME: process.env.ADMIN_NAME ?? "Admin",
  });

  if (!parsedEnvironment.success) {
    throw new Error(
      `Invalid bootstrap environment:\n${formatIssues(parsedEnvironment.error)}`,
    );
  }

  if (
    getRuntimeEnvironmentInput().NODE_ENV === "production" &&
    parsedEnvironment.data.ADMIN_PASSWORD === "ChangeMe123!"
  ) {
    throw new Error(
      "Invalid bootstrap environment:\n- ADMIN_PASSWORD still uses the default demo password.",
    );
  }

  return parsedEnvironment.data;
}

export function isSqliteFileDatabaseUrl(databaseUrl: string) {
  return databaseUrl.startsWith("file:");
}

export function getRuntimeEnvironmentSummary() {
  const environment = getRuntimeEnvironment();

  return {
    nodeEnv: environment.NODE_ENV,
    databaseMode: isSqliteFileDatabaseUrl(environment.DATABASE_URL) ? "sqlite" : "external",
    runDbMigrateOnStart: environment.RUN_DB_MIGRATE_ON_START,
  } as const;
}

export type { BootstrapEnvironment, RuntimeEnvironment };
