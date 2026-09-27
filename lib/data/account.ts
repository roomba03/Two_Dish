import { cache } from "react";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";
import { createAuthClient } from "@/lib/supabase/auth";

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

// Verifies the customer-session token with Supabase rather than just
// decoding it — an httpOnly cookie can't be read by page scripts, but anyone
// can still set one by hand, so an unverified `sub` claim would let a forged
// token read another customer's profile and orders.
export const getCustomerUserId = cache(async (): Promise<string | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get("customer-session")?.value;
  if (!token) return null;

  const authClient = createAuthClient();
  const {
    data: { user },
  } = await authClient.auth.getUser(token);
  return user?.id ?? null;
});

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
