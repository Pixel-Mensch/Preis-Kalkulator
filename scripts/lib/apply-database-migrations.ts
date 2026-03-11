import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { PrismaClient } from "@prisma/client";

import {
  assertRuntimeEnvironment,
  isSqliteFileDatabaseUrl,
} from "../../src/lib/env";
import { getNpxCommand, runCommand } from "./run-command";

type MigrationDefinition = {
  id: string;
  checksum: string;
  filePath: string;
};

type AppliedMigrationRow = {
  id: string;
  checksum: string;
};

function getSchemaPath() {
  return path.resolve(process.cwd(), "prisma", "schema.prisma");
}

function resolveSqliteDatabasePath(databaseUrl: string) {
  const relativeOrAbsolutePath = databaseUrl.replace(/^file:/, "");

  if (path.isAbsolute(relativeOrAbsolutePath)) {
    return relativeOrAbsolutePath;
  }

  return path.resolve(process.cwd(), "prisma", relativeOrAbsolutePath);
}

function ensureSqliteDirectory(databaseUrl: string) {
  if (!isSqliteFileDatabaseUrl(databaseUrl)) {
    return;
  }

  const databasePath = resolveSqliteDatabasePath(databaseUrl);
  const directoryPath = path.dirname(databasePath);

  if (!existsSync(directoryPath)) {
    mkdirSync(directoryPath, { recursive: true });
  }
}

function getMigrationDefinitions() {
  const migrationsRoot = path.resolve(process.cwd(), "prisma", "migrations");

  if (!existsSync(migrationsRoot)) {
    throw new Error("The prisma/migrations directory is missing.");
  }

  return readdirSync(migrationsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const filePath = path.resolve(migrationsRoot, entry.name, "migration.sql");

      if (!existsSync(filePath)) {
        throw new Error(`Missing migration.sql in ${entry.name}.`);
      }

      const content = readFileSync(filePath, "utf8");
      const checksum = createHash("sha256").update(content).digest("hex");

      return {
        id: entry.name,
        checksum,
        filePath,
      } satisfies MigrationDefinition;
    })
    .sort((left, right) => left.id.localeCompare(right.id));
}

async function ensureMigrationStateTable(prisma: PrismaClient) {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "_AppMigration" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "checksum" TEXT NOT NULL,
      "appliedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function getAppliedMigration(prisma: PrismaClient, id: string) {
  const rows = await prisma.$queryRawUnsafe<AppliedMigrationRow[]>(
    `SELECT "id", "checksum" FROM "_AppMigration" WHERE "id" = ? LIMIT 1`,
    id,
  );

  return rows[0] ?? null;
}

async function markMigrationAsApplied(
  prisma: PrismaClient,
  id: string,
  checksum: string,
) {
  await prisma.$executeRawUnsafe(
    `INSERT INTO "_AppMigration" ("id", "checksum") VALUES (?, ?)`,
    id,
    checksum,
  );
}

function applySingleMigration(filePath: string) {
  runCommand(getNpxCommand(), [
    "prisma",
    "db",
    "execute",
    "--file",
    filePath,
    "--schema",
    getSchemaPath(),
  ]);
}

export async function applyDatabaseMigrations() {
  const environment = assertRuntimeEnvironment();
  const migrations = getMigrationDefinitions();

  ensureSqliteDirectory(environment.DATABASE_URL);

  if (migrations.length === 0) {
    console.log("No SQL migrations found. Skipping database bootstrap.");
    return;
  }

  const prisma = new PrismaClient();

  try {
    await ensureMigrationStateTable(prisma);

    for (const migration of migrations) {
      const appliedMigration = await getAppliedMigration(prisma, migration.id);

      if (appliedMigration) {
        if (appliedMigration.checksum !== migration.checksum) {
          throw new Error(
            `Migration ${migration.id} was already applied with a different checksum. Manual intervention is required.`,
          );
        }

        console.log(`Skipping already applied migration ${migration.id}.`);
        continue;
      }

      console.log(`Applying migration ${migration.id}.`);
      applySingleMigration(migration.filePath);
      await markMigrationAsApplied(prisma, migration.id, migration.checksum);
    }
  } finally {
    await prisma.$disconnect();
  }
}
