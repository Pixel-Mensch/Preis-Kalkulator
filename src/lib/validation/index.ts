import { z } from "zod";

import {
  extraOptions,
  fillLevels,
  floorLevels,
  objectTypes,
  problemFlags,
  travelZoneCodes,
  walkDistances,
  type ExtraOption,
  type FillLevel,
  type FloorLevel,
  type ObjectType,
  type TravelZoneCode,
  type WalkDistance,
} from "@/lib/pricing/types";

function optionalNumberField() {
  return z
    .union([z.number(), z.string(), z.null(), z.undefined()])
    .transform((value) => {
      if (value === null || value === undefined || value === "") {
        return undefined;
      }

      const parsed =
        typeof value === "number" ? value : Number.parseInt(String(value), 10);
      return Number.isFinite(parsed) ? parsed : undefined;
    });
}

function optionalTextField(maxLength: number) {
  return z
    .union([z.string(), z.undefined(), z.null()])
    .transform((value) => {
      if (!value) {
        return undefined;
      }

      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed.slice(0, maxLength) : undefined;
    });
}

function integerField(min: number, max: number) {
  return z.coerce.number().int().min(min).max(max);
}

function decimalField(min: number, max: number) {
  return z.coerce.number().min(min).max(max);
}

function requiredTextField(minLength: number, maxLength: number) {
  return z.string().trim().min(minLength).max(maxLength);
}

function parseField<Value>(
  schema: z.ZodType<Value>,
  value: FormDataEntryValue | null,
): Value | null {
  const parsedValue = schema.safeParse(value);
  return parsedValue.success ? parsedValue.data : null;
}

function optionalDateField() {
  return z
    .union([z.string(), z.undefined(), z.null()])
    .transform((value) => {
      if (!value) {
        return undefined;
      }

      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : undefined;
    })
    .refine((value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value), {
      message: "Invalid date format.",
    });
}

export const publicInquirySchema = z.object({
  objectType: z.enum(objectTypes),
  areaSqm: z.number().int().min(1).max(5000),
  roomCount: optionalNumberField(),
  fillLevel: z.enum(fillLevels),
  floorLevel: z.enum(floorLevels),
  hasElevator: z.boolean(),
  walkDistance: z.enum(walkDistances),
  extraOptions: z.array(z.enum(extraOptions)).default([]),
  problemFlags: z.array(z.enum(problemFlags)).default([]),
  postalCode: z.string().regex(/^\d{5}$/),
  desiredDate: optionalDateField(),
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(6).max(40),
  email: z.email(),
  message: optionalTextField(2000),
  website: optionalTextField(120),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(200),
});

export const companySettingsSchema = z.object({
  companyName: z.string().trim().min(2).max(120),
  contactEmail: z.email(),
  contactPhone: z.string().trim().min(6).max(40),
  website: optionalTextField(120),
  street: z.string().trim().min(2).max(120),
  postalCode: z.string().regex(/^\d{5}$/),
  city: z.string().trim().min(2).max(120),
  serviceAreaNote: z.string().trim().min(2).max(160),
  estimateFootnote: z.string().trim().min(10).max(300),
  supportHours: optionalTextField(120),
});

export type PricingSettingsInput = {
  profileName: string;
  minimumOrderValue: number;
  baseRatePerEffectiveSqm: number;
  minFactor: number;
  maxFactor: number;
  elevatorReductionFactor: number;
  objectBasePrices: Record<ObjectType, number>;
  fillLevelFactors: Record<FillLevel, number>;
  floorSurcharges: Record<FloorLevel, number>;
  walkDistanceSurcharges: Record<WalkDistance, number>;
  extraOptionPrices: Record<ExtraOption, number>;
  travelZones: Record<
    TravelZoneCode,
    {
      label: string;
      postalPrefixes: string;
      amount: number;
    }
  >;
};

type PricingSettingsParseResult =
  | { success: true; data: PricingSettingsInput }
  | { success: false };

