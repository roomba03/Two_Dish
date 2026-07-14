"use client";

import { useState } from "react";
import DishImage from "@/app/components/DishImage";

export default function DishImageField({
  currentImageUrl,
}: {
  currentImageUrl?: string | null;
}) {
  const [preview, setPreview] = useState<string | null>(currentImageUrl ?? null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setPreview(file ? URL.createObjectURL(file) : (currentImageUrl ?? null));
  }

  return (
    <div className="sm:col-span-2">
      <label className="tfb-label">Dish photo (optional)</label>
      <div className="flex items-start gap-4">
        <div className="w-20 shrink-0">
          <DishImage
            src={preview}
            alt="Dish photo preview"
            className="aspect-square rounded-lg"
          />
        </div>
        <div className="flex-1">
          <input
            name="image_file"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
            className="tfb-input w-full cursor-pointer file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-midsage file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-deep-leaf"
          />
          <p className="mt-1.5 text-xs text-warmgray">
            JPEG, PNG, WebP, or GIF — up to 5MB.
          </p>
          <details className="mt-2" open={!!currentImageUrl}>
            <summary className="cursor-pointer text-xs text-warmgray hover:opacity-70">
              Or paste an image URL instead
            </summary>
            <input
              name="image_url"
              type="url"
              defaultValue={currentImageUrl ?? ""}
              placeholder="https://..."
              className="tfb-input mt-2 w-full"
            />
          </details>
        </div>
      </div>
    </div>
  );
}
