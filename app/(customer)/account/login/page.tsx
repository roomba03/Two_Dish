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
    <div className="relative min-h-[calc(100vh-4rem)] px-4">
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-16">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <h1 className="text-2xl text-deep-leaf">Customer login</h1>
          </div>

          <div className="tfb-card p-8">
            <LoginForm error={errorMessage} />
          </div>
        </div>
      </div>
    </div>
  );
}
