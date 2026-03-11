import { execFileSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import path from "node:path";

import { loadLocalEnvFile } from "./lib/load-local-env";

function resolveDatabaseFilePath() {
  const databaseUrl = process.env.DATABASE_URL ?? "file:./dev.db";

  if (!databaseUrl.startsWith("file:")) {
    throw new Error(
      "db:reset-demo supports only SQLite DATABASE_URL values that start with file:.",
    );
  }

  const relativeOrAbsolutePath = databaseUrl.replace(/^file:/, "");

  if (path.isAbsolute(relativeOrAbsolutePath)) {
    return relativeOrAbsolutePath;
  }

  return path.resolve(process.cwd(), "prisma", relativeOrAbsolutePath);
}

function runNpmScript(scriptName: string) {
  if (process.platform === "win32") {
    execFileSync(process.env.ComSpec ?? "cmd.exe", ["/d", "/s", "/c", `npm.cmd run ${scriptName}`], {
      cwd: process.cwd(),
      stdio: "inherit",
    });
    return;
  }

  execFileSync("npm", ["run", scriptName], {
    cwd: process.cwd(),
    stdio: "inherit",
  });
}

function removeIfExists(filePath: string) {
  if (existsSync(filePath)) {
    rmSync(filePath, { force: true });
  }
}

loadLocalEnvFile();

const databasePath = resolveDatabaseFilePath();
const journalPath = `${databasePath}-journal`;

console.log(`Resetting local demo database at ${databasePath}`);
removeIfExists(databasePath);
removeIfExists(journalPath);

runNpmScript("db:migrate");
runNpmScript("db:seed");

console.log("Local demo database has been recreated with demo data.");
