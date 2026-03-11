import { getNpxCommand, runCommand } from "./lib/run-command";

async function main() {
  runCommand(getNpxCommand(), ["next", "typegen"]);
  runCommand(getNpxCommand(), ["tsx", "scripts/ensure-next-type-stubs.ts"]);
  runCommand(getNpxCommand(), ["tsc", "--noEmit"]);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
