import Link from "next/link";
import { Suspense } from "react";
import WeeklyMenuGrid, {
  WeeklyMenuGridSkeleton,
} from "@/app/components/WeeklyMenuGrid";

export default function MenuPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-neutral-500 transition-colors hover:text-neutral-900"
        >
          ← Back to home
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
          This Week&apos;s Menu
        </h1>
        <p className="mt-2 text-neutral-500">
          One fresh dish each day, delivered to your door. Each order is for a
          single delivery date — place a separate order for each day you want.
          Order by 11:59 PM the night before.
        </p>
      </div>

      <Suspense fallback={<WeeklyMenuGridSkeleton />}>
        <WeeklyMenuGrid />
      </Suspense>
    </main>
  );
}
