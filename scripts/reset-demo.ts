import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import path from "node:path";

function readDatabaseFilePath() {
  const envPath = path.resolve(process.cwd(), ".env");
  const fallbackPath = path.resolve(process.cwd(), "prisma", "dev.db");

  if (!existsSync(envPath)) {
    return fallbackPath;
  }

  const envContent = readFileSync(envPath, "utf8");
  const matchedUrl = envContent.match(/^DATABASE_URL=(?:"|')?(file:[^\r\n"']+)(?:"|')?$/m);

  if (!matchedUrl) {
    return fallbackPath;
  }

  const fileUrl = matchedUrl[1].replace(/^file:/, "");
  return path.resolve(process.cwd(), "prisma", fileUrl);
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

const databasePath = readDatabaseFilePath();
const journalPath = `${databasePath}-journal`;

console.log(`Resetting local demo database at ${databasePath}`);
removeIfExists(databasePath);
removeIfExists(journalPath);

runNpmScript("db:migrate");
runNpmScript("db:seed");

console.log("Local demo database has been recreated with demo data.");
