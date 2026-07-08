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
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-herb transition-opacity hover:opacity-70"
      >
        ← Back to dishes
      </Link>

      <div className="mb-8">
        <p className="tfb-eyebrow">Partner dashboard</p>
        <h1 className="mt-1 text-2xl text-deep-leaf">{item.name}</h1>
      </div>

      {/* Edit dish details */}
      <div className="tfb-card p-6">
        <p className="tfb-eyebrow mb-5">Dish details</p>
        <EditMenuItemForm item={item} />
      </div>

      {/* Ingredients */}
      <div className="tfb-card mt-6 p-6">
        <p className="tfb-eyebrow mb-5">Ingredients</p>
        <IngredientsManager menuItemId={item.id} ingredients={ingredients} />
      </div>
    </main>
  );
}
