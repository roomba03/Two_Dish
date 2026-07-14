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

// ── Dish image upload ─────────────────────────────────────────────────────────

const DISH_IMAGES_BUCKET = "dish-images";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function extractStoragePath(url: string): string | null {
  const marker = `/storage/v1/object/public/${DISH_IMAGES_BUCKET}/`;
  const idx = url.indexOf(marker);
  return idx === -1 ? null : url.slice(idx + marker.length);
}

async function uploadDishImage(
  supabase: ReturnType<typeof createServerClient>,
  file: File
): Promise<{ url?: string; error?: string }> {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { error: "Image must be a JPEG, PNG, WebP, or GIF." };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { error: "Image must be smaller than 5MB." };
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from(DISH_IMAGES_BUCKET)
    .upload(path, file, { contentType: file.type });

  if (error) return { error: "Failed to upload image." };

  const { data } = supabase.storage.from(DISH_IMAGES_BUCKET).getPublicUrl(path);
  return { url: data.publicUrl };
}

// Best-effort — an orphaned file in storage isn't worth failing the request over.
async function deleteDishImage(
  supabase: ReturnType<typeof createServerClient>,
  imageUrl: string | null
): Promise<void> {
  if (!imageUrl) return;
  const path = extractStoragePath(imageUrl);
  if (!path) return;
  await supabase.storage.from(DISH_IMAGES_BUCKET).remove([path]);
}

// Resolves the image for a create/update: an uploaded file takes priority
// over the manually-entered URL field.
async function resolveImageUrl(
  formData: FormData,
  parsedImageUrl: string | undefined,
  supabase: ReturnType<typeof createServerClient>
): Promise<{ url: string | null; error?: string }> {
  const file = formData.get("image_file");
  if (file instanceof File && file.size > 0) {
    const result = await uploadDishImage(supabase, file);
    if (result.error) return { url: null, error: result.error };
    return { url: result.url ?? null };
  }
  return { url: parsedImageUrl || null };
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

  const image = await resolveImageUrl(formData, parsed.data.image_url, supabase);
  if (image.error) return { error: image.error };

  const { error } = await supabase.from("menu_items").insert({
    kitchen_id: kitchen.id,
    name: parsed.data.name,
    description: parsed.data.description,
    price: parsed.data.price,
    image_url: image.url,
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

  const { data: existing } = await supabase
    .from("menu_items")
    .select("image_url")
    .eq("id", id)
    .single();

  const image = await resolveImageUrl(formData, parsed.data.image_url, supabase);
  if (image.error) return { error: image.error };

  const { error } = await supabase
    .from("menu_items")
    .update({
      name: parsed.data.name,
      description: parsed.data.description,
      price: parsed.data.price,
      image_url: image.url,
    })
    .eq("id", id);

  if (error) return { error: "Failed to update dish." };

  if (existing && existing.image_url !== image.url) {
    await deleteDishImage(supabase, existing.image_url);
  }

  revalidatePath("/cook/menu");
  revalidatePath(`/cook/menu/${id}`);
  return { success: true };
}

export async function deleteMenuItem(id: string, _formData: FormData): Promise<void> {
  const supabase = createServerClient();

  const { data: existing } = await supabase
    .from("menu_items")
    .select("image_url")
    .eq("id", id)
    .single();

  await supabase.from("menu_items").delete().eq("id", id);
  if (existing) await deleteDishImage(supabase, existing.image_url);

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

  // Only allow removal if no orders have been placed for this day. Re-check
  // server-side (rather than trusting the UI) in case an order came in after
  // the page loaded.
  const { data: schedule } = await supabase
    .from("menu_schedule")
    .select("orders_count")
    .eq("id", scheduleId)
    .single();

  if (!schedule || schedule.orders_count > 0) {
    return;
  }

  await supabase.from("menu_schedule").delete().eq("id", scheduleId);
  revalidatePath("/cook/schedule");
  revalidatePath("/cook");
}
