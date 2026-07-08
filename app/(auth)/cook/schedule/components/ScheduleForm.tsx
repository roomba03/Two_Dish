"use client";

import { useActionState, useEffect, useState } from "react";
import { scheduleMenuItem, type ActionState } from "@/lib/actions/menuActions";
import type { MenuItem } from "@/lib/data/kitchen";

type Props = { menuItems: MenuItem[]; today: string };

const initial: ActionState = {};

function Label({ children }: { children: React.ReactNode }) {
  return <label className="tfb-label">{children}</label>;
}

export default function ScheduleForm({ menuItems, today }: Props) {
  const [state, action, isPending] = useActionState(scheduleMenuItem, initial);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    if (state.success) setFormKey((k) => k + 1);
  }, [state.success]);

  return (
    <div className="tfb-card px-6 py-6">
      <p className="tfb-eyebrow mb-5">Schedule a dish</p>

      <form key={formKey} action={action}>
        {state.error && (
          <div className="mb-4 rounded-lg border border-rust/40 bg-sage px-4 py-3 text-sm text-rust">
            {state.error}
          </div>
        )}
        {state.success && (
          <div className="mb-4 rounded-lg border border-herb/30 bg-midsage/30 px-4 py-3 text-sm text-herb">
            Schedule updated.
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <Label>Delivery date</Label>
            <input
              name="delivery_date"
              type="date"
              required
              min={today}
              className="tfb-input w-full"
            />
          </div>

          <div>
            <Label>Dish</Label>
            <select name="menu_item_id" required className="tfb-input w-full cursor-pointer">
              <option value="">Select a dish…</option>
              {menuItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label>Max capacity</Label>
            <input
              name="max_capacity"
              type="number"
              min="1"
              defaultValue="50"
              required
              className="tfb-input w-full"
            />
          </div>
        </div>

        <div className="mt-5">
          <button type="submit" disabled={isPending} className="tfb-btn-primary w-auto">
            {isPending ? "Saving…" : "Save schedule"}
          </button>
        </div>
      </form>
    </div>
  );
}
