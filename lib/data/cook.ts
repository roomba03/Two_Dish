import { cache } from "react";
import { createServerClient } from "@/lib/supabase/server";
import { getDefaultKitchen } from "@/lib/data/menu";

// ── Types ──────────────────────────────────────────────────────────────────────

export type OrderRow = {
  order_number: string;
  customer_name: string;
  customer_phone: string;
  delivery_street: string;
  delivery_city: string;
  delivery_zip: string;
  quantity: number;
  time_slot: "early" | "late";
  status: string;
  total_price: number;
};

export type ProductionRun = {
  date: string;
  dishName: string;
  maxCapacity: number;
  totalOrders: number;
  totalMeals: number;
  totalRevenue: number;
  earlyMeals: number;
  lateMeals: number;
  orders: OrderRow[];
};

export type IngredientLine = {
  name: string;
  unit: string;
  total: number;
};

// ── Queries ────────────────────────────────────────────────────────────────────

export const getProductionRun = cache(
  async (date: string): Promise<ProductionRun | null> => {
    const kitchen = await getDefaultKitchen();
    if (!kitchen) return null;

    const supabase = createServerClient();

    const { data: schedule } = await supabase
      .from("menu_schedule")
      .select("id, max_capacity, orders_count, menu_items(name)")
      .eq("kitchen_id", kitchen.id)
      .eq("delivery_date", date)
      .single();

    if (!schedule) return null;

    const menuItem = schedule.menu_items as unknown as { name: string };

    const { data: orders } = await supabase
      .from("orders")
      .select(
        "order_number, customer_name, customer_phone, delivery_street, delivery_city, delivery_zip, quantity, time_slot, status, total_price"
      )
      .eq("schedule_id", schedule.id)
      .neq("status", "cancelled")
      .order("time_slot")
      .order("created_at");

    const rows = (orders ?? []) as OrderRow[];

    const totalMeals = rows.reduce((s, o) => s + o.quantity, 0);
    const totalRevenue = rows.reduce((s, o) => s + Number(o.total_price), 0);
    const earlyMeals = rows
      .filter((o) => o.time_slot === "early")
      .reduce((s, o) => s + o.quantity, 0);
    const lateMeals = rows
      .filter((o) => o.time_slot === "late")
      .reduce((s, o) => s + o.quantity, 0);

    return {
      date,
      dishName: menuItem.name,
      maxCapacity: schedule.max_capacity,
      totalOrders: rows.length,
      totalMeals,
      totalRevenue,
      earlyMeals,
      lateMeals,
      orders: rows,
    };
  }
);

export const getIngredientList = cache(
  async (date: string): Promise<IngredientLine[]> => {
    const kitchen = await getDefaultKitchen();
    if (!kitchen) return [];

    const supabase = createServerClient();

    const { data: schedule } = await supabase
      .from("menu_schedule")
      .select("id, menu_item_id")
      .eq("kitchen_id", kitchen.id)
      .eq("delivery_date", date)
      .single();

    if (!schedule) return [];

    const { data: orderRows } = await supabase
      .from("orders")
      .select("quantity")
      .eq("schedule_id", schedule.id)
      .neq("status", "cancelled");

    const totalQty = (orderRows ?? []).reduce(
      (s: number, o: { quantity: number }) => s + o.quantity,
      0
    );

    if (totalQty === 0) return [];

    const { data: ingredients } = await supabase
      .from("ingredients")
      .select("name, unit, per_unit_quantity")
      .eq("menu_item_id", schedule.menu_item_id)
      .order("name");

    return (ingredients ?? []).map(
      (ing: { name: string; unit: string; per_unit_quantity: number }) => ({
        name: ing.name,
        unit: ing.unit,
        total: Number(ing.per_unit_quantity) * totalQty,
      })
    );
  }
);
