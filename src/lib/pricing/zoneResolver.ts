import type { TravelZoneConfig } from "@/lib/pricing/types";

function normalizePostalCode(postalCode: string) {
  return postalCode.replace(/\s+/g, "").trim();
}

export type TravelZoneResolution = {
  zone: TravelZoneConfig | undefined;
  matchedPrefix: string | null;
  isMatched: boolean;
};

export function resolveTravelZoneResolution(
  postalCode: string,
  travelZones: TravelZoneConfig[],
): TravelZoneResolution {
  const normalized = normalizePostalCode(postalCode);
  const candidates = [...travelZones].sort((left, right) => {
    const leftLength = Math.max(...left.postalPrefixes.map((prefix) => prefix.length), 0);
    const rightLength = Math.max(...right.postalPrefixes.map((prefix) => prefix.length), 0);

    return rightLength - leftLength;
  });

  const directMatch = candidates.find((zone) =>
    zone.postalPrefixes.some((prefix) => normalized.startsWith(prefix)),
  );

  if (directMatch) {
    return {
      zone: directMatch,
      matchedPrefix:
        directMatch.postalPrefixes.find((prefix) => normalized.startsWith(prefix)) ?? null,
      isMatched: true,
    };
  }

  const fallbackZone = candidates.find((zone) => zone.postalPrefixes.length === 0);

  if (fallbackZone) {
    return {
      zone: fallbackZone,
      matchedPrefix: null,
      isMatched: false,
    };
  }

  return {
    zone: candidates.at(-1),
    matchedPrefix: null,
    isMatched: false,
  };
}

export function resolveTravelZone(postalCode: string, travelZones: TravelZoneConfig[]) {
  return resolveTravelZoneResolution(postalCode, travelZones).zone;
}
