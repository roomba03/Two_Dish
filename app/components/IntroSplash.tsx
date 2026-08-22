"use client";

import { useEffect, useState } from "react";
import PanLoader from "@/app/components/PanLoader";

type Phase = "intro" | "exiting" | "done";

const HOLD_MS = 2900;
const EXIT_MS = 700;

export default function IntroSplash() {
  const [phase, setPhase] = useState<Phase>("intro");

  useEffect(() => {
    // Version 9 drops the loading-screen splash entirely — its pan
    // animation runs inline above the "What we offer" blurb instead
    // (see .tfb-offer-loader in page.tsx / globals.css). `data-version`
    // is set by a blocking script before first paint, but only readable
    // client-side post-hydration, so this can't be resolved during the
    // initial render without a server/client markup mismatch.
    if (document.documentElement.getAttribute("data-version") === "9") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPhase("done");
      return;
    }

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
      className={`tfb-intro-splash fixed inset-0 z-[1200] flex flex-col items-center justify-center bg-warmgray transition-transform duration-700 ease-in-out ${
        phase === "exiting" ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div aria-hidden className="absolute inset-0 bg-sage/40" />
      <div aria-hidden className="tfb-glow absolute inset-0" />
      <div aria-hidden className="tfb-grain absolute inset-0" />

      <div className="relative z-10 w-fit text-center">
        <PanLoader />
      </div>
    </div>
  );
}
