"use client";

import { useEffect } from "react";

const STORAGE_KEY = "tfb-version";

// Number-key → data-version value on <html>. "0" always clears back to the
// main (default) version. Add more digits here as new versions are built.
const VERSIONS: Record<string, string | null> = {
  "0": null, // main
  "8": "8", // alternate palette — plum/lilac/jet-black
  "9": "9", // alternate palette — midnight violet
};

function applyVersion(value: string | null) {
  if (value) {
    document.documentElement.setAttribute("data-version", value);
  } else {
    document.documentElement.removeAttribute("data-version");
  }
}

export default function VersionSwitcher() {
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && stored in VERSIONS) applyVersion(VERSIONS[stored]);

    function handleKeyDown(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const target = e.target as HTMLElement | null;
      const isTyping =
        !!target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);
      if (isTyping) return;

      if (!(e.key in VERSIONS)) return;

      applyVersion(VERSIONS[e.key]);
      localStorage.setItem(STORAGE_KEY, e.key);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return null;
}
