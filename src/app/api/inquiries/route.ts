import { NextResponse } from "next/server";

import { calculateEstimate } from "@/lib/pricing/calculateEstimate";
import { getActivePricingConfig } from "@/lib/pricing/config";
import {
  getManualReviewReasons,
  requiresManualReview,
} from "@/lib/pricing/manualReview";
import { prisma } from "@/lib/db";
import {
  createPublicInquiryId,
  serializeInquirySnapshot,
} from "@/lib/inquiries";
import { checkRateLimit } from "@/lib/rate-limit";
import { publicInquirySchema } from "@/lib/validation";

export async function POST(request: Request) {
  const rateLimitKey =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "local";

  const rateLimit = checkRateLimit(rateLimitKey, {
    maxAttempts: 5,
    windowMs: 1000 * 60 * 15,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        message:
          "Zu viele Anfragen in kurzer Zeit. Bitte versuche es in einigen Minuten erneut.",
      },
      { status: 429 },
    );
  }

  const payload = await request.json();
  const parsedPayload = publicInquirySchema.safeParse(payload);

  if (!parsedPayload.success) {
    return NextResponse.json(
      {
        message: "Bitte pruefe deine Eingaben.",
        issues: parsedPayload.error.flatten(),
      },
      { status: 400 },
    );
  }

  const inquiryInput = parsedPayload.data;

  if (inquiryInput.website) {
    return NextResponse.json(
      {
        message: "Anfrage empfangen.",
      },
      { status: 200 },
    );
  }

  const pricingConfig = await getActivePricingConfig();
  const estimate = calculateEstimate(pricingConfig, inquiryInput);
  const manualReviewReasons = getManualReviewReasons(inquiryInput, estimate);
  const manualReviewRequired = requiresManualReview(manualReviewReasons);
  const publicId = createPublicInquiryId();

  const createdInquiry = await prisma.inquiry.create({
    data: {
      publicId,
      pricingProfileId: pricingConfig.profileId,
      customerName: inquiryInput.name,
      customerEmail: inquiryInput.email,
      customerPhone: inquiryInput.phone,
      postalCode: inquiryInput.postalCode,
      desiredDate: inquiryInput.desiredDate
        ? new Date(inquiryInput.desiredDate)
        : null,
      message: inquiryInput.message,
      objectType: inquiryInput.objectType,
      areaSqm: inquiryInput.areaSqm,
      roomCount: inquiryInput.roomCount,
      fillLevel: inquiryInput.fillLevel,
      floorLevel: inquiryInput.floorLevel,
      hasElevator: inquiryInput.hasElevator,
      walkDistance: inquiryInput.walkDistance,
      travelZoneCode: estimate.travelZoneCode,
      extraOptions: JSON.stringify(inquiryInput.extraOptions),
      problemFlags: JSON.stringify(inquiryInput.problemFlags),
      manualReviewRequired,
      manualReviewReasons: JSON.stringify(manualReviewReasons),
      estimateMin: estimate.rangeMin,
      estimateMax: estimate.rangeMax,
      inputSnapshot: JSON.stringify(inquiryInput),
      calculationSnapshot: serializeInquirySnapshot({
        createdAt: new Date().toISOString(),
        pricingConfig,
        estimate,
        manualReviewReasons,
        input: inquiryInput,
      }),
    },
    select: {
      publicId: true,
      estimateMin: true,
      estimateMax: true,
      manualReviewRequired: true,
    },
  });

  return NextResponse.json({
    inquiry: createdInquiry,
  });
}
