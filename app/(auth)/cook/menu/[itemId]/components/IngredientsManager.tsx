"use client";

import { useActionState, useEffect, useState } from "react";
import {
  addIngredient,
  deleteIngredient,
  type ActionState,
} from "@/lib/actions/menuActions";
import type { IngredientRow } from "@/lib/data/kitchen";

type Props = { menuItemId: string; ingredients: IngredientRow[] };

const initial: ActionState = {};

function inputClass() {
  return "w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm text-neutral-900 outline-none transition-colors focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900";
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-neutral-400">
      {children}
    </label>
  );
}

export default function IngredientsManager({ menuItemId, ingredients }: Props) {
  const [state, action, isPending] = useActionState(addIngredient, initial);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    if (state.success) setFormKey((k) => k + 1);
  }, [state.success]);

  return (
    <div className="flex flex-col gap-6">
      {/* Existing ingredients */}
      {ingredients.length === 0 ? (
        <p className="text-sm text-neutral-400">
          No ingredients added yet. Add them below so the grocery calculator
          works.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-neutral-100">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50">
                <th className="px-4 py-3 text-left font-mono text-xs font-semibold uppercase tracking-widest text-neutral-400">
                  Ingredient
                </th>
                <th className="px-4 py-3 text-right font-mono text-xs font-semibold uppercase tracking-widest text-neutral-400">
                  Qty / meal
                </th>
                <th className="px-4 py-3 text-right font-mono text-xs font-semibold uppercase tracking-widest text-neutral-400">
                  Unit
                </th>
                <th className="px-4 py-3 text-right font-mono text-xs font-semibold uppercase tracking-widest text-neutral-400">
                  &nbsp;
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {ingredients.map((ing) => {
                const boundDelete = deleteIngredient.bind(
                  null,
                  ing.id,
                  menuItemId
                );
                return (
                  <tr key={ing.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 text-sm text-neutral-900">
                      {ing.name}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-neutral-500">
                      {ing.per_unit_quantity}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-neutral-500">
                      {ing.unit}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <form action={boundDelete}>
                        <button
                          type="submit"
                          className="text-xs font-medium text-red-400 transition-opacity hover:opacity-70"
                        >
                          Remove
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add ingredient form */}
      <form key={formKey} action={action} className="flex flex-col gap-4">
        <input type="hidden" name="menu_item_id" value={menuItemId} />

        {state.error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label>Ingredient Name</Label>
            <input
              name="name"
              type="text"
              required
              placeholder="e.g. Chicken breast"
              className={inputClass()}
            />
          </div>

          <div>
            <Label>Qty per meal</Label>
            <input
              name="per_unit_quantity"
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="0.5"
              className={inputClass()}
            />
          </div>

          <div>
            <Label>Unit</Label>
            <input
              name="unit"
              type="text"
              required
              placeholder="lbs, cups, oz…"
              className={inputClass()}
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Adding…" : "+ Add Ingredient"}
          </button>
        </div>
      </form>
    </div>
  );
}
