import { cache } from "react";
import { createServerClient } from "@/lib/supabase/server";

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
};

export type ScheduleRow = {
  id: string;
  delivery_date: string;
  max_capacity: number;
  orders_count: number;
  kitchen_id: string;
  menu_items: MenuItem;
};

export type GeoJsonPolygon = {
  type: "Polygon";
  coordinates: [number, number][][]; // outer ring: [lng, lat][]
};

export type Kitchen = {
  id: string;
  name: string;
  active_zips: string[];
  delivery_zone: GeoJsonPolygon | null;
};

// React.cache deduplicates this across the render tree — any server component
// or server action that calls getDefaultKitchen() in the same request shares
// the same result without an extra round-trip.
export const getDefaultKitchen = cache(async (): Promise<Kitchen | null> => {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("kitchens")
    .select("id, name, active_zips, delivery_zone")
    .limit(1)
    .single();
  if (error) {
    console.error("[getDefaultKitchen] Supabase error:", error.message);
    return null;
  }
  return data as Kitchen;
});

export async function getWeekMenuSchedule(
  kitchenId: string,
  startDate: string,
  endDate: string
): Promise<ScheduleRow[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("menu_schedule")
    .select(
      `
      id,
      delivery_date,
      max_capacity,
      orders_count,
      kitchen_id,
      menu_items (
        id,
        name,
        description,
        price,
        image_url
      )
    `
    )
    .eq("kitchen_id", kitchenId)
    .gte("delivery_date", startDate)
    .lte("delivery_date", endDate)
    .order("delivery_date", { ascending: true });

  if (error) throw error;
  return (data ?? []) as unknown as ScheduleRow[];
}
