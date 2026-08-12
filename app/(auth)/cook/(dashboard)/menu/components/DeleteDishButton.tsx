"use client";

import { deleteMenuItem } from "@/lib/actions/menuActions";

export default function DeleteDishButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const boundDelete = deleteMenuItem.bind(null, id);
  return (
    <form action={boundDelete}>
      <button
        type="submit"
        className="text-sm font-medium text-rust transition-opacity hover:opacity-70"
        onClick={(e) => {
          if (!confirm(`Delete "${name}"? This cannot be undone.`))
            e.preventDefault();
        }}
      >
        Delete
      </button>
    </form>
  );
}
