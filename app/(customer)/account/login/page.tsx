import Link from "next/link";
import LoginForm from "./LoginForm";
import { ERRORS } from "@/app/api/auth/customer-login/route";

export default async function CustomerLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const errorMessage = error ? (ERRORS[error] ?? "Something went wrong.") : undefined;

  return (
    <div className="relative min-h-screen px-4">
      <Link
        href="/"
        className="absolute left-4 top-4 inline-flex items-center gap-1.5 text-sm text-warmgray transition-opacity hover:opacity-70 sm:left-6 sm:top-6"
      >
        ← Back to home
      </Link>

      <div className="flex min-h-screen items-center justify-center py-16">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <Link
              href="/"
              className="font-heading text-lg text-deep-leaf transition-opacity hover:opacity-70"
            >
              Two Dish
            </Link>
            <h1 className="mt-2 text-2xl text-deep-leaf">Customer login</h1>
            <p className="mt-1 text-sm text-warmgray">
              Sign in to manage your orders and saved address
            </p>
          </div>

          <div className="tfb-card p-8">
            <LoginForm error={errorMessage} />
          </div>
        </div>
      </div>
    </div>
  );
}
