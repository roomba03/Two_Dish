import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import { point, polygon } from "@turf/helpers";
import type { GeoJsonPolygon } from "@/lib/data/menu";

// Nominatim returns zero results for an otherwise-valid address if it
// includes a unit/apartment/suite designator (e.g. "100 Park Ave Apt 5"
// fails to geocode while "100 Park Ave" succeeds) — the unit doesn't affect
// which building the address is in, so strip it before geocoding.
export function stripUnitDesignator(address: string): string {
  return address
    .replace(/,?\s*(?:\b(?:apt|apartment|unit|suite|ste)\.?\b|#)\s*[\w-]*/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export async function geocodeAddress(
  street: string,
  city: string,
  zip: string
): Promise<[number, number] | null> {
  try {
    const q = encodeURIComponent(
      `${stripUnitDesignator(street)}, ${city}, ${zip}, US`
    );
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1&countrycodes=us`,
      {
        headers: { "User-Agent": "TheFamilyBusiness/1.0" },
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.length) return null;
    return [parseFloat(data[0].lon), parseFloat(data[0].lat)]; // [lng, lat] GeoJSON order
  } catch {
    return null;
  }
}

export function isAddressInZone(
  lngLat: [number, number],
  zone: GeoJsonPolygon
): boolean {
  const pt = point(lngLat);
  const poly = polygon(zone.coordinates as number[][][]);
  return booleanPointInPolygon(pt, poly);
}
