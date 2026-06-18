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
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-mono text-xs font-semibold uppercase tracking-widest text-neutral-400">
            Two Dish
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-neutral-900">
            Customer Login
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Sign in to manage your orders and saved address
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-8">
          <LoginForm error={errorMessage} />
        </div>
      </div>
    </div>
  );
}
