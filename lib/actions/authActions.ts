"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createAuthClient } from "@/lib/supabase/auth";
import { createServerClient } from "@/lib/supabase/server";

export type LoginState = { error?: string };

export async function loginCook(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
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

  // Verify the account belongs to a cook or admin — not a customer.
  const adminClient = createServerClient();
  const { data: profile } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  if (!profile || !["cook", "admin"].includes(profile.role)) {
    return { error: "Access denied. Cook accounts only." };
  }

  const cookieStore = await cookies();
  cookieStore.set("cook-session", data.session.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours
    sameSite: "lax",
  });

  redirect("/cook");
}

export async function logoutCook(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("cook-session");
  redirect("/");
}
