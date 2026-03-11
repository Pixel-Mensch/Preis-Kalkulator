import { pathToFileURL } from "node:url";

import { hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";

import { assertRuntimeEnvironment, getBootstrapEnvironment } from "../src/lib/env";
import { loadLocalEnvFile } from "./lib/load-local-env";

function ensureProductionNodeEnvDefault() {
  const runtimeProcessEnv = process.env as Record<string, string | undefined>;

  if (!runtimeProcessEnv.NODE_ENV) {
    runtimeProcessEnv.NODE_ENV = "production";
  }
}

async function main() {
  loadLocalEnvFile();
  ensureProductionNodeEnvDefault();
  assertRuntimeEnvironment();
  const prisma = new PrismaClient();
  const bootstrapEnvironment = getBootstrapEnvironment();

  try {
    await prisma.adminUser.upsert({
      where: {
        email: bootstrapEnvironment.ADMIN_EMAIL,
      },
      create: {
        email: bootstrapEnvironment.ADMIN_EMAIL,
        name: bootstrapEnvironment.ADMIN_NAME,
        passwordHash: await hash(bootstrapEnvironment.ADMIN_PASSWORD, 12),
      },
      update: {
        name: bootstrapEnvironment.ADMIN_NAME,
        passwordHash: await hash(bootstrapEnvironment.ADMIN_PASSWORD, 12),
      },
    });

    console.log(
      `Admin user ${bootstrapEnvironment.ADMIN_EMAIL} has been created or updated successfully.`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

export { main };

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
