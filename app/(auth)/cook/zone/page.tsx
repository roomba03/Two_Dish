import { getDefaultKitchen } from "@/lib/data/menu";
import ZoneEditor from "./components/ZoneEditor";

export default async function ZonePage() {
  const kitchen = await getDefaultKitchen();

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="tfb-eyebrow">Partner dashboard</p>
        <h1 className="mt-1 text-2xl text-deep-leaf">Delivery zone</h1>
        <p className="mt-2 text-sm text-herb">
          Click the map to draw your delivery boundary. Orders outside this area
          will be rejected at checkout.{" "}
          {!kitchen?.delivery_zone && (
            <span className="font-medium text-terracotta">
              No zone set — currently using ZIP code validation.
            </span>
          )}
        </p>
      </div>

      <ZoneEditor existingZone={kitchen?.delivery_zone ?? null} />
    </main>
  );
}
