"use server";

import { revalidatePath } from "next/cache";

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
import { companySettingsSchema } from "@/lib/validation";

function getStringValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function getIntValue(formData: FormData, key: string) {
  return Number.parseInt(getStringValue(formData, key), 10);
}

function getFloatValue(formData: FormData, key: string) {
  return Number.parseFloat(getStringValue(formData, key));
}

export async function updateInquiryStatusAction(formData: FormData) {
  await requireAdminSession();

  const inquiryId = getStringValue(formData, "inquiryId");
  const status = getStringValue(formData, "status") as InquiryStatus;

  if (!inquiryId || !inquiryStatuses.includes(status)) {
    throw new Error("Invalid inquiry status update payload.");
  }

  await prisma.inquiry.update({
    where: {
      id: inquiryId,
    },
    data: {
      status,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/anfragen");
  revalidatePath(`/admin/anfragen/${inquiryId}`);
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

  if (!parsedPayload.success) {
    throw new Error("Invalid company settings payload.");
  }

  await prisma.companySettings.update({
    where: {
      id: companySettingsId,
    },
    data: parsedPayload.data,
  });

  revalidatePath("/");
  revalidatePath("/rechner");
  revalidatePath("/admin/firma");
}

export async function updatePricingSettingsAction(formData: FormData) {
  await requireAdminSession();

  const pricingProfileId = getStringValue(formData, "pricingProfileId");

  await prisma.$transaction(async (transaction) => {
    await transaction.pricingProfile.update({
      where: {
        id: pricingProfileId,
      },
      data: {
        name: getStringValue(formData, "profileName"),
        minimumOrderValue: getIntValue(formData, "minimumOrderValue"),
        baseRatePerEffectiveSqm: getIntValue(formData, "baseRatePerEffectiveSqm"),
        minFactor: getFloatValue(formData, "minFactor"),
        maxFactor: getFloatValue(formData, "maxFactor"),
        elevatorReductionFactor: getFloatValue(formData, "elevatorReductionFactor"),
      },
    });

    for (const objectType of objectTypes) {
      await transaction.objectBasePrice.update({
        where: {
          profileId_objectType: {
            profileId: pricingProfileId,
            objectType,
          },
        },
        data: {
          amount: getIntValue(formData, `objectBasePrice.${objectType}`),
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
          factor: getFloatValue(formData, `fillLevelFactor.${fillLevel}`),
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
          amount: getIntValue(formData, `floorSurcharge.${floorLevel}`),
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
          amount: getIntValue(formData, `walkDistance.${walkDistance}`),
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
          amount: getIntValue(formData, `extraOption.${extraOption}`),
        },
      });
    }

    for (const zoneCode of travelZoneCodes) {
      await transaction.travelZone.update({
        where: {
          profileId_zoneCode: {
            profileId: pricingProfileId,
            zoneCode,
          },
        },
        data: {
          label: getStringValue(formData, `travelZone.label.${zoneCode}`),
          postalPrefixes: getStringValue(formData, `travelZone.prefixes.${zoneCode}`),
          amount: getIntValue(formData, `travelZone.amount.${zoneCode}`),
        },
      });
    }
  });

  revalidatePath("/rechner");
  revalidatePath("/admin");
  revalidatePath("/admin/preise");
}
