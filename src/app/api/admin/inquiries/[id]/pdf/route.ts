import { NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/auth";
import { getCompanySettings } from "@/lib/company";
import { prisma } from "@/lib/db";
import { parseJsonValue, type InquiryCalculationSnapshot } from "@/lib/inquiries";
import { generateInquiryPdf } from "@/lib/pdf";

type PdfRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, { params }: PdfRouteProps) {
  await requireAdminSession();

  const { id } = await params;
  const [companySettings, inquiry] = await Promise.all([
    getCompanySettings(),
    prisma.inquiry.findUnique({
      where: {
        id,
      },
    }),
  ]);

  if (!inquiry) {
    return NextResponse.json({ message: "Inquiry not found." }, { status: 404 });
  }

  const snapshot = parseJsonValue<InquiryCalculationSnapshot>(inquiry.calculationSnapshot);
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
