import { applyDatabaseMigrations } from "./lib/apply-database-migrations";
import { loadLocalEnvFile } from "./lib/load-local-env";

async function main() {
  loadLocalEnvFile();
  await applyDatabaseMigrations();
  console.log("Database migrations are up to date.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
