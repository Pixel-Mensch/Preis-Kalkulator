import { existsSync } from "node:fs";
import path from "node:path";

import { assertRuntimeEnvironment } from "../src/lib/env";
import { applyDatabaseMigrations } from "./lib/apply-database-migrations";
import { loadLocalEnvFile } from "./lib/load-local-env";
import { getNpxCommand, spawnLongRunningProcess } from "./lib/run-command";

function ensureProductionNodeEnvDefault() {
  const runtimeProcessEnv = process.env as Record<string, string | undefined>;

  if (!runtimeProcessEnv.NODE_ENV) {
    runtimeProcessEnv.NODE_ENV = "production";
  }
}

async function runDatabaseBootstrapIfEnabled() {
  const environment = assertRuntimeEnvironment();

  if (!environment.RUN_DB_MIGRATE_ON_START) {
    console.log("Skipping database migration on start because RUN_DB_MIGRATE_ON_START=false.");
    return;
  }

  console.log("Applying single-instance schema bootstrap before server start.");
  await applyDatabaseMigrations();
}

function resolveServerCommand() {
  const standaloneServerPath = path.resolve(process.cwd(), "server.js");

  if (existsSync(standaloneServerPath)) {
    return {
      command: process.execPath,
      args: [standaloneServerPath],
    };
  }

  return {
    command: getNpxCommand(),
    args: ["next", "start"],
  };
}

async function main() {
  loadLocalEnvFile();
  ensureProductionNodeEnvDefault();
  assertRuntimeEnvironment();
  await runDatabaseBootstrapIfEnabled();

  const serverProcess = resolveServerCommand();
  const child = spawnLongRunningProcess(serverProcess.command, serverProcess.args);

  const forwardSignal = (signal: NodeJS.Signals) => {
    if (!child.killed) {
      child.kill(signal);
    }
  };

  process.on("SIGINT", () => forwardSignal("SIGINT"));
  process.on("SIGTERM", () => forwardSignal("SIGTERM"));

  child.on("exit", (code) => {
    process.exit(code ?? 0);
  });
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
