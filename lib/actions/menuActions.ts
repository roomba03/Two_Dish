"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";
import { createServerClient } from "@/lib/supabase/server";
import { createAuthClient } from "@/lib/supabase/auth";
import { getDefaultKitchen } from "@/lib/data/menu";

export type ActionState = { error?: string; success?: boolean };

async function getCookUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("cook-session")?.value;
  if (!token) return null;
  const authClient = createAuthClient();
  const {
    data: { user },
  } = await authClient.auth.getUser(token);
  return user?.id ?? null;
}

// ── Menu Items ─────────────────────────────────────────────────────────────────

const MenuItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z
    .number({ error: "Enter a valid price" })
    .positive("Price must be greater than 0"),
  image_url: z
    .string()
    .url("Enter a valid image URL")
    .optional()
    .or(z.literal("")),
});

function parseMenuItemForm(formData: FormData) {
  return {
    name: ((formData.get("name") as string) ?? "").trim(),
    description: ((formData.get("description") as string) ?? "").trim(),
    price: parseFloat((formData.get("price") as string) ?? "0"),
    image_url: ((formData.get("image_url") as string) ?? "").trim(),
  };
}

function firstError(result: z.ZodSafeParseError<unknown>): string {
  return result.error.issues[0]?.message ?? "Please check your details.";
}

export async function createMenuItem(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const kitchen = await getDefaultKitchen();
  if (!kitchen) return { error: "Kitchen not found." };

  const parsed = MenuItemSchema.safeParse(parseMenuItemForm(formData));
  if (!parsed.success) return { error: firstError(parsed) };

  const supabase = createServerClient();
  const { error } = await supabase.from("menu_items").insert({
    kitchen_id: kitchen.id,
    name: parsed.data.name,
    description: parsed.data.description,
    price: parsed.data.price,
    image_url: parsed.data.image_url || null,
  });

  if (error) return { error: "Failed to create dish." };

  revalidatePath("/cook/menu");
  return { success: true };
}

export async function updateMenuItem(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const id = (formData.get("id") as string) ?? "";
  if (!id) return { error: "Missing dish ID." };

  const parsed = MenuItemSchema.safeParse(parseMenuItemForm(formData));
  if (!parsed.success) return { error: firstError(parsed) };

  const supabase = createServerClient();
  const { error } = await supabase
    .from("menu_items")
    .update({
      name: parsed.data.name,
      description: parsed.data.description,
      price: parsed.data.price,
      image_url: parsed.data.image_url || null,
    })
    .eq("id", id);

  if (error) return { error: "Failed to update dish." };

  revalidatePath("/cook/menu");
  revalidatePath(`/cook/menu/${id}`);
  return { success: true };
}

export async function deleteMenuItem(id: string, _formData: FormData): Promise<void> {
  const supabase = createServerClient();
  await supabase.from("menu_items").delete().eq("id", id);
  revalidatePath("/cook/menu");
}

// ── Ingredients ───────────────────────────────────────────────────────────────

const IngredientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  unit: z.string().min(1, "Unit is required (e.g. cups, lbs, oz)"),
  per_unit_quantity: z
    .number({ error: "Enter a valid quantity" })
    .positive("Must be greater than 0"),
});

export async function addIngredient(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const menuItemId = (formData.get("menu_item_id") as string) ?? "";
  if (!menuItemId) return { error: "Missing dish ID." };

  const parsed = IngredientSchema.safeParse({
    name: ((formData.get("name") as string) ?? "").trim(),
    unit: ((formData.get("unit") as string) ?? "").trim(),
    per_unit_quantity: parseFloat(
      (formData.get("per_unit_quantity") as string) ?? "0"
    ),
  });

  if (!parsed.success) return { error: firstError(parsed) };

  const supabase = createServerClient();
  const { error } = await supabase.from("ingredients").insert({
    menu_item_id: menuItemId,
    name: parsed.data.name,
    unit: parsed.data.unit,
    per_unit_quantity: parsed.data.per_unit_quantity,
  });

  if (error) return { error: "Failed to add ingredient." };

  revalidatePath(`/cook/menu/${menuItemId}`);
  return { success: true };
}

export async function deleteIngredient(
  ingredientId: string,
  menuItemId: string,
  _formData: FormData
): Promise<void> {
  const supabase = createServerClient();
  await supabase.from("ingredients").delete().eq("id", ingredientId);
  revalidatePath(`/cook/menu/${menuItemId}`);
}

// ── Schedule ──────────────────────────────────────────────────────────────────

const ScheduleSchema = z.object({
  delivery_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date"),
  menu_item_id: z.string().uuid("Select a dish"),
  max_capacity: z
    .number({ error: "Enter a valid number" })
    .int()
    .positive("Must be at least 1"),
});

export async function scheduleMenuItem(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const kitchen = await getDefaultKitchen();
  if (!kitchen) return { error: "Kitchen not found." };

  const cookId = await getCookUserId();
  if (!cookId) return { error: "Not signed in." };

  const parsed = ScheduleSchema.safeParse({
    delivery_date: (formData.get("delivery_date") as string) ?? "",
    menu_item_id: (formData.get("menu_item_id") as string) ?? "",
    max_capacity: parseInt(
      (formData.get("max_capacity") as string) ?? "50",
      10
    ),
  });

  if (!parsed.success) return { error: firstError(parsed) };

  const supabase = createServerClient();

  // Check if this date is already scheduled so we don't reset orders_count
  const { data: existing } = await supabase
    .from("menu_schedule")
    .select("id")
    .eq("kitchen_id", kitchen.id)
    .eq("delivery_date", parsed.data.delivery_date)
    .single();

  if (existing) {
    const { error } = await supabase
      .from("menu_schedule")
      .update({
        menu_item_id: parsed.data.menu_item_id,
        assigned_cook_id: cookId,
        max_capacity: parsed.data.max_capacity,
      })
      .eq("id", existing.id);

    if (error) return { error: "Failed to update schedule." };
  } else {
    const { error } = await supabase.from("menu_schedule").insert({
      kitchen_id: kitchen.id,
      menu_item_id: parsed.data.menu_item_id,
      delivery_date: parsed.data.delivery_date,
      assigned_cook_id: cookId,
      max_capacity: parsed.data.max_capacity,
      orders_count: 0,
    });

    if (error) return { error: "Failed to schedule dish." };
  }

  revalidatePath("/cook/schedule");
  revalidatePath("/cook");
  return { success: true };
}

export async function unscheduleDate(
  scheduleId: string,
  _formData: FormData
): Promise<void> {
  const supabase = createServerClient();
  await supabase.from("menu_schedule").delete().eq("id", scheduleId);
  revalidatePath("/cook/schedule");
  revalidatePath("/cook");
}
