import { NextResponse } from "next/server";

import { parseDateOnlyToUtcDate } from "@/lib/date";
import { calculateEstimate } from "@/lib/pricing/calculateEstimate";
import { getActivePricingConfigOrNull } from "@/lib/pricing/config";
import {
  getManualReviewReasons,
  requiresManualReview,
} from "@/lib/pricing/manualReview";
import { prisma } from "@/lib/db";
import {
  createPublicInquiryId,
  serializeInquirySnapshot,
} from "@/lib/inquiries";
import {
  beginSubmissionGuard,
  checkRateLimit,
  clearSubmissionGuard,
  completeSubmissionGuard,
} from "@/lib/rate-limit";
import { publicInquirySchema, type PublicInquiryInput } from "@/lib/validation";

function createSubmissionFingerprint(input: PublicInquiryInput) {
  return JSON.stringify({
    objectType: input.objectType,
    additionalAreas: [...input.additionalAreas].sort(),
    areaSqm: input.areaSqm,
    roomCount: input.roomCount ?? null,
    fillLevel: input.fillLevel,
    floorLevel: input.floorLevel,
    hasElevator: input.hasElevator,
    walkDistance: input.walkDistance,
    extraOptions: [...input.extraOptions].sort(),
    problemFlags: [...input.problemFlags].sort(),
    postalCode: input.postalCode,
    desiredDate: input.desiredDate ?? null,
    name: input.name,
    phone: input.phone,
    email: input.email,
  });
}

export async function POST(request: Request) {
  const rateLimitKey =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip")?.trim() ??
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

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      {
        message:
          "Die Anfrage konnte nicht verarbeitet werden. Bitte laden Sie die Seite neu und versuchen Sie es erneut.",
      },
      { status: 400 },
    );
  }

  const parsedPayload = publicInquirySchema.safeParse(payload);

  if (!parsedPayload.success) {
    return NextResponse.json(
      {
        message: "Bitte prüfen Sie Ihre Eingaben.",
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

  const pricingConfig = await getActivePricingConfigOrNull();

  if (!pricingConfig) {
    return NextResponse.json(
      {
        message:
          "Der Rechner ist gerade nicht vollständig eingerichtet. Bitte versuchen Sie es später erneut.",
      },
      { status: 503 },
    );
  }

  const submissionFingerprint = `${rateLimitKey}:${createSubmissionFingerprint(inquiryInput)}`;
  const submissionGuard = beginSubmissionGuard(submissionFingerprint, 1000 * 30);

  if (!submissionGuard.allowed) {
    return NextResponse.json(
      {
        message: submissionGuard.inquiryPublicId
          ? "Diese Anfrage wurde bereits gespeichert."
          : "Diese Anfrage wird bereits verarbeitet. Bitte warten Sie einen Moment.",
        inquiry: submissionGuard.inquiryPublicId
          ? {
              publicId: submissionGuard.inquiryPublicId,
            }
          : undefined,
      },
      { status: 409 },
    );
  }

  try {
    const desiredDate = inquiryInput.desiredDate
      ? parseDateOnlyToUtcDate(inquiryInput.desiredDate)
      : null;

    if (inquiryInput.desiredDate && !desiredDate) {
      clearSubmissionGuard(submissionFingerprint);
      return NextResponse.json(
        {
          message: "Das gewünschte Datum ist ungültig.",
        },
        { status: 400 },
      );
    }

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
        desiredDate,
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

    completeSubmissionGuard(submissionFingerprint, createdInquiry.publicId);

    return NextResponse.json({
      inquiry: createdInquiry,
    });
  } catch (error) {
    console.error("Failed to create inquiry", error);
    clearSubmissionGuard(submissionFingerprint);

    return NextResponse.json(
      {
        message:
          "Die Anfrage konnte gerade nicht gespeichert werden. Bitte versuchen Sie es erneut.",
      },
      { status: 500 },
    );
  }
}
