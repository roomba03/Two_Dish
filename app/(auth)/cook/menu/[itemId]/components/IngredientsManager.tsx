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

function Label({ children }: { children: React.ReactNode }) {
  return <label className="tfb-label">{children}</label>;
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
        <p className="text-sm text-herb">
          No ingredients added yet. Add them below so the grocery calculator
          works.
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-herb/20">
          <table className="w-full">
            <thead>
              <tr className="border-b border-herb/20 bg-midsage/20">
                <th className="tfb-eyebrow px-4 py-3 text-left">Ingredient</th>
                <th className="tfb-eyebrow px-4 py-3 text-right">Qty / meal</th>
                <th className="tfb-eyebrow px-4 py-3 text-right">Unit</th>
                <th className="tfb-eyebrow px-4 py-3 text-right">&nbsp;</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-herb/10">
              {ingredients.map((ing) => {
                const boundDelete = deleteIngredient.bind(
                  null,
                  ing.id,
                  menuItemId
                );
                return (
                  <tr key={ing.id} className="hover:bg-midsage/20">
                    <td className="px-4 py-3 text-sm text-deep-leaf">
                      {ing.name}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-herb">
                      {ing.per_unit_quantity}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-herb">
                      {ing.unit}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <form action={boundDelete}>
                        <button
                          type="submit"
                          className="text-xs font-medium text-rust transition-opacity hover:opacity-70"
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
          <div className="rounded-lg border border-rust/40 bg-sage px-4 py-3 text-sm text-rust">
            {state.error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label>Ingredient name</Label>
            <input
              name="name"
              type="text"
              required
              placeholder="e.g. Chicken breast"
              className="tfb-input w-full"
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
              className="tfb-input w-full"
            />
          </div>

          <div>
            <Label>Unit</Label>
            <input
              name="unit"
              type="text"
              required
              placeholder="lbs, cups, oz…"
              className="tfb-input w-full"
            />
          </div>
        </div>

        <div>
          <button type="submit" disabled={isPending} className="tfb-btn-secondary w-auto">
            {isPending ? "Adding…" : "+ Add ingredient"}
          </button>
        </div>
      </form>
    </div>
  );
}
