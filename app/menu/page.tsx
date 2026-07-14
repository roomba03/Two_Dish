import Link from "next/link";
import { Suspense } from "react";
import WeeklyMenuGrid, {
  WeeklyMenuGridSkeleton,
} from "@/app/components/WeeklyMenuGrid";
import CartIcon from "@/app/components/CartIcon";
import AuthStatusLink from "@/app/components/AuthStatusLink";
import { getCustomerFromCookie } from "@/lib/data/account";

export default async function MenuPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const street = typeof params.street === "string" ? params.street : undefined;
  const city = typeof params.city === "string" ? params.city : undefined;
  const zip = typeof params.zip === "string" ? params.zip : undefined;
  const address = street || city || zip ? { street, city, zip } : undefined;
  const profile = await getCustomerFromCookie();

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-warmgray transition-opacity hover:opacity-70"
            >
              ← Back to home
            </Link>
            {profile && <AuthStatusLink name={profile.name} />}
          </div>
          <CartIcon />
        </div>
        <h1 className="text-3xl text-deep-leaf">This week&apos;s menu</h1>
        <p className="mt-2 text-warmgray">
          One fresh dish each day, delivered to your door. Each order is for a
          single delivery date — place a separate order for each day you want.
          Order by 11:59 PM the night before.
        </p>
      </div>

      <Suspense fallback={<WeeklyMenuGridSkeleton />}>
        <WeeklyMenuGrid address={address} />
      </Suspense>
    </main>
  );
}
