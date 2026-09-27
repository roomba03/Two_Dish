// Leaflet takes plain color strings, not CSS variables, so the maps read the
// design tokens at runtime instead of hardcoding hex values. The zone uses
// the dark violet page color rather than the gold accent — gold all but
// disappears on OpenStreetMap's light tiles. Fallbacks match globals.css.
function token(name: string, fallback: string): string {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return value || fallback;
}

export function getMapColors() {
  return {
    zone: token("--color-sage", "#3A3042"),
    outside: token("--color-rust", "#E2725B"),
  };
}
