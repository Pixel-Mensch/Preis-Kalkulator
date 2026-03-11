export const objectTypes = [
  "APARTMENT",
  "HOUSE",
  "CELLAR",
  "ATTIC",
  "GARAGE",
  "OFFICE",
  "OTHER",
] as const;

export const fillLevels = ["LOW", "NORMAL", "HEAVY", "EXTREME"] as const;

export const floorLevels = [
  "GROUND",
  "FLOOR_1",
  "FLOOR_2",
  "FLOOR_3",
  "FLOOR_4_PLUS",
] as const;

export const walkDistances = ["SHORT", "MEDIUM", "LONG"] as const;

export const extraOptions = [
  "DISMANTLING",
  "KITCHEN_REMOVAL",
  "SWEPT_CLEAN",
  "EXPRESS",
  "EXTRA_AREA",
  "BULKY_ITEMS",
] as const;

export const additionalAreaOptions = ["CELLAR", "ATTIC", "GARAGE"] as const;

export const travelZoneCodes = ["A", "B", "C", "D"] as const;

export const problemFlags = [
  "HAZARDOUS_WASTE",
  "DANGEROUS_MATERIALS",
  "HOARDING",
  "PEST_INFESTATION",
  "MOLD",
  "FIRE_DAMAGE",
] as const;

export const inquiryStatuses = [
  "NEW",
  "IN_PROGRESS",
  "SITE_VISIT_SCHEDULED",
  "OFFER_SENT",
  "COMPLETED",
  "REJECTED",
] as const;

export type ObjectType = (typeof objectTypes)[number];
export type FillLevel = (typeof fillLevels)[number];
export type FloorLevel = (typeof floorLevels)[number];
export type WalkDistance = (typeof walkDistances)[number];
export type ExtraOption = (typeof extraOptions)[number];
export type AdditionalArea = (typeof additionalAreaOptions)[number];
export type TravelZoneCode = (typeof travelZoneCodes)[number];
export type ProblemFlag = (typeof problemFlags)[number];
export type InquiryStatus = (typeof inquiryStatuses)[number];

export type NumericMap<Key extends string> = Record<Key, number>;

export type TravelZoneConfig = {
  code: TravelZoneCode;
  label: string;
  surcharge: number;
  postalPrefixes: string[];
};

export type PricingConfig = {
  profileId: string;
  profileName: string;
  minimumOrderValue: number;
  baseRatePerEffectiveSqm: number;
  minFactor: number;
  maxFactor: number;
  elevatorReductionFactor: number;
  objectBasePrices: NumericMap<ObjectType>;
  fillLevelFactors: NumericMap<FillLevel>;
  floorSurcharges: NumericMap<FloorLevel>;
  walkDistanceSurcharges: NumericMap<WalkDistance>;
  extraOptionPrices: NumericMap<ExtraOption>;
  travelZones: TravelZoneConfig[];
};

export type EstimateInput = {
  objectType: ObjectType;
  additionalAreas: AdditionalArea[];
  areaSqm: number;
  roomCount?: number | null;
  fillLevel: FillLevel;
  floorLevel: FloorLevel;
  hasElevator: boolean;
  walkDistance: WalkDistance;
  extraOptions: ExtraOption[];
  problemFlags: ProblemFlag[];
  postalCode: string;
};

export type EstimateExtraBreakdown = {
  code: ExtraOption;
  label: string;
  amount: number;
};

export type EstimateResult = {
  travelZoneCode: TravelZoneCode;
  travelZoneLabel: string;
  effectiveArea: number;
  basePrice: number;
  effectiveAreaCost: number;
  floorSurcharge: number;
  walkDistanceSurcharge: number;
  travelZoneSurcharge: number;
  extraSurcharges: EstimateExtraBreakdown[];
  subtotalBeforeMinimum: number;
  subtotal: number;
  minimumOrderApplied: boolean;
  rangeMin: number;
  rangeMax: number;
  rangeText: string;
};

export type ManualReviewReason = {
  code: string;
  message: string;
};

export const objectTypeLabels: Record<ObjectType, string> = {
  APARTMENT: "Wohnung",
  HOUSE: "Haus",
  CELLAR: "Keller",
  ATTIC: "Dachboden",
  GARAGE: "Garage",
  OFFICE: "Büro",
  OTHER: "Sonstiges",
};

export const fillLevelLabels: Record<FillLevel, string> = {
  LOW: "wenig",
  NORMAL: "normal",
  HEAVY: "stark",
  EXTREME: "extrem",
};

export const floorLevelLabels: Record<FloorLevel, string> = {
  GROUND: "EG",
  FLOOR_1: "1",
  FLOOR_2: "2",
  FLOOR_3: "3",
  FLOOR_4_PLUS: "4+",
};

export const walkDistanceLabels: Record<WalkDistance, string> = {
  SHORT: "kurz",
  MEDIUM: "mittel",
  LONG: "lang",
};

export const extraOptionLabels: Record<ExtraOption, string> = {
  DISMANTLING: "Demontage von Möbeln",
  KITCHEN_REMOVAL: "Küche abbauen",
  SWEPT_CLEAN: "Besenrein",
  EXPRESS: "Express-Termin",
  EXTRA_AREA: "Zusatzbereich",
  BULKY_ITEMS: "Sperrige Einzelstücke",
};

export const additionalAreaLabels: Record<AdditionalArea, string> = {
  CELLAR: "Keller",
  ATTIC: "Dachboden",
  GARAGE: "Garage",
};

export const problemFlagLabels: Record<ProblemFlag, string> = {
  HAZARDOUS_WASTE: "Sondermüll",
  DANGEROUS_MATERIALS: "Gefahrstoffe",
  HOARDING: "Messi-Haushalt",
  PEST_INFESTATION: "Schädlingsbefall",
  MOLD: "Schimmel",
  FIRE_DAMAGE: "Brandrückstände",
};

export const inquiryStatusLabels: Record<InquiryStatus, string> = {
  NEW: "Neu",
  IN_PROGRESS: "In Bearbeitung",
  SITE_VISIT_SCHEDULED: "Besichtigung geplant",
  OFFER_SENT: "Angebot gesendet",
  COMPLETED: "Abgeschlossen",
  REJECTED: "Abgelehnt",
};
