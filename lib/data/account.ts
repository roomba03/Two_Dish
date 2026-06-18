import { cache } from "react";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";

// ── Types ──────────────────────────────────────────────────────────────────────

export type CustomerProfile = {
  id: string;
  email: string;
  name: string;
  phone: string;
  delivery_street: string | null;
  delivery_city: string | null;
  delivery_zip: string | null;
};

export type CustomerOrder = {
  order_number: string;
  quantity: number;
  status: string;
  total_price: number;
  snapshot_dish_name: string;
  time_slot: string;
  created_at: string;
  menu_schedule: { delivery_date: string };
};

// ── Session helpers ────────────────────────────────────────────────────────────

// Decodes the customer-session JWT locally to extract the user ID.
// The cookie is httpOnly so it can't be forged client-side; expiry is
// checked against the `exp` claim to catch genuinely stale tokens.
export async function getCustomerUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("customer-session")?.value;
  if (!token) return null;

  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    // base64url → base64 → JSON
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, "=");
    const payload = JSON.parse(Buffer.from(padded, "base64").toString("utf8"));

    if (!payload.sub) return null;
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;

    return payload.sub as string;
  } catch {
    return null;
  }
}

// ── Queries ────────────────────────────────────────────────────────────────────

export const getCustomerFromCookie = cache(
  async (): Promise<CustomerProfile | null> => {
    const userId = await getCustomerUserId();
    if (!userId) return null;

    const supabase = createServerClient();
    const { data } = await supabase
      .from("profiles")
      .select(
        "id, email, name, phone, delivery_street, delivery_city, delivery_zip"
      )
      .eq("id", userId)
      .single();

    return (data as CustomerProfile) ?? null;
  }
);

export const getCustomerOrders = cache(
  async (customerId: string): Promise<CustomerOrder[]> => {
    const supabase = createServerClient();
    const { data } = await supabase
      .from("orders")
      .select(
        "order_number, quantity, status, total_price, snapshot_dish_name, time_slot, created_at, menu_schedule(delivery_date)"
      )
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false })
      .limit(20);

    return (data ?? []) as unknown as CustomerOrder[];
  }
);
