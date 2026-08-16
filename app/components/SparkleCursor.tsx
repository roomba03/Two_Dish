"use client";

// Version 9 only — a trail of small gold sparkles follows the cursor.
// Mounted site-wide in layout.tsx since v9's palette is also site-wide.
import { useEffect, useRef, useState } from "react";

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
}

let nextId = 0;

// Minimum gap between spawns, so a fast mouse doesn't flood the DOM with
// sparkles — this caps the rate rather than spawning once per mousemove.
const SPAWN_INTERVAL = 45;
const LIFETIME = 650;

export default function SparkleCursor() {
  const [active, setActive] = useState(false);
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const lastSpawn = useRef(0);

  useEffect(() => {
    const checkVersion = () =>
      setActive(
        document.documentElement.getAttribute("data-version") === "9",
      );
    checkVersion();

    const observer = new MutationObserver(checkVersion);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-version"],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!active) {
      setSparkles([]);
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const handleMove = (e: MouseEvent) => {
      const now = performance.now();
      if (now - lastSpawn.current < SPAWN_INTERVAL) return;
      lastSpawn.current = now;

      const id = nextId++;
      setSparkles((prev) => [
        ...prev,
        {
          id,
          x: e.clientX,
          y: e.clientY,
          size: 7 + Math.random() * 8,
          rotation: Math.random() * 360 - 180,
        },
      ]);
      setTimeout(() => {
        setSparkles((prev) => prev.filter((s) => s.id !== id));
      }, LIFETIME);
    };

    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [active]);

  if (!active || sparkles.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[2000]" aria-hidden>
      {sparkles.map((s) => (
        <span
          key={s.id}
          className="tfb-sparkle-wrap absolute"
          style={{ left: s.x, top: s.y }}
        >
          <span
            className="tfb-sparkle block"
            style={
              {
                width: s.size,
                height: s.size,
                "--tfb-sparkle-rot": `${s.rotation}deg`,
              } as React.CSSProperties
            }
          />
        </span>
      ))}
    </div>
  );
}
