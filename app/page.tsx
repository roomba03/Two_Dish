import Link from "next/link";
import { Suspense } from "react";
import { getDefaultKitchen } from "@/lib/data/menu";
import { getCustomerFromCookie } from "@/lib/data/account";
import DeliveryZoneChecker from "@/app/components/DeliveryZoneChecker";
import { VegetableIcon } from "@/app/components/icons/DishIcons";
import PageGlow from "@/app/components/PageGlow";
import PanLoader from "@/app/components/PanLoader";
import HomeNav from "@/app/components/HomeNav";
import UpcomingDaysPreview, {
  UpcomingDaysPreviewSkeleton,
} from "@/app/components/UpcomingDaysPreview";

// ── Arrow icon ────────────────────────────────────────────────────────────────

function ArrowRight() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
      <path
        d="M2 7.5h11M9 3.5l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const steps = [
  {
    num: "01",
    title: "Check the menu",
    body: "Browse the 7-day schedule. Each date carries exactly one dish — made fresh, nothing frozen, nothing repeated.",
  },
  {
    num: "02",
    title: "Order by 11:59 PM",
    body: "Place your order before midnight the night before. That's your window. We plan every ingredient to the exact headcount.",
  },
  {
    num: "03",
    title: "Delivered warm",
    body: "Pick your evening slot — 6:30 or 7:30 PM. We bring it straight to your door, ready to serve at the table.",
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const kitchen = await getDefaultKitchen();
  const profile = await getCustomerFromCookie();

  return (
    <div className="relative isolate flex flex-col bg-sage text-deep-leaf">
      {/* Ambient glow that eases toward the cursor, see PageGlow.tsx and
          .tfb-page-glow in globals.css. Negative z-index keeps it above the
          page's own bg-sage but below every section, which are all
          normal-flow (non-positioned) and so paint on top of it. */}
      <PageGlow />

      {/* ── NAV ─────────────────────────────────────────────────────── */}
      <HomeNav profileName={profile?.name ?? null} />

      <main className="flex flex-col">
        {/* ── WHAT WE OFFER ──────────────────────────────────────────── */}
        <section>
          <div className="mx-auto max-w-3xl px-6 py-20 text-center">
            <div className="mb-2 flex h-[147px] items-center justify-center overflow-hidden sm:h-[184px] md:h-[207px]">
              <PanLoader repeat />
            </div>
            <h1 className="mb-5 text-5xl leading-tight sm:text-6xl">
              Two Dish Catering Services
            </h1>
            <p className="mb-4 text-base leading-relaxed text-warmgray">
              Two Dish is a small catering kitchen built around Hyderabadi
              cuisine. Rather than a sprawling menu, we plan a weekly schedule
              around a single dish each day and cook it fresh in small batches
              to match that day&apos;s orders. Nothing frozen, nothing
              repeated, every order made to match the day&apos;s demand.
            </p>
            <p className="mb-8 text-base leading-relaxed text-warmgray">
              Place your order by 11:59 PM the night before and pick your
              evening slot, 6:30 or 7:30 PM. We&apos;ll bring it straight to
              your door, ready to serve at the table.
            </p>
            <Link
              href="/menu"
              className="tfb-shadow-btn inline-flex items-center gap-2.5 rounded-lg bg-terracotta px-8 py-4 text-sm font-medium text-sage transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
            >
              View this week&apos;s menu
              <ArrowRight />
            </Link>
          </div>
        </section>

        {/* ── DELIVERY ZONE CHECKER ───────────────────────────────────── */}
        <DeliveryZoneChecker
          zone={kitchen?.delivery_zone ?? null}
          activeZips={kitchen?.active_zips ?? []}
        />

        {/* ── UPCOMING DAYS PREVIEW ──────────────────────────────────────── */}
        <section>
          <div className="mx-auto max-w-7xl px-6 py-20">
            <p className="tfb-eyebrow mb-8">Coming up</p>
            <Suspense fallback={<UpcomingDaysPreviewSkeleton />}>
              <UpcomingDaysPreview />
            </Suspense>

            {/* CTA row */}
            <div className="mt-10 flex w-full flex-wrap items-center justify-center gap-3.5">
              <Link
                href="/menu"
                className="tfb-shadow-btn inline-flex items-center gap-2.5 rounded-lg bg-terracotta px-8 py-4 text-sm font-medium text-sage transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
              >
                View this week&apos;s menu
                <ArrowRight />
              </Link>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ────────────────────────────────────────────── */}
        <section>
          <div className="mx-auto max-w-7xl px-6 py-20">
            <p className="tfb-eyebrow mb-8">The process</p>

            <div className="tfb-shadow-card tfb-process-grid grid grid-cols-1 gap-px rounded-lg border border-herb bg-herb sm:grid-cols-3">
              {steps.map((step) => (
                <div
                  key={step.num}
                  className="tfb-process-card flex flex-col gap-8 bg-sage p-11"
                >
                  <span className="font-heading text-5xl text-terracotta/50">
                    {step.num}
                  </span>
                  <div>
                    <h3 className="mb-3.5 text-2xl leading-tight text-deep-leaf">
                      {step.title}
                    </h3>
                    <p className="text-base leading-relaxed text-warmgray">
                      {step.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ───────────────────────────────────────────────── */}
        <section className="px-6 py-20 text-center">
          <h2 className="mx-auto mb-10 max-w-[16ch] text-5xl leading-none text-deep-leaf sm:text-6xl">
            See what&apos;s cooking this week.
          </h2>

          <Link
            href="/menu"
            className="tfb-shadow-btn inline-flex items-center gap-2.5 rounded-lg bg-terracotta px-8 py-4 text-sm font-medium text-sage transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
          >
            View the full menu
            <ArrowRight />
          </Link>
        </section>
      </main>

      {/* ── FOOTER ──────────────────────────────────────────────────── */}
      <footer>
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-7">
          <span className="font-heading text-base text-warmgray">Two Dish</span>
          <VegetableIcon className="h-5 w-5 text-terracotta" aria-hidden />
        </div>
      </footer>
    </div>
  );
}
