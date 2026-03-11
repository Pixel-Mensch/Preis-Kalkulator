import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const stubDefinitions = [
  {
    filePath: path.resolve(process.cwd(), ".next", "types", "cache-life.d.ts"),
    contents: "export {};\n",
  },
] as const;

for (const stub of stubDefinitions) {
  if (existsSync(stub.filePath)) {
    continue;
  }

  mkdirSync(path.dirname(stub.filePath), { recursive: true });
  writeFileSync(stub.filePath, stub.contents, "utf8");
}
