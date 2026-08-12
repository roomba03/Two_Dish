import SignupForm from "./SignupForm";

export default function CustomerSignupPage() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] px-4">
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-16">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <h1 className="text-2xl text-deep-leaf">Create your account</h1>
          </div>

          <div className="tfb-card p-8">
            <SignupForm />
          </div>
        </div>
      </div>
    </div>
  );
}
