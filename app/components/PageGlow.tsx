"use client";

// Version 9 only — the two ambient corner blooms (see .tfb-page-glow in
// globals.css) ease toward the cursor. Position is pushed straight onto
// the DOM via CSS custom properties every rAF tick rather than through
// React state, since a state-driven re-render on every mousemove/frame
// would be wasteful.
import { useEffect, useRef, useState } from "react";

interface Blob {
  x: number;
  y: number;
  homeX: number;
  homeY: number;
  ease: number;
  pull: number;
}

// Home positions match the previous static blooms. Different (and
// deliberately slow) ease speeds keep the two blooms from moving in
// lockstep, so the effect reads as two independent light sources drifting
// toward the cursor rather than something visibly tracking it. `pull`
// caps how far a bloom can stray from home — it only closes a fraction of
// the distance to the cursor, so this stays a gentle lean rather than the
// bloom traveling all the way across the screen.
function makeBlobs(): Blob[] {
  return [
    { x: 14, y: 18, homeX: 14, homeY: 18, ease: 0.003, pull: 0.18 },
    { x: 86, y: 80, homeX: 86, homeY: 80, ease: 0.0045, pull: 0.18 },
  ];
}

export default function PageGlow() {
  const [active, setActive] = useState(false);
  const elRef = useRef<HTMLDivElement>(null);

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
    const el = elRef.current;
    if (!active || !el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const blobs = makeBlobs();
    let mouseX = 0;
    let mouseY = 0;
    let hasMouse = false;

    const handleMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      hasMouse = true;
    };
    window.addEventListener("mousemove", handleMove);

    let raf = requestAnimationFrame(function tick() {
      const targetX = hasMouse ? (mouseX / window.innerWidth) * 100 : undefined;
      const targetY = hasMouse ? (mouseY / window.innerHeight) * 100 : undefined;

      blobs.forEach((b, i) => {
        const tx = targetX === undefined ? b.homeX : b.homeX + (targetX - b.homeX) * b.pull;
        const ty = targetY === undefined ? b.homeY : b.homeY + (targetY - b.homeY) * b.pull;
        b.x += (tx - b.x) * b.ease;
        b.y += (ty - b.y) * b.ease;

        el.style.setProperty(`--glow-${i + 1}-x`, `${b.x}%`);
        el.style.setProperty(`--glow-${i + 1}-y`, `${b.y}%`);
      });

      raf = requestAnimationFrame(tick);
    });

    return () => {
      window.removeEventListener("mousemove", handleMove);
      cancelAnimationFrame(raf);
    };
  }, [active]);

  if (!active) return null;

  return (
    <div
      ref={elRef}
      aria-hidden
      className="tfb-page-glow absolute inset-0 -z-10"
    />
  );
}
