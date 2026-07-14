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
          <p className="tfb-eyebrow">Partner dashboard</p>
          <h1 className="mt-1 text-2xl text-deep-leaf">Dishes</h1>
        </div>
      </div>

      {/* Add form */}
      <AddMenuItemForm />

      {/* Dish list */}
      <div className="mt-8">
        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-herb py-16 text-center">
            <p className="text-sm text-warmgray">
              No dishes yet. Add your first dish above.
            </p>
          </div>
        ) : (
          <div className="tfb-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-herb">
                  <th className="tfb-eyebrow px-6 py-4 text-left">Dish</th>
                  <th className="tfb-eyebrow px-6 py-4 text-left">Description</th>
                  <th className="tfb-eyebrow px-6 py-4 text-right">Price</th>
                  <th className="tfb-eyebrow px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-herb">
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="transition-colors hover:bg-midsage/20"
                  >
                    <td className="px-6 py-4">
                      <span className="font-medium text-deep-leaf">
                        {item.name}
                      </span>
                    </td>
                    <td className="max-w-xs px-6 py-4">
                      <span className="line-clamp-1 text-sm text-warmgray">
                        {item.description}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-terracotta">
                      {fmt(item.price)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-4">
                        <Link
                          href={`/cook/menu/${item.id}`}
                          className="text-sm font-medium text-terracotta transition-opacity hover:opacity-70"
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
