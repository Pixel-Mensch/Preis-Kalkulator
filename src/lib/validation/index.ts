import { z } from "zod";

import { isValidDateOnlyString } from "@/lib/date";
import {
  additionalAreaOptions,
  extraOptions,
  fillLevels,
  floorLevels,
  objectTypes,
  problemFlags,
  travelZoneCodes,
  walkDistances,
  type AdditionalArea,
  type ExtraOption,
  type FillLevel,
  type FloorLevel,
  type ObjectType,
  type TravelZoneCode,
  type WalkDistance,
} from "@/lib/pricing/types";

function optionalIntegerField(min: number, max: number, message: string) {
  return z
    .union([z.number(), z.string(), z.null(), z.undefined()])
    .transform((value, ctx) => {
      if (value === null || value === undefined || value === "") {
        return undefined;
      }

      const parsed =
        typeof value === "number" ? value : Number(String(value));

      if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
        ctx.addIssue({
          code: "custom",
          message,
        });
        return z.NEVER;
      }

      return parsed;
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

function emailField() {
  return z.string().trim().toLowerCase().email();
}

function normalizePhoneInput(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function normalizeGermanPhoneForComparison(value: string) {
  const compact = value.replace(/[()\s./-]+/g, "");

  if (compact.startsWith("+49")) {
    return `49${compact.slice(3).replace(/^0/, "")}`;
  }

  if (compact.startsWith("0049")) {
    return `49${compact.slice(4).replace(/^0/, "")}`;
  }

  if (compact.startsWith("0")) {
    return `49${compact.slice(1)}`;
  }

  return compact.replace(/\D/g, "");
}

function phoneField() {
  return z
    .string()
    .transform((value) => normalizePhoneInput(value))
    .pipe(z.string().min(7).max(40))
    .refine((value) => /^49\d{7,14}$/.test(normalizeGermanPhoneForComparison(value)), {
      message: "Bitte eine plausible Telefonnummer für Deutschland eingeben.",
    });
}

function parseField<Value>(
  schema: z.ZodType<Value>,
  value: FormDataEntryValue | null,
): Value | null {
  const parsedValue = schema.safeParse(value);
  return parsedValue.success ? parsedValue.data : null;
}

function hasUniqueValues<Value extends string>(values: Value[]) {
  return new Set(values).size === values.length;
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
    .refine((value) => !value || isValidDateOnlyString(value), {
      message: "Invalid date format.",
    });
}

export const publicInquirySchema = z
  .object({
    objectType: z.enum(objectTypes),
    additionalAreas: z.array(z.enum(additionalAreaOptions)).default([]),
    areaSqm: z.number().int().min(1).max(5000),
    roomCount: optionalIntegerField(1, 40, "Bitte eine plausible Zimmeranzahl angeben."),
    fillLevel: z.enum(fillLevels),
    floorLevel: z.enum(floorLevels),
    hasElevator: z.boolean(),
    walkDistance: z.enum(walkDistances),
    extraOptions: z.array(z.enum(extraOptions)).default([]),
    problemFlags: z.array(z.enum(problemFlags)).default([]),
    postalCode: z.string().regex(/^\d{5}$/),
    desiredDate: optionalDateField(),
    name: z.string().trim().min(2).max(120),
    phone: phoneField(),
    email: emailField(),
    message: optionalTextField(2000),
    website: optionalTextField(120),
  })
  .superRefine((value, ctx) => {
    if (!hasUniqueValues<AdditionalArea>(value.additionalAreas)) {
      ctx.addIssue({
        code: "custom",
        path: ["additionalAreas"],
        message: "Additional areas must be unique.",
      });
    }

    if (!hasUniqueValues<ExtraOption>(value.extraOptions)) {
      ctx.addIssue({
        code: "custom",
        path: ["extraOptions"],
        message: "Extra options must be unique.",
      });
    }

    if (!hasUniqueValues(value.problemFlags)) {
      ctx.addIssue({
        code: "custom",
        path: ["problemFlags"],
        message: "Problem flags must be unique.",
      });
    }

    const mainObjectAsAdditionalArea = value.objectType as AdditionalArea;
    if (value.additionalAreas.includes(mainObjectAsAdditionalArea)) {
      ctx.addIssue({
        code: "custom",
        path: ["additionalAreas"],
        message: "Main object must not be duplicated as an additional area.",
      });
    }
  });

export const loginSchema = z.object({
  email: emailField(),
  password: z.string().min(8).max(200),
});

export const companySettingsSchema = z.object({
  companyName: z.string().trim().min(2).max(120),
  contactEmail: emailField(),
  contactPhone: phoneField(),
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
