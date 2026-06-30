import { getDefaultKitchen } from "@/lib/data/menu";
import ZoneEditor from "./components/ZoneEditor";

export default async function ZonePage() {
  const kitchen = await getDefaultKitchen();

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="font-mono text-xs font-semibold uppercase tracking-widest text-neutral-400">
          Partner Dashboard
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900">
          Delivery Zone
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Click the map to draw your delivery boundary. Orders outside this area
          will be rejected at checkout.{" "}
          {!kitchen?.delivery_zone && (
            <span className="font-medium text-amber-600">
              No zone set — currently using ZIP code validation.
            </span>
          )}
        </p>
      </div>

      <ZoneEditor existingZone={kitchen?.delivery_zone ?? null} />
    </main>
  );
}
