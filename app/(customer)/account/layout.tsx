import { cookies } from "next/headers";
import AccountNav from "./components/AccountNav";

export const metadata = {
  title: "My Account — Two Dish",
};

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const hasSession = cookieStore.has("customer-session");

  // Login / signup pages: bare layout, no nav.
  if (!hasSession) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <div className="min-h-screen">
      <AccountNav />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
