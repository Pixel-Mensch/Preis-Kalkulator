import { redirect } from "next/navigation";

import { createAdminSession, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const formData = await request.formData();
  const rateLimitKey =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "local";
  const parsedPayload = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsedPayload.success) {
    redirect("/admin/login?error=invalid");
  }

  const loginRateLimit = checkRateLimit(
    `${rateLimitKey}:${parsedPayload.data.email}`,
    {
      maxAttempts: 10,
      windowMs: 1000 * 60 * 15,
    },
  );

  if (!loginRateLimit.allowed) {
    redirect("/admin/login?error=rate_limited");
  }

  const adminUser = await prisma.adminUser.findUnique({
    where: {
      email: parsedPayload.data.email,
    },
  });

  if (!adminUser) {
    redirect("/admin/login?error=invalid");
  }

  const isValidPassword = await verifyPassword(
    parsedPayload.data.password,
    adminUser.passwordHash,
  );

  if (!isValidPassword) {
    redirect("/admin/login?error=invalid");
  }

  await prisma.adminUser.update({
    where: {
      id: adminUser.id,
    },
    data: {
      lastLoginAt: new Date(),
    },
  });

  await createAdminSession(adminUser.id);
  redirect("/admin");
}
