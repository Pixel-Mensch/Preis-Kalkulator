import type { TravelZoneConfig } from "@/lib/pricing/types";

function normalizePostalCode(postalCode: string) {
  return postalCode.replace(/\s+/g, "").trim();
}

export function resolveTravelZone(postalCode: string, travelZones: TravelZoneConfig[]) {
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
    return directMatch;
  }

  const fallbackZone = candidates.find((zone) => zone.postalPrefixes.length === 0);

  if (fallbackZone) {
    return fallbackZone;
  }

  return candidates.at(-1);
}
