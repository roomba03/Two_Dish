import { NextRequest, NextResponse } from "next/server";
import { createAuthClient } from "@/lib/supabase/auth";
import { createServerClient } from "@/lib/supabase/server";

const ERRORS: Record<string, string> = {
  missing: "Email and password are required.",
  invalid: "Invalid email or password.",
  notfound: "Account not found. Please sign up first.",
  wrongrole: "Use the kitchen portal to sign in as a cook.",
  server: "Something went wrong. Please try again.",
};

function loginError(req: NextRequest, code: string) {
  const url = new URL("/account/login", req.url);
  url.searchParams.set("error", code);
  return NextResponse.redirect(url, { status: 303 });
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const email = ((formData.get("email") as string) ?? "").trim();
  const password = (formData.get("password") as string) ?? "";

  if (!email || !password) return loginError(req, "missing");

  const authClient = createAuthClient();
  const { data, error } = await authClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session) return loginError(req, "invalid");

  const adminClient = createServerClient();
  const { data: profile } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  if (!profile) return loginError(req, "notfound");
  if (profile.role !== "customer") return loginError(req, "wrongrole");

  const cookieParts = [
    `customer-session=${data.session.access_token}`,
    "HttpOnly",
    "Path=/",
    `Max-Age=${60 * 60 * 24 * 7}`,
    "SameSite=Lax",
  ];
  if (process.env.NODE_ENV === "production") cookieParts.push("Secure");

  return new Response(null, {
    status: 303,
    headers: {
      Location: new URL("/account", req.url).toString(),
      "Set-Cookie": cookieParts.join("; "),
    },
  });
}

export { ERRORS };
