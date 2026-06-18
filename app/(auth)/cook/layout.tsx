import { cookies } from "next/headers";
import DashboardNav from "./components/DashboardNav";

export const metadata = {
  title: "Kitchen Dashboard — Two Dish",
};

export default async function CookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const hasSession = cookieStore.has("cook-session");

  // Login page: render bare — no nav shell.
  if (!hasSession) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <div className="min-h-screen">
      <DashboardNav />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
