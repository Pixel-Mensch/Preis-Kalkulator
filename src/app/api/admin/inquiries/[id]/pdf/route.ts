import { NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/auth";
import { getCompanySettingsState } from "@/lib/company";
import { prisma } from "@/lib/db";
import { parseJsonValueSafe, type InquiryCalculationSnapshot } from "@/lib/inquiries";
import { generateInquiryPdf } from "@/lib/pdf";

type PdfRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, { params }: PdfRouteProps) {
  await requireAdminSession();

  const { id } = await params;
  const [{ companySettings, isConfigured }, inquiry] = await Promise.all([
    getCompanySettingsState(),
    prisma.inquiry.findUnique({
      where: {
        id,
      },
    }),
  ]);

  if (!inquiry) {
    return NextResponse.json({ message: "Inquiry not found." }, { status: 404 });
  }

  const snapshot = parseJsonValueSafe<InquiryCalculationSnapshot>(inquiry.calculationSnapshot);

  if (!snapshot) {
    return NextResponse.json(
      { message: "Stored calculation snapshot is invalid." },
      { status: 422 },
    );
  }

  if (!isConfigured) {
    return NextResponse.json(
      {
        message:
          "Company settings are incomplete. PDF export is unavailable until configuration is restored.",
      },
      { status: 503 },
    );
  }

  const pdfBytes = await generateInquiryPdf({
    companySettings,
    inquiry,
    snapshot,
  });

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=\"anfrage-${inquiry.publicId}.pdf\"`,
    },
  });
}
