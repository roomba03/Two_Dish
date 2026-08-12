import HomeNav from "@/app/components/HomeNav";
import LoginForm from "./LoginForm";

export default function CookLoginPage() {
  return (
    <div className="min-h-screen">
      <HomeNav profileName={null} showAuthLinks={false} />

      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <h1 className="text-2xl text-deep-leaf">Kitchen staff login</h1>
            <p className="mt-1 text-sm text-warmgray">
              For family kitchen members only
            </p>
          </div>

          <div className="tfb-card p-8">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
