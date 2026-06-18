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
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
          Ingredient Calculator
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900">
          {formatDate(date)}
        </h1>
      </div>

      {/* ── Date selector ──────────────────────────────────────────── */}
      <form className="flex items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
            Delivery Date
          </label>
          <input
            type="date"
            name="date"
            defaultValue={date}
            className="rounded-xl border border-neutral-200 px-4 py-2.5 text-sm text-neutral-900 outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
          />
        </div>
        <button
          type="submit"
          className="rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-700"
        >
          Calculate
        </button>
      </form>

      {/* ── Grocery list ────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-neutral-200 bg-white">
        <div className="border-b border-neutral-100 px-6 py-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
            Grocery List
          </p>
        </div>

        {ingredients.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-sm font-medium text-neutral-500">
              No orders locked for this date yet.
            </p>
            <p className="mt-1 text-xs text-neutral-400">
              Orders close at 11:59 PM the night before — check back then for the
              final totals.
            </p>
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-widest text-neutral-400">
                    Ingredient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-widest text-neutral-400">
                    Unit
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-widest text-neutral-400">
                    Total Needed
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {ingredients.map((ing) => (
                  <tr
                    key={ing.name}
                    className="transition-colors hover:bg-neutral-50/60"
                  >
                    <td className="px-6 py-4 font-medium text-neutral-900">
                      {ing.name}
                    </td>
                    <td className="px-6 py-4 text-neutral-500">{ing.unit}</td>
                    <td className="px-6 py-4 text-right font-mono text-lg font-bold text-neutral-900">
                      {formatQty(ing.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-t border-neutral-100 px-6 py-4 text-right text-xs text-neutral-400">
              {ingredients.length} ingredient{ingredients.length !== 1 ? "s" : ""}{" "}
              calculated from locked order volumes
            </div>
          </>
        )}
      </div>
    </div>
  );
}
