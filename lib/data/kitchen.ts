import { cache } from "react";
import { createServerClient } from "@/lib/supabase/server";
import { getDefaultKitchen, type MenuItem } from "@/lib/data/menu";

export type { MenuItem };

export type IngredientRow = {
  id: string;
  name: string;
  unit: string;
  per_unit_quantity: number;
};

export type ScheduleEntry = {
  id: string;
  delivery_date: string;
  max_capacity: number;
  orders_count: number;
  menu_items: { id: string; name: string; price: number };
};

export const getAllMenuItems = cache(async (): Promise<MenuItem[]> => {
  const kitchen = await getDefaultKitchen();
  if (!kitchen) return [];

  const supabase = createServerClient();
  const { data } = await supabase
    .from("menu_items")
    .select("id, name, description, price, image_url")
    .eq("kitchen_id", kitchen.id)
    .order("name");

  return (data ?? []) as MenuItem[];
});

export const getMenuItemWithIngredients = cache(
  async (
    itemId: string
  ): Promise<{ item: MenuItem; ingredients: IngredientRow[] } | null> => {
    const supabase = createServerClient();

    const { data: item } = await supabase
      .from("menu_items")
      .select("id, name, description, price, image_url")
      .eq("id", itemId)
      .single();

    if (!item) return null;

    const { data: ingredients } = await supabase
      .from("ingredients")
      .select("id, name, unit, per_unit_quantity")
      .eq("menu_item_id", itemId)
      .order("name");

    return {
      item: item as MenuItem,
      ingredients: (ingredients ?? []) as IngredientRow[],
    };
  }
);

export const getUpcomingSchedule = cache(async (): Promise<ScheduleEntry[]> => {
  const kitchen = await getDefaultKitchen();
  if (!kitchen) return [];

  const supabase = createServerClient();

  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Chicago",
  }).format(new Date());
  const [y, m, d] = today.split("-").map(Number);
  const endDate = new Intl.DateTimeFormat("en-CA").format(
    new Date(y, m - 1, d + 14)
  );

  const { data } = await supabase
    .from("menu_schedule")
    .select(
      "id, delivery_date, max_capacity, orders_count, menu_items(id, name, price)"
    )
    .eq("kitchen_id", kitchen.id)
    .gte("delivery_date", today)
    .lte("delivery_date", endDate)
    .order("delivery_date");

  return (data ?? []) as unknown as ScheduleEntry[];
});
