import type {
  EstimateInput,
  EstimateResult,
  ManualReviewReason,
} from "@/lib/pricing/types";
import { problemFlagLabels } from "@/lib/pricing/types";

export function getManualReviewReasons(
  input: EstimateInput,
  estimate: EstimateResult,
): ManualReviewReason[] {
  const reasons: ManualReviewReason[] = [];

  if (!estimate.travelZoneMatched) {
    reasons.push({
      code: "OUTSIDE_SERVICE_AREA",
      message: "PLZ außerhalb des Einsatzgebiets",
    });
  }

  if (input.areaSqm > 250) {
    reasons.push({
      code: "LARGE_AREA",
      message: "Fläche über 250 m²",
    });
  }

  if (
    input.fillLevel === "EXTREME" &&
    ["FLOOR_3", "FLOOR_4_PLUS"].includes(input.floorLevel) &&
    !input.hasElevator
  ) {
    reasons.push({
      code: "EXTREME_ACCESS",
      message: "Extremer Füllgrad in hoher Etage ohne Aufzug",
    });
  }

  if (
    input.objectType === "HOUSE" &&
    input.areaSqm >= 180 &&
    ["HEAVY", "EXTREME"].includes(input.fillLevel)
  ) {
    reasons.push({
      code: "LARGE_HOUSE",
      message: "Großes Haus mit hohem Füllgrad",
    });
  }

  if (estimate.travelZoneCode === "D" && input.areaSqm > 150) {
    reasons.push({
      code: "LONG_DISTANCE_LARGE_JOB",
      message: "Großes Objekt im Fernbereich",
    });
  }

  for (const flag of input.problemFlags) {
    reasons.push({
      code: `FLAG_${flag}`,
      message: problemFlagLabels[flag],
    });
  }

  return reasons;
}

export function requiresManualReview(reasons: ManualReviewReason[]) {
  return reasons.length > 0;
}
