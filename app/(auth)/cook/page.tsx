import { getProductionRun } from "@/lib/data/cook";
import ProductionBoard from "./components/ProductionBoard";

const KITCHEN_TZ = "America/Chicago";

function getKitchenToday(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: KITCHEN_TZ }).format(
    new Date()
  );
}

export default async function CookPage() {
  const today = getKitchenToday();
  const run = await getProductionRun(today);

  return <ProductionBoard run={run} />;
}
