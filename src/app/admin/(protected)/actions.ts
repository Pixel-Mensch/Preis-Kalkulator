"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/auth";
import {
  extraOptions,
  fillLevels,
  floorLevels,
  inquiryStatuses,
  objectTypes,
  travelZoneCodes,
  walkDistances,
  type InquiryStatus,
} from "@/lib/pricing/types";
import {
  companySettingsSchema,
  parsePricingSettingsFormData,
} from "@/lib/validation";

function getStringValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function updateInquiryStatusAction(formData: FormData) {
  await requireAdminSession();

  const inquiryId = getStringValue(formData, "inquiryId");
  const status = getStringValue(formData, "status") as InquiryStatus;

  if (!inquiryId) {
    redirect("/admin/anfragen?status=invalid");
  }

  if (!inquiryStatuses.includes(status)) {
    redirect(`/admin/anfragen/${inquiryId}?status=invalid`);
  }

  const existingInquiry = await prisma.inquiry.findUnique({
    where: {
      id: inquiryId,
    },
    select: {
      status: true,
    },
  });

  if (!existingInquiry) {
    redirect("/admin/anfragen?status=invalid");
  }

  if (existingInquiry.status === status) {
    redirect(`/admin/anfragen/${inquiryId}?status=nochange`);
  }

  const result = await prisma.inquiry.updateMany({
    where: {
      id: inquiryId,
    },
    data: {
      status,
    },
  });

  if (result.count === 0) {
    redirect("/admin/anfragen?status=invalid");
  }

  revalidatePath("/admin");
  revalidatePath("/admin/anfragen");
  revalidatePath(`/admin/anfragen/${inquiryId}`);
  redirect(`/admin/anfragen/${inquiryId}?status=updated&nextStatus=${status}`);
}

export async function updateCompanySettingsAction(formData: FormData) {
  await requireAdminSession();

  const companySettingsId = getStringValue(formData, "companySettingsId");
  const parsedPayload = companySettingsSchema.safeParse({
    companyName: formData.get("companyName"),
    contactEmail: formData.get("contactEmail"),
    contactPhone: formData.get("contactPhone"),
    website: formData.get("website"),
    street: formData.get("street"),
    postalCode: formData.get("postalCode"),
    city: formData.get("city"),
    serviceAreaNote: formData.get("serviceAreaNote"),
    estimateFootnote: formData.get("estimateFootnote"),
    supportHours: formData.get("supportHours"),
  });

  if (!companySettingsId || !parsedPayload.success) {
    redirect("/admin/firma?status=invalid");
  }

  const result = await prisma.companySettings.updateMany({
    where: {
      id: companySettingsId,
    },
    data: parsedPayload.data,
  });

  if (result.count === 0) {
    redirect("/admin/firma?status=invalid");
  }

  revalidatePath("/");
  revalidatePath("/rechner");
  revalidatePath("/admin");
  revalidatePath("/admin/firma");
  redirect("/admin/firma?status=saved");
}

export async function updatePricingSettingsAction(formData: FormData) {
  await requireAdminSession();

  const pricingProfileId = getStringValue(formData, "pricingProfileId");
  const parsedPayload = parsePricingSettingsFormData(formData);

  if (!pricingProfileId || !parsedPayload.success) {
    redirect("/admin/preise?status=invalid");
  }

  const pricingSettings = parsedPayload.data;

  try {
    await prisma.$transaction(async (transaction) => {
      const updatedPricingProfile = await transaction.pricingProfile.updateMany({
        where: {
          id: pricingProfileId,
        },
        data: {
          name: pricingSettings.profileName,
          minimumOrderValue: pricingSettings.minimumOrderValue,
          baseRatePerEffectiveSqm: pricingSettings.baseRatePerEffectiveSqm,
          minFactor: pricingSettings.minFactor,
          maxFactor: pricingSettings.maxFactor,
          elevatorReductionFactor: pricingSettings.elevatorReductionFactor,
        },
      });

      if (updatedPricingProfile.count === 0) {
        throw new Error("Pricing profile missing.");
      }

      for (const objectType of objectTypes) {
        await transaction.objectBasePrice.update({
          where: {
            profileId_objectType: {
              profileId: pricingProfileId,
              objectType,
            },
          },
          data: {
            amount: pricingSettings.objectBasePrices[objectType],
          },
        });
      }

      for (const fillLevel of fillLevels) {
        await transaction.fillLevelFactor.update({
          where: {
            profileId_fillLevel: {
              profileId: pricingProfileId,
              fillLevel,
            },
          },
          data: {
            factor: pricingSettings.fillLevelFactors[fillLevel],
          },
        });
      }

      for (const floorLevel of floorLevels) {
        await transaction.floorSurcharge.update({
          where: {
            profileId_floorLevel: {
              profileId: pricingProfileId,
              floorLevel,
            },
          },
          data: {
            amount: pricingSettings.floorSurcharges[floorLevel],
          },
        });
      }

      for (const walkDistance of walkDistances) {
        await transaction.walkDistanceSurcharge.update({
          where: {
            profileId_walkDistance: {
              profileId: pricingProfileId,
              walkDistance,
            },
          },
          data: {
            amount: pricingSettings.walkDistanceSurcharges[walkDistance],
          },
        });
      }

      for (const extraOption of extraOptions) {
        await transaction.extraOptionPrice.update({
          where: {
            profileId_extraOption: {
              profileId: pricingProfileId,
              extraOption,
            },
          },
          data: {
            amount: pricingSettings.extraOptionPrices[extraOption],
          },
        });
      }

      for (const zoneCode of travelZoneCodes) {
        const travelZone = pricingSettings.travelZones[zoneCode];

        await transaction.travelZone.update({
          where: {
            profileId_zoneCode: {
              profileId: pricingProfileId,
              zoneCode,
            },
          },
          data: {
            label: travelZone.label,
            postalPrefixes: travelZone.postalPrefixes,
            amount: travelZone.amount,
          },
        });
      }
    });
  } catch {
    redirect("/admin/preise?status=invalid");
  }

  revalidatePath("/rechner");
  revalidatePath("/admin");
  revalidatePath("/admin/preise");
  redirect("/admin/preise?status=saved");
}
