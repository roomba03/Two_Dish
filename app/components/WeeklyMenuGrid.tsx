import DishImage from "./DishImage";
import { checkDeliveryDateEligibility } from "@/lib/actions/checkoutActions";
import { getDefaultKitchen, getWeekMenuSchedule } from "@/lib/data/menu";
import type { ScheduleRow } from "@/lib/data/menu";
import AddToCartButton from "./AddToCartButton";

// ── Date helpers ──────────────────────────────────────────────────────────────

const KITCHEN_TZ = "America/Chicago";

function buildDateRange(): string[] {
  const todayStr = new Intl.DateTimeFormat("en-CA", {
    timeZone: KITCHEN_TZ,
  }).format(new Date());
  const [y, m, d] = todayStr.split("-").map(Number);
  return Array.from({ length: 7 }, (_, i) =>
    new Intl.DateTimeFormat("en-CA").format(new Date(y, m - 1, d + i))
  );
}

function getDayMeta(
  dateStr: string,
  todayStr: string
): { label: string; shortDate: string } {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const weekday = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
  }).format(date);
  const shortDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);

  const [ty, tm, td] = todayStr.split("-").map(Number);
  const tomorrowStr = new Intl.DateTimeFormat("en-CA").format(
    new Date(ty, tm - 1, td + 1)
  );

  const label =
    dateStr === todayStr
      ? "Today"
      : dateStr === tomorrowStr
        ? "Tomorrow"
        : weekday;

  return { label, shortDate };
}

// ── Sub-components ────────────────────────────────────────────────────────────

function DishImageArea({
  imageUrl,
  dishName,
  closed,
}: {
  imageUrl: string | null;
  dishName: string;
  closed: boolean;
}) {
  return (
    <div className="relative aspect-[4/3] overflow-hidden bg-amber-50">
      {imageUrl ? (
        <DishImage src={imageUrl} alt={dishName} />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
          <span className="text-4xl">🍽️</span>
        </div>
      )}
      {closed && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-widest text-neutral-600">
            Orders Closed
          </span>
        </div>
      )}
    </div>
  );
}

function NoMenuCard({
  label,
  shortDate,
}: {
  label: string;
  shortDate: string;
}) {
  return (
    <div className="flex min-w-[260px] flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 lg:min-w-0">
      <div className="relative aspect-[4/3] bg-neutral-100">
        <div className="flex h-full items-center justify-center">
          <span className="text-3xl opacity-30">📅</span>
        </div>
      </div>
      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-neutral-900">{label}</span>
          <span className="text-xs text-neutral-400">{shortDate}</span>
        </div>
        <p className="text-sm text-neutral-400">No meal scheduled</p>
      </div>
    </div>
  );
}

async function DayCard({
  dateStr,
  todayStr,
  schedule,
}: {
  dateStr: string;
  todayStr: string;
  schedule: ScheduleRow | null;
}) {
  const { label, shortDate } = getDayMeta(dateStr, todayStr);

  if (!schedule) {
    return <NoMenuCard label={label} shortDate={shortDate} />;
  }

  const eligibility = await checkDeliveryDateEligibility(dateStr);
  const closed = !eligibility.eligible;
  const soldOut = schedule.orders_count >= schedule.max_capacity;
  const item = schedule.menu_items;

  return (
    <article className="flex min-w-[260px] flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md lg:min-w-0">
      <DishImageArea
        imageUrl={item.image_url}
        dishName={item.name}
        closed={closed}
      />

      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* Day header */}
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-neutral-900">{label}</span>
          <span className="text-xs text-neutral-400">{shortDate}</span>
        </div>

        {/* Dish info */}
        <div className="flex flex-col gap-1">
          <h3 className="text-base font-bold leading-tight text-neutral-900">
            {item.name}
          </h3>
          <p className="line-clamp-2 text-sm leading-relaxed text-neutral-500">
            {item.description}
          </p>
        </div>

        {/* Price + CTA */}
        <div className="mt-auto flex flex-col gap-3 border-t border-neutral-100 pt-3">
          <span className="text-base font-semibold text-neutral-800">
            ${Number(item.price).toFixed(2)}{" "}
            <span className="text-xs font-normal text-neutral-400">/ meal</span>
          </span>

          {closed ? (
            <div className="w-full rounded-xl bg-neutral-100 py-3 text-center text-xs font-bold uppercase tracking-widest text-neutral-400">
              Orders Closed
            </div>
          ) : soldOut ? (
            <div className="w-full rounded-xl bg-red-50 py-3 text-center text-xs font-bold uppercase tracking-widest text-red-400">
              Sold Out
            </div>
          ) : (
            <AddToCartButton
              scheduleId={schedule.id}
              menuItemId={item.id}
              kitchenId={schedule.kitchen_id}
              dishName={item.name}
              price={Number(item.price)}
              deliveryDate={dateStr}
            />
          )}
        </div>
      </div>
    </article>
  );
}

// ── Skeleton (for Suspense fallback) ─────────────────────────────────────────

export function WeeklyMenuGridSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 lg:grid lg:grid-cols-4 lg:overflow-visible xl:grid-cols-7">
      {Array.from({ length: 7 }).map((_, i) => (
        <div
          key={i}
          className="min-w-[260px] animate-pulse overflow-hidden rounded-2xl border border-neutral-200 bg-white lg:min-w-0"
        >
          <div className="aspect-[4/3] bg-neutral-200" />
          <div className="flex flex-col gap-3 p-4">
            <div className="h-3 w-24 rounded bg-neutral-200" />
            <div className="h-4 w-36 rounded bg-neutral-200" />
            <div className="h-3 w-full rounded bg-neutral-100" />
            <div className="h-3 w-3/4 rounded bg-neutral-100" />
            <div className="mt-2 h-10 w-full rounded-xl bg-neutral-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default async function WeeklyMenuGrid() {
  const kitchen = await getDefaultKitchen();

  if (!kitchen) {
    return (
      <p className="py-12 text-center text-neutral-500">
        Menu temporarily unavailable. Please check back soon.
      </p>
    );
  }

  const dates = buildDateRange();
  const todayStr = dates[0];
  const endDate = dates[dates.length - 1];

  const scheduleRows = await getWeekMenuSchedule(kitchen.id, todayStr, endDate);
  const scheduleByDate = new Map(
    scheduleRows.map((row) => [row.delivery_date, row])
  );

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 lg:grid lg:grid-cols-4 lg:overflow-visible xl:grid-cols-7">
      {dates.map((date) => (
        <DayCard
          key={date}
          dateStr={date}
          todayStr={todayStr}
          schedule={scheduleByDate.get(date) ?? null}
        />
      ))}
    </div>
  );
}
