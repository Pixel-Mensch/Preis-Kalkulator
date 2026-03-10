import { z } from "zod";

import {
  extraOptions,
  fillLevels,
  floorLevels,
  objectTypes,
  problemFlags,
  walkDistances,
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

export type PublicInquiryInput = z.infer<typeof publicInquirySchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CompanySettingsInput = z.infer<typeof companySettingsSchema>;
