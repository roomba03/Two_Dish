import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createAuthClient } from "@/lib/supabase/auth";
import { createServerClient } from "@/lib/supabase/server";

// proxy.ts only checks that a cook-session cookie *exists* — this is the real
// check: the token must belong to a live Supabase user whose profile role is
// cook or admin. Every cook-only read (lib/data/cook.ts, lib/data/kitchen.ts)
// and every cook-only server action goes through here, since server actions
// are public endpoints and layouts don't re-run on client navigation.
export const getVerifiedCookId = cache(async (): Promise<string | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get("cook-session")?.value;
  if (!token) return null;

  const authClient = createAuthClient();
  const {
    data: { user },
  } = await authClient.auth.getUser(token);
  if (!user) return null;

  const supabase = createServerClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return profile && ["cook", "admin"].includes(profile.role) ? user.id : null;
});

// For cook-only pages/data: bounce to the login page instead of returning null.
export async function requireCook(): Promise<string> {
  const cookId = await getVerifiedCookId();
  if (!cookId) redirect("/cook/login");
  return cookId;
}