export function parsePricingSettingsFormData(
  formData: FormData,
): PricingSettingsParseResult {
  const baseSchema = z
    .object({
      profileName: requiredTextField(2, 120),
      minimumOrderValue: integerField(0, 100000),
      baseRatePerEffectiveSqm: integerField(1, 100000),
      minFactor: decimalField(0.1, 5),
      maxFactor: decimalField(0.1, 5),
      elevatorReductionFactor: decimalField(0, 1),
    })
    .refine((value) => value.maxFactor >= value.minFactor, {
      message: "Invalid pricing factor range.",
    });

  const baseValues = baseSchema.safeParse({
    profileName: formData.get("profileName"),
    minimumOrderValue: formData.get("minimumOrderValue"),
    baseRatePerEffectiveSqm: formData.get("baseRatePerEffectiveSqm"),
    minFactor: formData.get("minFactor"),
    maxFactor: formData.get("maxFactor"),
    elevatorReductionFactor: formData.get("elevatorReductionFactor"),
  });

  if (!baseValues.success) {
    return { success: false };
  }

  const objectBasePrices = {} as Record<ObjectType, number>;
  const fillLevelFactors = {} as Record<FillLevel, number>;
  const floorSurcharges = {} as Record<FloorLevel, number>;
  const walkDistanceSurcharges = {} as Record<WalkDistance, number>;
  const extraOptionPrices = {} as Record<ExtraOption, number>;
  const travelZones = {} as PricingSettingsInput["travelZones"];

  for (const objectType of objectTypes) {
    const parsedValue = parseField(
      integerField(0, 100000),
      formData.get(`objectBasePrice.${objectType}`),
    );

    if (parsedValue === null) {
      return { success: false };
    }

    objectBasePrices[objectType] = parsedValue;
  }

  for (const fillLevel of fillLevels) {
    const parsedValue = parseField(
      decimalField(0.1, 5),
      formData.get(`fillLevelFactor.${fillLevel}`),
    );

    if (parsedValue === null) {
      return { success: false };
    }

    fillLevelFactors[fillLevel] = parsedValue;
  }

  for (const floorLevel of floorLevels) {
    const parsedValue = parseField(
      integerField(0, 100000),
      formData.get(`floorSurcharge.${floorLevel}`),
    );

    if (parsedValue === null) {
      return { success: false };
    }

    floorSurcharges[floorLevel] = parsedValue;
  }

  for (const walkDistance of walkDistances) {
    const parsedValue = parseField(
      integerField(0, 100000),
      formData.get(`walkDistance.${walkDistance}`),
    );

    if (parsedValue === null) {
      return { success: false };
    }

    walkDistanceSurcharges[walkDistance] = parsedValue;
  }

  for (const extraOption of extraOptions) {
    const parsedValue = parseField(
      integerField(0, 100000),
      formData.get(`extraOption.${extraOption}`),
    );

    if (parsedValue === null) {
      return { success: false };
    }

    extraOptionPrices[extraOption] = parsedValue;
  }

  for (const zoneCode of travelZoneCodes) {
    const label = parseField(
      requiredTextField(2, 80),
      formData.get(`travelZone.label.${zoneCode}`),
    );
    const postalPrefixes = parseField(
      z.string().trim().max(80),
      formData.get(`travelZone.prefixes.${zoneCode}`),
    );
    const amount = parseField(
      integerField(0, 100000),
      formData.get(`travelZone.amount.${zoneCode}`),
    );

    if (label === null || postalPrefixes === null || amount === null) {
      return { success: false };
    }

    travelZones[zoneCode] = {
      label,
      postalPrefixes,
      amount,
    };
  }

  return {
    success: true,
    data: {
      ...baseValues.data,
      objectBasePrices,
      fillLevelFactors,
      floorSurcharges,
      walkDistanceSurcharges,
      extraOptionPrices,
      travelZones,
    },
  };
}

export type PublicInquiryInput = z.infer<typeof publicInquirySchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CompanySettingsInput = z.infer<typeof companySettingsSchema>;
