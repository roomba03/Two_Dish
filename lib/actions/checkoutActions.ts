"use server";

import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";
import { createAuthClient } from "@/lib/supabase/auth";
import { OrderCheckoutSchema, type OrderCheckoutInput } from "@/lib/validations";
import { getDefaultKitchen } from "@/lib/data/menu";

// ── Timezone ──────────────────────────────────────────────────────────────────
const KITCHEN_TZ = "America/Chicago";

// ── Types ─────────────────────────────────────────────────────────────────────

export type DateEligibility =
  | { eligible: true }
  | {
      eligible: false;
      reason: "past" | "same_day" | "cutoff_passed" | "no_menu";
    };

export type CheckoutResult =
  | { success: true; orderNumber: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

// ── Internal helpers ──────────────────────────────────────────────────────────

function getKitchenNow(): { dateStr: string; minuteOfDay: number } {
  const now = new Date();

  const dateStr = new Intl.DateTimeFormat("en-CA", {
    timeZone: KITCHEN_TZ,
  }).format(now);

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: KITCHEN_TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const hour = parseInt(parts.find((p) => p.type === "hour")!.value, 10);
  const minute = parseInt(parts.find((p) => p.type === "minute")!.value, 10);

  return { dateStr, minuteOfDay: hour * 60 + minute };
}

function shiftDate(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const shifted = new Date(y, m - 1, d + days);
  return new Intl.DateTimeFormat("en-CA").format(shifted);
}

function generateOrderNumber(dateStr: string): string {
  const compact = dateStr.replace(/-/g, "");
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `TFB-${compact}-${suffix}`;
}

// ── Public: Date eligibility check ───────────────────────────────────────────

export async function checkDeliveryDateEligibility(
  deliveryDate: string
): Promise<DateEligibility> {
  const { dateStr: today, minuteOfDay } = getKitchenNow();
  const tomorrow = shiftDate(today, 1);

  const CUTOFF_MINUTES = 23 * 60 + 59;

  if (deliveryDate < today) {
    return { eligible: false, reason: "past" };
  }

  if (deliveryDate === today) {
    return { eligible: false, reason: "same_day" };
  }

  if (deliveryDate === tomorrow && minuteOfDay >= CUTOFF_MINUTES) {
    return { eligible: false, reason: "cutoff_passed" };
  }

  return { eligible: true };
}

// ── Public: Server Action ─────────────────────────────────────────────────────

export async function submitCheckoutOrder(
  raw: OrderCheckoutInput
): Promise<CheckoutResult> {
  // ── 1. Validate input ───────────────────────────────────────────────────────
  const parsed = OrderCheckoutSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid form data.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }
  const data = parsed.data;

  // ── 1b. Validate delivery area ─────────────────────────────────────────────
  const kitchen = await getDefaultKitchen();
  if (!kitchen) {
    return { success: false, error: "Service temporarily unavailable." };
  }
  if (!kitchen.active_zips.includes(data.deliveryZip)) {
    return {
      success: false,
      error: `We don't deliver to ZIP ${data.deliveryZip} yet. We currently serve: ${kitchen.active_zips.join(", ")}.`,
      fieldErrors: {
        deliveryZip: [`ZIP ${data.deliveryZip} is outside our delivery area`],
      },
    };
  }

  const supabase = createServerClient();

  // ── 2. Fetch schedule row ───────────────────────────────────────────────────
  const { data: schedule, error: scheduleError } = await supabase
    .from("menu_schedule")
    .select(
      "id, delivery_date, max_capacity, orders_count, menu_items(name, price), kitchen_id"
    )
    .eq("id", data.scheduleId)
    .single();

  if (scheduleError || !schedule) {
    return { success: false, error: "Menu item not found." };
  }

  // ── 3. Enforce the 11:59 PM time lock ──────────────────────────────────────
  const eligibility = await checkDeliveryDateEligibility(schedule.delivery_date);
  if (!eligibility.eligible) {
    const messages: Record<typeof eligibility.reason, string> = {
      past: "That date has already passed.",
      same_day: "Same-day orders are not available.",
      cutoff_passed:
        "Orders for tomorrow closed at 11:59 PM. Please check the menu for the next available date.",
      no_menu: "No menu is scheduled for that date.",
    };
    return { success: false, error: messages[eligibility.reason] };
  }

  // ── 4. Check capacity ───────────────────────────────────────────────────────
  const remaining = schedule.max_capacity - schedule.orders_count;
  if (data.quantity > remaining) {
    return {
      success: false,
      error:
        remaining === 0
          ? "This day is sold out."
          : `Only ${remaining} meal${remaining === 1 ? "" : "s"} left. Please reduce your quantity.`,
    };
  }

  // ── 5. Resolve dish snapshot ────────────────────────────────────────────────
  const menuItem = schedule.menu_items as unknown as {
    name: string;
    price: number;
  };
  const unitPrice = Number(menuItem.price);
  const totalPrice = unitPrice * data.quantity;
  const orderNumber = generateOrderNumber(schedule.delivery_date);

  // ── 6. Resolve signed-in customer (if any) ──────────────────────────────────
  let customerId: string | null = null;
  const cookieStore = await cookies();
  const customerToken = cookieStore.get("customer-session")?.value;

  if (customerToken) {
    const authClient = createAuthClient();
    const {
      data: { user },
    } = await authClient.auth.getUser(customerToken);
    if (user) customerId = user.id;
  }

  // ── 7. Mock payment (Day 1) ─────────────────────────────────────────────────
  const mockPaymentIntentId = `mock_pi_${Date.now()}`;

  // ── 8. Write order + increment orders_count ─────────────────────────────────
  const { error: insertError } = await supabase.from("orders").insert({
    order_number: orderNumber,
    customer_id: customerId,
    schedule_id: data.scheduleId,
    quantity: data.quantity,
    time_slot: data.timeSlot,
    status: "authorized",
    stripe_payment_intent_id: mockPaymentIntentId,
    total_price: totalPrice,
    customer_name: data.customerName,
    customer_phone: data.customerPhone,
    delivery_street: data.deliveryStreet,
    delivery_city: data.deliveryCity,
    delivery_zip: data.deliveryZip,
    snapshot_dish_name: menuItem.name,
    snapshot_unit_price: unitPrice,
    snapshot_kitchen_id: schedule.kitchen_id,
  });

  if (insertError) {
    return { success: false, error: "Failed to place order. Please try again." };
  }

  const { error: countError } = await supabase
    .from("menu_schedule")
    .update({ orders_count: schedule.orders_count + data.quantity })
    .eq("id", data.scheduleId)
    .lt("orders_count", schedule.max_capacity);

  if (countError) {
    console.error(
      `[checkoutActions] orders_count update failed for schedule ${data.scheduleId}:`,
      countError
    );
  }

  // ── 9. Update customer's saved delivery address ─────────────────────────────
  if (customerId) {
    await supabase
      .from("profiles")
      .update({
        delivery_street: data.deliveryStreet,
        delivery_city: data.deliveryCity,
        delivery_zip: data.deliveryZip,
      })
      .eq("id", customerId);
  }

  return { success: true, orderNumber };
}
