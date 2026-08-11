import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { getDefaultKitchen, getWeekMenuSchedule } from "@/lib/data/menu";
import { checkDeliveryDateEligibility } from "@/lib/actions/checkoutActions";
import { getCustomerFromCookie } from "@/lib/data/account";
import DeliveryZoneChecker from "@/app/components/DeliveryZoneChecker";
import TomorrowDishSpotlight from "@/app/components/TomorrowDishSpotlight";
import { VegetableIcon } from "@/app/components/icons/DishIcons";
import IntroSplash from "@/app/components/IntroSplash";
import HomeNav from "@/app/components/HomeNav";
import UpcomingDaysPreview, {
  UpcomingDaysPreviewSkeleton,
} from "@/app/components/UpcomingDaysPreview";

const KITCHEN_TZ = "America/Chicago";

function getTomorrowDateStr(): string {
  const todayStr = new Intl.DateTimeFormat("en-CA", {
    timeZone: KITCHEN_TZ,
  }).format(new Date());
  const [y, m, d] = todayStr.split("-").map(Number);
  return new Intl.DateTimeFormat("en-CA").format(new Date(y, m - 1, d + 1));
}

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
    highlight: false,
  },
  {
    num: "02",
    title: "Order by 11:59 PM",
    body: "Place your order before midnight the night before. That's your window. We plan every ingredient to the exact headcount.",
    highlight: true,
  },
  {
    num: "03",
    title: "Delivered warm",
    body: "Pick your evening slot — 6:30 or 7:30 PM. We bring it straight to your door, ready to serve at the table.",
    highlight: false,
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const kitchen = await getDefaultKitchen();
  const profile = await getCustomerFromCookie();

  const tomorrowStr = getTomorrowDateStr();
  const tomorrowSchedule = kitchen
    ? (
        await getWeekMenuSchedule(kitchen.id, tomorrowStr, tomorrowStr)
      )[0] ?? null
    : null;
  const tomorrowEligibility = tomorrowSchedule
    ? await checkDeliveryDateEligibility(tomorrowStr)
    : null;

  return (
    <div className="bg-sage text-deep-leaf">
      <IntroSplash />

      {/* ── NAV ─────────────────────────────────────────────────────── */}
      <HomeNav profileName={profile?.name ?? null} />

      {/* ── HERO ────────────────────────────────────────────────────── */}
      <section className="relative h-[calc(100vh-4rem)] w-full overflow-hidden">
        <Image
          src="/dish-images/TACOS.png"
          alt="Tacos"
          fill
          priority
          quality={100}
          sizes="100vw"
          className="object-cover"
        />
      </section>

      {/* ── WHAT WE OFFER ──────────────────────────────────────────── */}
      <section className="border-t border-herb">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-12 px-6 py-20 md:grid-cols-2">
          <div>
            <p className="tfb-eyebrow mb-4">What we offer</p>
            <h2 className="mb-5 text-4xl leading-tight text-deep-leaf">
              Home-cooked Hyderabadi food, delivered to your door
            </h2>
            <p className="mb-4 text-base leading-relaxed text-warmgray">
              Two Dish brings Chef Eram&apos;s family recipes straight from
              her kitchen to yours. Every day we cook exactly one dish —
              biryani, haleem, kebabs, and more — in small batches, nothing
              frozen and nothing repeated.
            </p>
            <p className="mb-8 text-base leading-relaxed text-warmgray">
              Place your order by 11:59 PM the night before and pick your
              evening slot, 6:30 or 7:30 PM. We&apos;ll bring it straight to
              your door, ready to serve at the table.
            </p>
            <Link
              href="/menu"
              className="inline-flex items-center gap-2.5 rounded-lg bg-terracotta px-8 py-4 text-sm font-medium text-sage transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
            >
              View this week&apos;s menu
              <ArrowRight />
            </Link>
          </div>

          <DeliveryZoneChecker
            zone={kitchen?.delivery_zone ?? null}
            activeZips={kitchen?.active_zips ?? []}
            variant="embedded"
          />
        </div>
      </section>

      {/* Being redone — old hero disabled below, not deleted.
      <section className="mx-auto flex min-h-[80vh] w-full max-w-7xl flex-col justify-center px-6 py-8">
        <div className="flex flex-col items-center text-center">
          {tomorrowSchedule ? (
            <div className="tfb-rise tfb-delay-3 w-full flex-shrink-0">
              <TomorrowDishSpotlight
                scheduleId={tomorrowSchedule.id}
                menuItemId={tomorrowSchedule.menu_items.id}
                kitchenId={tomorrowSchedule.kitchen_id}
                dishName={tomorrowSchedule.menu_items.name}
                description={tomorrowSchedule.menu_items.description}
                price={Number(tomorrowSchedule.menu_items.price)}
                deliveryDate={tomorrowStr}
                imageUrl={tomorrowSchedule.menu_items.image_url}
                soldOut={
                  tomorrowSchedule.orders_count >= tomorrowSchedule.max_capacity
                }
                closed={!(tomorrowEligibility?.eligible ?? false)}
              />
            </div>
          ) : (
            <div className="tfb-rise tfb-delay-3 w-full flex-shrink-0">
              <div className="relative ml-[calc(50%-50vw)] mr-[calc(50%-50vw)] w-screen overflow-hidden">
                <div className="flex aspect-[3/1] w-full items-center justify-center bg-deep-leaf/10 shadow-inner">
                  <span className="text-sm font-medium text-warmgray">
                    Nothing scheduled for now
                  </span>
                </div>
              </div>
            </div>
          )}

          Tagline
          <p className="tfb-rise tfb-delay-3 mb-12 max-w-[36ch] text-lg leading-relaxed text-warmgray">
            No long lines. No long drives.
            <br />
            Order the dish a day ahead and enjoy it
            <br className="hidden sm:block" />
            in the comfort of your home.
          </p>
        </div>
      </section>
      */}

      {/* ── UPCOMING DAYS PREVIEW ──────────────────────────────────────── */}
      <section className="border-t border-herb">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <p className="tfb-eyebrow mb-8">Coming up</p>
          <Suspense fallback={<UpcomingDaysPreviewSkeleton />}>
            <UpcomingDaysPreview />
          </Suspense>

          {/* CTA row */}
          <div className="mt-10 flex w-full flex-wrap items-center justify-center gap-3.5">
            <Link
              href="/menu"
              className="inline-flex items-center gap-2.5 rounded-lg bg-terracotta px-8 py-4 text-sm font-medium text-sage transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
            >
              View this week&apos;s menu
              <ArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* ── DELIVERY ZONE CHECKER ───────────────────────────────────── */}
      <DeliveryZoneChecker
        zone={kitchen?.delivery_zone ?? null}
        activeZips={kitchen?.active_zips ?? []}
      />

      {/* ── HOW IT WORKS ────────────────────────────────────────────── */}
      <section className="border-t border-herb">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <p className="tfb-eyebrow mb-8">The process</p>

          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-herb bg-herb sm:grid-cols-3">
            {steps.map((step) => (
              <div
                key={step.num}
                className={`flex flex-col gap-8 p-11 ${
                  step.highlight ? "bg-midsage/40" : "bg-sage"
                }`}
              >
                <span className="font-heading text-5xl text-terracotta/40">
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
      <section className="border-t border-herb px-6 py-20 text-center">
        <p className="tfb-eyebrow mb-5">Ready to eat well?</p>

        <h2 className="mx-auto mb-10 max-w-[16ch] text-5xl leading-none text-deep-leaf sm:text-6xl">
          See what&apos;s cooking this week.
        </h2>

        <Link
          href="/menu"
          className="inline-flex items-center gap-2.5 rounded-lg bg-terracotta px-9 py-4.5 text-sm font-medium text-sage transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
        >
          View the full menu
          <ArrowRight />
        </Link>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────── */}
      <footer className="border-t border-herb">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-7">
          <span className="font-heading text-base text-warmgray">Two Dish</span>
          <VegetableIcon className="h-5 w-5 text-terracotta" aria-hidden />
        </div>
      </footer>
    </div>
  );
}
