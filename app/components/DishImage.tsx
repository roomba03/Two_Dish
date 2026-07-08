"use client";

import Image from "next/image";
import { useState } from "react";
import { getDishIcon } from "./icons/DishIcons";

export default function DishImage({
  src,
  alt,
  className = "rounded-lg",
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const showPlaceholder = !src || failed;
  const Icon = getDishIcon(alt);

  return (
    <div
      className={`relative aspect-[4/3] w-full overflow-hidden bg-midsage ${className}`}
    >
      {showPlaceholder ? (
        <div className="flex h-full w-full items-center justify-center">
          <Icon className="h-12 w-12 text-herb" aria-hidden />
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
