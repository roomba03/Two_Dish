import DishImage from "./DishImage";
import { CalendarIcon } from "./icons/DishIcons";
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
    <div className="relative">
      <DishImage src={imageUrl} alt={dishName} className="rounded-none" />
      {closed && (
        <div className="absolute inset-0 flex items-center justify-center bg-warmgray/40">
          <span className="rounded-md border border-warmgray/50 bg-sage px-3 py-1 text-sm text-warmgray">
            Orders closed
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
    <div className="flex flex-col overflow-hidden rounded-lg border border-herb/25 bg-sage">
      <div className="flex aspect-[4/3] w-full items-center justify-center bg-midsage">
        <CalendarIcon className="h-10 w-10 text-herb" aria-hidden />
      </div>
      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium text-deep-leaf">{label}</span>
          <span className="text-xs text-warmgray">{shortDate}</span>
        </div>
        <p className="text-sm text-herb">No meal scheduled</p>
      </div>
    </div>
  );
}

type CheckedAddress = {
  street?: string;
  city?: string;
  zip?: string;
};

async function DayCard({
  dateStr,
  todayStr,
  schedule,
  address,
}: {
  dateStr: string;
  todayStr: string;
  schedule: ScheduleRow | null;
  address?: CheckedAddress;
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
    <article className="flex flex-col overflow-hidden rounded-lg border border-herb/25 bg-sage">
      <DishImageArea
        imageUrl={item.image_url}
        dishName={item.name}
        closed={closed}
      />

      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* Day header */}
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium text-deep-leaf">{label}</span>
          <span className="text-xs text-warmgray">{shortDate}</span>
        </div>

        {/* Dish info */}
        <div className="flex flex-col gap-1">
          <h3 className="text-lg leading-tight text-deep-leaf">{item.name}</h3>
          <p className="line-clamp-2 text-sm leading-relaxed text-herb">
            {item.description}
          </p>
        </div>

        {/* Price + CTA */}
        <div className="mt-auto flex flex-col gap-3 border-t border-herb/20 pt-3">
          <span className="text-base font-medium text-terracotta">
            ${Number(item.price).toFixed(2)}{" "}
            <span className="text-xs font-normal text-warmgray">/ meal</span>
          </span>

          {closed ? (
            <div className="w-full rounded-md border border-warmgray/40 py-3 text-center text-sm text-warmgray">
              Orders closed
            </div>
          ) : soldOut ? (
            <div className="w-full rounded-md border border-warmgray/40 py-3 text-center text-sm text-warmgray">
              Sold out
            </div>
          ) : (
            <AddToCartButton
              scheduleId={schedule.id}
              menuItemId={item.id}
              kitchenId={schedule.kitchen_id}
              dishName={item.name}
              price={Number(item.price)}
              deliveryDate={dateStr}
              street={address?.street}
              city={address?.city}
              zip={address?.zip}
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
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 7 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse overflow-hidden rounded-lg border border-herb/25 bg-sage"
        >
          <div className="aspect-[4/3] bg-midsage" />
          <div className="flex flex-col gap-3 p-4">
            <div className="h-3 w-24 rounded-md bg-midsage" />
            <div className="h-4 w-36 rounded-md bg-midsage" />
            <div className="h-3 w-full rounded-md bg-midsage/70" />
            <div className="h-3 w-3/4 rounded-md bg-midsage/70" />
            <div className="mt-2 h-10 w-full rounded-md bg-midsage" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default async function WeeklyMenuGrid({
  address,
}: {
  address?: CheckedAddress;
} = {}) {
  const kitchen = await getDefaultKitchen();

  if (!kitchen) {
    return (
      <p className="py-12 text-center text-herb">
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
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {dates.map((date) => (
        <DayCard
          key={date}
          dateStr={date}
          todayStr={todayStr}
          schedule={scheduleByDate.get(date) ?? null}
          address={address}
        />
      ))}
    </div>
  );
}
