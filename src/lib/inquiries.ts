import type { EstimateResult, ManualReviewReason, PricingConfig } from "@/lib/pricing/types";
import type { PublicInquiryInput } from "@/lib/validation";

export type InquiryCalculationSnapshot = {
  createdAt: string;
  pricingConfig: PricingConfig;
  estimate: EstimateResult;
  manualReviewReasons: ManualReviewReason[];
  input: PublicInquiryInput;
};

export function createPublicInquiryId() {
  return crypto.randomUUID().split("-")[0]!.toUpperCase();
}

export function serializeInquirySnapshot(snapshot: InquiryCalculationSnapshot) {
  return JSON.stringify(snapshot);
}

export function parseJsonValue<T>(value: string) {
  return JSON.parse(value) as T;
}
