"use client";

import Image from "next/image";
import { createElement, useState } from "react";
import { getDishIcon } from "./icons/DishIcons";

export default function DishImage({
  src,
  alt,
  className = "aspect-[4/3] rounded-lg",
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const showPlaceholder = !src || failed;

  return (
    <div
      className={`relative isolate w-full overflow-hidden bg-midsage ${className}`}
    >
      {showPlaceholder ? (
        <div className="flex h-full w-full items-center justify-center">
          {createElement(getDishIcon(alt), {
            className: "h-12 w-12 text-terracotta",
            "aria-hidden": true,
          })}
        </div>
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 640px) 85vw, (max-width: 1024px) 40vw, 14vw"
          className="object-cover"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
