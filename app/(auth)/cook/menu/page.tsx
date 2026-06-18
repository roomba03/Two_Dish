import Link from "next/link";
import { getAllMenuItems } from "@/lib/data/kitchen";
import AddMenuItemForm from "./components/AddMenuItemForm";
import DeleteDishButton from "./components/DeleteDishButton";

function fmt(cents: number) {
  return `$${cents.toFixed(2)}`;
}

export default async function MenuPage() {
  const items = await getAllMenuItems();

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-widest text-neutral-400">
            Partner Dashboard
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900">
            Dishes
          </h1>
        </div>
      </div>

      {/* Add form */}
      <AddMenuItemForm />

      {/* Dish list */}
      <div className="mt-8">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 py-16 text-center">
            <p className="text-sm text-neutral-400">
              No dishes yet. Add your first dish above.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-100">
                  <th className="px-6 py-4 text-left font-mono text-xs font-semibold uppercase tracking-widest text-neutral-400">
                    Dish
                  </th>
                  <th className="px-6 py-4 text-left font-mono text-xs font-semibold uppercase tracking-widest text-neutral-400">
                    Description
                  </th>
                  <th className="px-6 py-4 text-right font-mono text-xs font-semibold uppercase tracking-widest text-neutral-400">
                    Price
                  </th>
                  <th className="px-6 py-4 text-right font-mono text-xs font-semibold uppercase tracking-widest text-neutral-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="transition-colors hover:bg-neutral-50"
                  >
                    <td className="px-6 py-4">
                      <span className="font-medium text-neutral-900">
                        {item.name}
                      </span>
                    </td>
                    <td className="max-w-xs px-6 py-4">
                      <span className="line-clamp-1 text-sm text-neutral-500">
                        {item.description}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-neutral-900">
                      {fmt(item.price)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-4">
                        <Link
                          href={`/cook/menu/${item.id}`}
                          className="text-sm font-medium text-neutral-900 transition-opacity hover:opacity-60"
                        >
                          Edit
                        </Link>
                        <DeleteDishButton id={item.id} name={item.name} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
