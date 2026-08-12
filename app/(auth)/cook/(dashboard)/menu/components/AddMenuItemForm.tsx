"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createMenuItem, type ActionState } from "@/lib/actions/menuActions";
import DishImageField from "./DishImageField";

const initial: ActionState = {};

function Label({ children }: { children: React.ReactNode }) {
  return <label className="tfb-label">{children}</label>;
}

export default function AddMenuItemForm() {
  const [state, action, isPending] = useActionState(createMenuItem, initial);
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    if (state.success) {
      setFormKey((k) => k + 1);
      setOpen(false);
    }
  }, [state.success]);

  return (
    <div className="tfb-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-6 py-4 text-left transition-opacity hover:opacity-80"
      >
        <span className="font-medium text-deep-leaf">+ Add new dish</span>
        <span className="text-sm text-warmgray">{open ? "Cancel" : ""}</span>
      </button>

      {open && (
        <form
          key={formKey}
          action={action}
          className="border-t border-herb px-6 pb-6 pt-5"
        >
          {state.error && (
            <div className="mb-4 rounded-lg border border-rust/40 bg-sage px-4 py-3 text-sm text-rust">
              {state.error}
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label>Dish name</Label>
              <input
                name="name"
                type="text"
                required
                placeholder="e.g. Chicken Tikka Masala"
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
                placeholder="12.00"
                className="tfb-input w-full"
              />
            </div>

            <div className="sm:col-span-2">
              <Label>Description</Label>
              <textarea
                name="description"
                required
                rows={2}
                placeholder="A short description customers will see"
                className="tfb-input resize-none"
              />
            </div>

            <DishImageField />
          </div>

          <div className="mt-5 flex items-center gap-4">
            <button type="submit" disabled={isPending} className="tfb-btn-primary w-auto">
              {isPending ? "Saving…" : "Add dish"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-sm text-warmgray transition-opacity hover:opacity-70"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
