"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { z } from "zod";
import { createAuthClient } from "@/lib/supabase/auth";
import { createServerClient } from "@/lib/supabase/server";

export type AuthState = { error?: string; message?: string; success?: boolean };
export type AddressState = { error?: string; success?: boolean };

// ── Schemas ───────────────────────────────────────────────────────────────────

const SignupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().regex(
    /^\+?[1-9]\d{1,14}$/,
    "Enter a valid phone number (e.g. +1 555 000 0000)"
  ),
  password: z.string().min(8, "Password must be at least 8 characters"),
  deliveryStreet: z.string().min(5, "Enter a full street address"),
  deliveryCity: z.string().min(2, "Enter a city"),
  deliveryZip: z.string().length(5, "ZIP code must be exactly 5 digits"),
});

// ── Cookie helper ─────────────────────────────────────────────────────────────

async function setCustomerSession(token: string) {
  const cookieStore = await cookies();
  cookieStore.set("customer-session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: "lax",
  });
}

// ── Signup ────────────────────────────────────────────────────────────────────

export async function signupCustomer(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const raw = {
    name: ((formData.get("name") as string) ?? "").trim(),
    email: ((formData.get("email") as string) ?? "").trim(),
    phone: ((formData.get("phone") as string) ?? "").trim(),
    password: (formData.get("password") as string) ?? "",
    deliveryStreet: ((formData.get("delivery_street") as string) ?? "").trim(),
    deliveryCity: ((formData.get("delivery_city") as string) ?? "").trim(),
    deliveryZip: ((formData.get("delivery_zip") as string) ?? "").trim(),
  };

  const parsed = SignupSchema.safeParse(raw);
  if (!parsed.success) {
    const first = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
    return { error: first ?? "Please check your details." };
  }

  const { name, email, phone, password, deliveryStreet, deliveryCity, deliveryZip } =
    parsed.data;

  const authClient = createAuthClient();
  const { data, error } = await authClient.auth.signUp({ email, password });

  if (error) {
    if (error.message.toLowerCase().includes("already registered")) {
      return {
        error:
          "An account with this email already exists. Please sign in instead.",
      };
    }
    return { error: error.message };
  }

  if (!data.user) {
    return { error: "Signup failed. Please try again." };
  }

  // Insert profile using the service role key so it works even if email
  // confirmation is required and there is no active session yet.
  const adminClient = createServerClient();
  await adminClient.from("profiles").insert({
    id: data.user.id,
    email,
    name,
    phone,
    role: "customer",
    delivery_street: deliveryStreet,
    delivery_city: deliveryCity,
    delivery_zip: deliveryZip,
  });

  // Email confirmation is enabled — no session returned yet.
  if (!data.session) {
    return {
      message:
        "Account created. Check your email to confirm, then sign in.",
    };
  }

  await setCustomerSession(data.session.access_token);
  redirect("/account");
}

// ── Login ─────────────────────────────────────────────────────────────────────

export async function loginCustomer(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = ((formData.get("email") as string) ?? "").trim();
  const password = (formData.get("password") as string) ?? "";

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const authClient = createAuthClient();
  const { data, error } = await authClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session) {
    return { error: "Invalid email or password." };
  }

  // Block cook/admin accounts from using the customer portal.
  const adminClient = createServerClient();
  const { data: profile } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  if (!profile) {
    return { error: "Account not found. Please sign up first." };
  }

  if (profile.role !== "customer") {
    return { error: "Use the kitchen portal to sign in as a cook." };
  }

  await setCustomerSession(data.session.access_token);
  return { success: true };
}

// ── Logout ────────────────────────────────────────────────────────────────────

export async function logoutCustomer(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("customer-session");
  redirect("/account/login");
}

// ── Update saved delivery address ─────────────────────────────────────────────

export async function updateSavedAddress(
  _prev: AddressState,
  formData: FormData
): Promise<AddressState> {
  const cookieStore = await cookies();
  const token = cookieStore.get("customer-session")?.value;
  if (!token) return { error: "Not signed in." };

  const authClient = createAuthClient();
  const {
    data: { user },
  } = await authClient.auth.getUser(token);
  if (!user) return { error: "Session expired. Please sign in again." };

  const street = ((formData.get("delivery_street") as string) ?? "").trim();
  const city = ((formData.get("delivery_city") as string) ?? "").trim();
  const zip = ((formData.get("delivery_zip") as string) ?? "").trim();

  if (!street || !city || zip.length !== 5) {
    return { error: "Please fill in a complete delivery address." };
  }

  const supabase = createServerClient();
  const { error } = await supabase
    .from("profiles")
    .update({ delivery_street: street, delivery_city: city, delivery_zip: zip })
    .eq("id", user.id);

  if (error) return { error: "Failed to save address. Please try again." };

  return { success: true };
}
