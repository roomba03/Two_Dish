"use client";

import Image from "next/image";
import { useState } from "react";

export default function DishImage({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
        <span className="text-4xl">🍽️</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 640px) 85vw, (max-width: 1024px) 40vw, 14vw"
      className="object-cover"
      onError={() => setFailed(true)}
    />
  );
}
