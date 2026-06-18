import SignupForm from "./SignupForm";

export default function CustomerSignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-mono text-xs font-semibold uppercase tracking-widest text-neutral-400">
            Two Dish
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-neutral-900">
            Create your account
          </h1>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-8">
          <SignupForm />
        </div>
      </div>
    </div>
  );
}
