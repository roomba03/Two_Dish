import Link from "next/link";
import DishImage from "./DishImage";
import { CalendarIcon } from "./icons/DishIcons";
import AddToCartHoverButton from "./AddToCartHoverButton";
import { getDefaultKitchen, getWeekMenuSchedule } from "@/lib/data/menu";
import type { ScheduleRow } from "@/lib/data/menu";
import { checkDeliveryDateEligibility } from "@/lib/actions/checkoutActions";

const KITCHEN_TZ = "America/Chicago";

function buildUpcomingDates(): string[] {
  const todayStr = new Intl.DateTimeFormat("en-CA", {
    timeZone: KITCHEN_TZ,
  }).format(new Date());
  const [y, m, d] = todayStr.split("-").map(Number);
  // Tomorrow through the following two days — 3 cards total.
  return Array.from({ length: 3 }, (_, i) =>
    new Intl.DateTimeFormat("en-CA").format(new Date(y, m - 1, d + 1 + i))
  );
}

function getDayLabel(dateStr: string): { weekday: string; shortDate: string } {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return {
    weekday: new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(date),
    shortDate: new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(date),
  };
}

async function DayPreviewCard({
  dateStr,
  schedule,
}: {
  dateStr: string;
  schedule: ScheduleRow | null;
}) {
  const { weekday, shortDate } = getDayLabel(dateStr);

  if (!schedule) {
    return (
      <Link
        href="/menu"
        className="flex flex-col overflow-hidden rounded-lg border border-herb bg-sage transition-opacity hover:opacity-90"
      >
        <div className="flex aspect-[4/3] w-full items-center justify-center bg-midsage">
          <CalendarIcon className="h-9 w-9 text-terracotta" aria-hidden />
        </div>
        <div className="flex flex-col gap-1 p-4">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-medium text-deep-leaf">{weekday}</span>
            <span className="text-xs text-warmgray">{shortDate}</span>
          </div>
          <p className="text-sm text-warmgray">No meal scheduled</p>
        </div>
      </Link>
    );
  }

  const item = schedule.menu_items;
  const remaining = schedule.max_capacity - schedule.orders_count;
  const soldOut = remaining <= 0;
  const eligibility = await checkDeliveryDateEligibility(dateStr);
  const closed = !eligibility.eligible;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border border-herb bg-sage transition-opacity hover:opacity-90">
      {/* Stretched link: fills the card so clicking anywhere navigates to
          the menu, except where the hover button below re-enables its own
          pointer events over the image. */}
      <Link href="/menu" aria-label={`View ${item.name} on the menu`} className="absolute inset-0" />
      <div className="pointer-events-none flex flex-1 flex-col">
        <div className="relative">
          <DishImage
            src={item.image_url}
            alt={item.name}
            className="aspect-[4/3] rounded-none"
          />
          {(soldOut || closed) && (
            <div className="absolute inset-0 flex items-center justify-center bg-warmgray/40">
              <span className="rounded-md border border-warmgray/50 bg-sage px-3 py-1 text-sm text-warmgray">
                {closed ? "Orders closed" : "Sold out"}
              </span>
            </div>
          )}
          {!soldOut && !closed && (
            <AddToCartHoverButton
              scheduleId={schedule.id}
              menuItemId={item.id}
              kitchenId={schedule.kitchen_id}
              dishName={item.name}
              price={Number(item.price)}
              deliveryDate={dateStr}
            />
          )}
        </div>
        <div className="flex flex-col gap-1.5 p-4">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-medium text-deep-leaf">{weekday}</span>
            <span className="text-xs text-warmgray">{shortDate}</span>
          </div>
          <h3 className="text-base leading-tight text-deep-leaf">{item.name}</h3>
          <span className="text-sm font-medium text-terracotta">
            ${Number(item.price).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function UpcomingDaysPreviewSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse overflow-hidden rounded-lg border border-herb bg-sage"
        >
          <div className="aspect-[4/3] bg-midsage" />
          <div className="flex flex-col gap-2 p-4">
            <div className="h-3 w-24 rounded-md bg-midsage" />
            <div className="h-4 w-36 rounded-md bg-midsage" />
            <div className="h-3 w-16 rounded-md bg-midsage/70" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function UpcomingDaysPreview() {
  const kitchen = await getDefaultKitchen();
  const dates = buildUpcomingDates();

  if (!kitchen) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {dates.map((date) => (
          <DayPreviewCard key={date} dateStr={date} schedule={null} />
        ))}
      </div>
    );
  }

  const scheduleRows = await getWeekMenuSchedule(
    kitchen.id,
    dates[0],
    dates[dates.length - 1]
  );
  const scheduleByDate = new Map(
    scheduleRows.map((row) => [row.delivery_date, row])
  );

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
      {dates.map((date) => (
        <DayPreviewCard
          key={date}
          dateStr={date}
          schedule={scheduleByDate.get(date) ?? null}
        />
      ))}
    </div>
  );
}
