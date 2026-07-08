import Link from "next/link";
import { getDefaultKitchen, getWeekMenuSchedule } from "@/lib/data/menu";
import { checkDeliveryDateEligibility } from "@/lib/actions/checkoutActions";
import DeliveryZoneChecker from "@/app/components/DeliveryZoneChecker";
import TomorrowDishSpotlight from "@/app/components/TomorrowDishSpotlight";
import { VegetableIcon } from "@/app/components/icons/DishIcons";

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
      {/* ── NAV ─────────────────────────────────────────────────────── */}
      <nav className="tfb-rise sticky top-0 z-50 border-b border-herb/20 bg-sage/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <span className="font-heading text-xl text-deep-leaf">Two Dish</span>

          <div className="flex items-center gap-7">
            <Link
              href="/cook/login"
              className="text-sm font-medium text-herb transition-opacity hover:opacity-70"
            >
              Staff login
            </Link>
            <Link
              href="/account/signup"
              className="text-sm font-medium text-herb transition-opacity hover:opacity-70"
            >
              Sign up
            </Link>
            <Link
              href="/menu"
              className="rounded-lg border border-herb/40 px-5 py-2 text-sm font-medium text-herb transition-opacity hover:opacity-70"
            >
              Order now
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-7xl px-6 pt-8 pb-24">
        <div className="flex flex-col items-center text-center">
          {tomorrowSchedule && (
            <div className="tfb-rise tfb-delay-3 mb-12 w-full">
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
          )}

          {/* Tagline */}
          <p className="tfb-rise tfb-delay-3 mb-12 max-w-[36ch] text-lg leading-relaxed text-herb">
            No long lines. No long drives.
            <br />
            Just order the dish a day ahead and enjoy it
            <br className="hidden sm:block" />
            with friends and family in the comfort of your home.
          </p>

          {/* CTA row */}
          <div className="tfb-rise tfb-delay-4 flex flex-wrap items-center justify-center gap-3.5">
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
      <section className="border-t border-herb/20">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <p className="tfb-eyebrow mb-14">The process</p>

          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-herb/20 bg-herb/20 sm:grid-cols-3">
            {steps.map((step) => (
              <div
                key={step.num}
                className={`flex flex-col gap-8 p-11 ${
                  step.highlight ? "bg-midsage/40" : "bg-sage"
                }`}
              >
                <span className="font-heading text-5xl text-herb/50">
                  {step.num}
                </span>
                <div>
                  <h3 className="mb-3.5 text-2xl leading-tight text-deep-leaf">
                    {step.title}
                  </h3>
                  <p className="text-base leading-relaxed text-herb">
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ───────────────────────────────────────────────── */}
      <section className="border-t border-herb/20 px-6 py-32 text-center">
        <p className="tfb-eyebrow mb-5">Ready to eat well?</p>

        <h2 className="mx-auto mb-12 max-w-[16ch] text-5xl leading-none text-deep-leaf sm:text-6xl">
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
      <footer className="border-t border-herb/20">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-7">
          <span className="font-heading text-base text-herb">Two Dish</span>
          <VegetableIcon className="h-5 w-5 text-herb" aria-hidden />
        </div>
      </footer>
    </div>
  );
}
