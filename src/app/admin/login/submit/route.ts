import { redirect } from "next/navigation";

import { createAdminSession, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { loginSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const formData = await request.formData();
  const parsedPayload = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsedPayload.success) {
    redirect("/admin/login?error=invalid");
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
