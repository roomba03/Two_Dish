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
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-warmgray transition-transform duration-700 ease-in-out ${
        phase === "exiting" ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div aria-hidden className="absolute inset-0 bg-sage/40" />
      <div aria-hidden className="tfb-glow absolute inset-0" />
      <div aria-hidden className="tfb-grain absolute inset-0" />

      <div className="w-fit text-center">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.05em] text-sage/80">
          Welcome to
        </p>
        <span className="block font-heading text-6xl font-bold tracking-tight text-sage sm:text-7xl md:text-8xl">
          Two Dish
        </span>
        <p className="mt-5 flex w-full justify-between text-xl font-semibold text-sage sm:text-2xl md:text-3xl">
          <span>Serving</span>
          <span>one</span>
          <span>dish</span>
          <span>a</span>
          <span>day.</span>
        </p>
      </div>
    </div>
  );
}
