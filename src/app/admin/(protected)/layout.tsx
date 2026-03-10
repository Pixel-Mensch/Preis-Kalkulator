import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

type ProtectedAdminLayoutProps = {
  children: ReactNode;
};

export default async function ProtectedAdminLayout({
  children,
}: ProtectedAdminLayoutProps) {
  const session = await requireAdminSession();
  const adminUser = await prisma.adminUser.findUnique({
    where: {
      id: session.userId,
    },
  });

  if (!adminUser) {
    redirect("/admin/login");
  }

  return <AdminShell adminName={adminUser.name}>{children}</AdminShell>;
}
