"use server";

import { createServerClient } from "@/lib/supabase/server";
import { getVerifiedCookId } from "@/lib/cookSession";
import { getDefaultKitchen, type GeoJsonPolygon } from "@/lib/data/menu";

export type ZoneResult = { success: true } | { success: false; error: string };

export async function saveDeliveryZone(
  geoJson: GeoJsonPolygon
): Promise<ZoneResult> {
  if (!(await getVerifiedCookId())) {
    return { success: false, error: "Unauthorized." };
  }

  if (
    geoJson.type !== "Polygon" ||
    !Array.isArray(geoJson.coordinates) ||
    geoJson.coordinates[0].length < 4
  ) {
    return { success: false, error: "Invalid zone shape." };
  }

  const kitchen = await getDefaultKitchen();
  if (!kitchen) return { success: false, error: "Kitchen not found." };

  const supabase = createServerClient();
  const { error } = await supabase
    .from("kitchens")
    .update({ delivery_zone: geoJson })
    .eq("id", kitchen.id);

  if (error) return { success: false, error: "Failed to save zone." };
  return { success: true };
}

export async function clearDeliveryZone(): Promise<ZoneResult> {
  if (!(await getVerifiedCookId())) {
    return { success: false, error: "Unauthorized." };
  }

  const kitchen = await getDefaultKitchen();
  if (!kitchen) return { success: false, error: "Kitchen not found." };

  const supabase = createServerClient();
  const { error } = await supabase
    .from("kitchens")
    .update({ delivery_zone: null })
    .eq("id", kitchen.id);

  if (error) return { success: false, error: "Failed to clear zone." };
  return { success: true };
}
