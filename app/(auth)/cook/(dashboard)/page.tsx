import { getProductionRunRange } from "@/lib/data/cook";
import ProductionBoard from "./components/ProductionBoard";

const KITCHEN_TZ = "America/Chicago";
// Fetched once and sliced client-side by the range filter (today / 3 / 5 /
// week / all). 180 days comfortably covers "all remaining days with orders"
// without querying an unbounded date range.
const HORIZON_DAYS = 180;

function getKitchenToday(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: KITCHEN_TZ }).format(
    new Date()
  );
}

function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Intl.DateTimeFormat("en-CA").format(new Date(y, m - 1, d + days));
}

export default async function CookPage() {
  const today = getKitchenToday();
  const horizonEnd = addDays(today, HORIZON_DAYS - 1);
  const run = await getProductionRunRange(today, horizonEnd);

  return <ProductionBoard run={run} today={today} />;
}
