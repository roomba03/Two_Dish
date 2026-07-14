import { getIngredientList } from "@/lib/data/cook";
import type { IngredientLine } from "@/lib/data/cook";

const KITCHEN_TZ = "America/Chicago";

function getKitchenDate(offset: number): string {
  const todayStr = new Intl.DateTimeFormat("en-CA", {
    timeZone: KITCHEN_TZ,
  }).format(new Date());
  const [y, m, d] = todayStr.split("-").map(Number);
  return new Intl.DateTimeFormat("en-CA").format(new Date(y, m - 1, d + offset));
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date(y, m - 1, d));
}

function formatQty(n: number): string {
  return n % 1 === 0 ? n.toFixed(0) : n.toFixed(2);
}

export default async function IngredientsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date: queryDate } = await searchParams;
  const tomorrow = getKitchenDate(1);
  const date = queryDate ?? tomorrow;

  const ingredients: IngredientLine[] = await getIngredientList(date);

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ────────────────────────────────────────────────── */}
      <div>
        <p className="tfb-eyebrow">Ingredient calculator</p>
        <h1 className="mt-1 text-2xl text-deep-leaf">{formatDate(date)}</h1>
      </div>

      {/* ── Date selector ──────────────────────────────────────────── */}
      <form className="flex items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="tfb-eyebrow">Delivery date</label>
          <input
            type="date"
            name="date"
            defaultValue={date}
            className="tfb-input"
          />
        </div>
        <button type="submit" className="tfb-btn-primary w-auto">
          Calculate
        </button>
      </form>

      {/* ── Grocery list ────────────────────────────────────────────── */}
      <div className="tfb-card">
        <div className="border-b border-herb px-6 py-4">
          <p className="tfb-eyebrow">Grocery list</p>
        </div>

        {ingredients.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-sm font-medium text-warmgray">
              No orders locked for this date yet.
            </p>
            <p className="mt-1 text-xs text-warmgray">
              Orders close at 11:59 PM the night before — check back then for the
              final totals.
            </p>
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-herb">
                  <th className="tfb-eyebrow px-6 py-3 text-left">Ingredient</th>
                  <th className="tfb-eyebrow px-6 py-3 text-left">Unit</th>
                  <th className="tfb-eyebrow px-6 py-3 text-right">
                    Total needed
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-herb">
                {ingredients.map((ing) => (
                  <tr
                    key={ing.name}
                    className="transition-colors hover:bg-midsage/20"
                  >
                    <td className="px-6 py-4 font-medium text-deep-leaf">
                      {ing.name}
                    </td>
                    <td className="px-6 py-4 text-warmgray">{ing.unit}</td>
                    <td className="px-6 py-4 text-right text-lg font-medium text-terracotta">
                      {formatQty(ing.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-t border-herb px-6 py-4 text-right text-xs text-warmgray">
              {ingredients.length} ingredient{ingredients.length !== 1 ? "s" : ""}{" "}
              calculated from locked order volumes
            </div>
          </>
        )}
      </div>
    </div>
  );
}
