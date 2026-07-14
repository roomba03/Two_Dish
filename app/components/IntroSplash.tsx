"use client";

import { useEffect, useState } from "react";

type Phase = "intro" | "exiting" | "done";

const HOLD_MS = 1400;
const EXIT_MS = 700;

export default function IntroSplash() {
  const [phase, setPhase] = useState<Phase>("intro");

  useEffect(() => {
    const exitTimer = setTimeout(() => setPhase("exiting"), HOLD_MS);
    const doneTimer = setTimeout(() => setPhase("done"), HOLD_MS + EXIT_MS);
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = phase === "done" ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [phase]);

  if (phase === "done") return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-sage transition-transform duration-700 ease-in-out ${
        phase === "exiting" ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div aria-hidden className="tfb-glow absolute inset-0" />
      <div aria-hidden className="tfb-grain absolute inset-0" />

      <span className="font-heading text-6xl font-bold tracking-tight text-deep-leaf sm:text-7xl">
        Two Dish
      </span>
      <p className="mt-4 text-lg font-semibold text-terracotta sm:text-xl">
        We serve one dish a day.
      </p>
    </div>
  );
}
