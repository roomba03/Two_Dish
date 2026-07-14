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
  delivery_date: string;
  dish_name: string;
};

export type ProductionDay = {
  date: string;
  dishName: string;
  maxCapacity: number;
  ordersCount: number;
};

export type ProductionRun = {
  startDate: string;
  endDate: string;
  totalCapacity: number;
  totalOrders: number;
  totalMeals: number;
  totalRevenue: number;
  earlyMeals: number;
  lateMeals: number;
  days: ProductionDay[];
  orders: OrderRow[];
};

export type IngredientLine = {
  name: string;
  unit: string;
  total: number;
};

// ── Queries ────────────────────────────────────────────────────────────────────

export const getProductionRunRange = cache(
  async (startDate: string, endDate: string): Promise<ProductionRun | null> => {
    const kitchen = await getDefaultKitchen();
    if (!kitchen) return null;

    const supabase = createServerClient();

    const { data: schedule } = await supabase
      .from("menu_schedule")
      .select("id, delivery_date, max_capacity, orders_count, menu_items(name)")
      .eq("kitchen_id", kitchen.id)
      .gte("delivery_date", startDate)
      .lte("delivery_date", endDate)
      .order("delivery_date");

    const scheduleRows = schedule ?? [];

    const days: ProductionDay[] = scheduleRows.map((s) => ({
      date: s.delivery_date,
      dishName: (s.menu_items as unknown as { name: string }).name,
      maxCapacity: s.max_capacity,
      ordersCount: s.orders_count,
    }));

    if (scheduleRows.length === 0) {
      return {
        startDate,
        endDate,
        totalCapacity: 0,
        totalOrders: 0,
        totalMeals: 0,
        totalRevenue: 0,
        earlyMeals: 0,
        lateMeals: 0,
        days,
        orders: [],
      };
    }

    const scheduleMeta = new Map(
      scheduleRows.map((s) => [
        s.id,
        {
          date: s.delivery_date,
          dishName: (s.menu_items as unknown as { name: string }).name,
        },
      ])
    );

    const { data: orders } = await supabase
      .from("orders")
      .select(
        "order_number, customer_name, customer_phone, delivery_street, delivery_city, delivery_zip, quantity, time_slot, status, total_price, schedule_id"
      )
      .in(
        "schedule_id",
        scheduleRows.map((s) => s.id)
      )
      .neq("status", "cancelled")
      .order("time_slot")
      .order("created_at");

    const rows: OrderRow[] = (orders ?? []).map((o) => {
      const meta = scheduleMeta.get(o.schedule_id);
      return {
        order_number: o.order_number,
        customer_name: o.customer_name,
        customer_phone: o.customer_phone,
        delivery_street: o.delivery_street,
        delivery_city: o.delivery_city,
        delivery_zip: o.delivery_zip,
        quantity: o.quantity,
        time_slot: o.time_slot,
        status: o.status,
        total_price: o.total_price,
        delivery_date: meta?.date ?? "",
        dish_name: meta?.dishName ?? "",
      };
    });

    rows.sort((a, b) => a.delivery_date.localeCompare(b.delivery_date));

    const totalMeals = rows.reduce((s, o) => s + o.quantity, 0);
    const totalRevenue = rows.reduce((s, o) => s + Number(o.total_price), 0);
    const earlyMeals = rows
      .filter((o) => o.time_slot === "early")
      .reduce((s, o) => s + o.quantity, 0);
    const lateMeals = rows
      .filter((o) => o.time_slot === "late")
      .reduce((s, o) => s + o.quantity, 0);
    const totalCapacity = scheduleRows.reduce((s, sch) => s + sch.max_capacity, 0);

    return {
      startDate,
      endDate,
      totalCapacity,
      totalOrders: rows.length,
      totalMeals,
      totalRevenue,
      earlyMeals,
      lateMeals,
      days,
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
