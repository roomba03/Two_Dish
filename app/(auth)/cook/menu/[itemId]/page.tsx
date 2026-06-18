import Link from "next/link";
import { notFound } from "next/navigation";
import { getMenuItemWithIngredients } from "@/lib/data/kitchen";
import EditMenuItemForm from "./components/EditMenuItemForm";
import IngredientsManager from "./components/IngredientsManager";

export default async function MenuItemPage({
  params,
}: {
  params: Promise<{ itemId: string }>;
}) {
  const { itemId } = await params;
  const result = await getMenuItemWithIngredients(itemId);

  if (!result) notFound();

  const { item, ingredients } = result;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/cook/menu"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-neutral-500 transition-colors hover:text-neutral-900"
      >
        ← Back to Dishes
      </Link>

      <div className="mb-8">
        <p className="font-mono text-xs font-semibold uppercase tracking-widest text-neutral-400">
          Partner Dashboard
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900">
          {item.name}
        </h1>
      </div>

      {/* Edit dish details */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6">
        <p className="mb-5 font-mono text-xs font-semibold uppercase tracking-widest text-neutral-400">
          Dish Details
        </p>
        <EditMenuItemForm item={item} />
      </div>

      {/* Ingredients */}
      <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6">
        <p className="mb-5 font-mono text-xs font-semibold uppercase tracking-widest text-neutral-400">
          Ingredients
        </p>
        <IngredientsManager
          menuItemId={item.id}
          ingredients={ingredients}
        />
      </div>
    </main>
  );
}
