"use client";

import { useActionState } from "react";
import { updateMenuItem, type ActionState } from "@/lib/actions/menuActions";
import type { MenuItem } from "@/lib/data/kitchen";

type Props = { item: MenuItem };

const initial: ActionState = {};

function Label({ children }: { children: React.ReactNode }) {
  return <label className="tfb-label">{children}</label>;
}

export default function EditMenuItemForm({ item }: Props) {
  const [state, action, isPending] = useActionState(updateMenuItem, initial);

  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="id" value={item.id} />

      {state.error && (
        <div className="rounded-lg border border-rust/40 bg-sage px-4 py-3 text-sm text-rust">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="rounded-lg border border-herb/30 bg-midsage/30 px-4 py-3 text-sm text-herb">
          Saved.
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label>Dish name</Label>
          <input
            name="name"
            type="text"
            required
            defaultValue={item.name}
            className="tfb-input w-full"
          />
        </div>

        <div>
          <Label>Price</Label>
          <input
            name="price"
            type="number"
            step="0.01"
            min="0.01"
            required
            defaultValue={item.price}
            className="tfb-input w-full"
          />
        </div>

        <div className="sm:col-span-2">
          <Label>Description</Label>
          <textarea
            name="description"
            required
            rows={3}
            defaultValue={item.description}
            className="tfb-input w-full resize-none"
          />
        </div>

        <div className="sm:col-span-2">
          <Label>Image URL (optional)</Label>
          <input
            name="image_url"
            type="url"
            defaultValue={item.image_url ?? ""}
            placeholder="https://..."
            className="tfb-input w-full"
          />
        </div>
      </div>

      <div>
        <button type="submit" disabled={isPending} className="tfb-btn-primary w-auto">
          {isPending ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
