"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import type { GeoJsonPolygon } from "@/lib/data/menu";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import { point, polygon } from "@turf/helpers";
import "leaflet/dist/leaflet.css";

const ZoneMap = dynamic(() => import("./DeliveryZoneCheckerMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center rounded-[inherit] bg-midsage">
      <span className="text-sm text-warmgray">Loading map…</span>
    </div>
  ),
});

type CheckResult = "in" | "out" | "not_found" | "error";

type CheckedAddress = { street: string; city: string; zip: string };

type Props = {
  zone: GeoJsonPolygon | null;
  activeZips: string[];
  // "embedded" drops the outer section/id and stacks map above form,
  // for reuse inside another section's layout — see the "What we offer"
  // section on the homepage. "section" (default) is the standalone,
  // full-width delivery-coverage section further down the homepage.
  variant?: "section" | "embedded";
};

export default function DeliveryZoneChecker({
  zone,
  activeZips,
  variant = "section",
}: Props) {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [resultPoint, setResultPoint] = useState<[number, number] | null>(null);
  const [checkedAddress, setCheckedAddress] = useState<CheckedAddress | null>(null);

  async function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    const q = address.trim();
    if (!q) return;

    setLoading(true);
    setResult(null);
    setResultPoint(null);
    setCheckedAddress(null);

    try {
      const encoded = encodeURIComponent(`${q}, US`);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1&countrycodes=us&addressdetails=1`,
        { headers: { "User-Agent": "TheFamilyBusiness/1.0" } }
      );
      const data = await res.json();

      if (!data.length) {
        setResult("not_found");
        setLoading(false);
        return;
      }

      const lat = parseFloat(data[0].lat);
      const lng = parseFloat(data[0].lon);
      setResultPoint([lat, lng]);

      const addr = data[0].address ?? {};
      const street = [addr.house_number, addr.road].filter(Boolean).join(" ");
      const city = addr.city || addr.town || addr.village || addr.hamlet || "";
      const zip = addr.postcode || "";
      setCheckedAddress({ street, city, zip });

      if (zone) {
        const pt = point([lng, lat]);
        const poly = polygon(zone.coordinates as number[][][]);
        setResult(booleanPointInPolygon(pt, poly) ? "in" : "out");
      } else {
        // No polygon drawn yet — fall back to ZIP list
        const zipMatch = q.match(/\b(\d{5})\b/);
        setResult(zipMatch && activeZips.includes(zipMatch[1]) ? "in" : "out");
      }
    } catch {
      setResult("error");
    }

    setLoading(false);
  }

  const resultConfig: Record<
    CheckResult,
    { label: string; sublabel: string; className: string }
  > = {
    in: {
      label: "Great news — we deliver there.",
      sublabel: "Your address is inside our delivery zone.",
      className: "text-terracotta border-terracotta/30",
    },
    out: {
      label: "Outside the delivery zone.",
      sublabel: "We don't deliver to that address.",
      className: "text-rust border-rust/30",
    },
    not_found: {
      label: "Address not found.",
      sublabel: "Double-check your address and try again.",
      className: "text-warmgray border-warmgray/30",
    },
    error: {
      label: "Couldn't check right now.",
      sublabel: "Something went wrong. Please try again.",
      className: "text-warmgray border-warmgray/30",
    },
  };

  const content = (
    <>
      {/* ── Map ── */}
      <div
        className={`tfb-shadow-card isolate overflow-hidden rounded-lg border border-herb ${
          variant === "embedded" ? "h-72" : "h-[420px]"
        }`}
      >
        <ZoneMap
          zone={zone}
          resultPoint={resultPoint}
          resultInZone={result === "in"}
        />
      </div>

      {/* ── Form side ── */}
      <div className={variant === "embedded" ? undefined : "pt-2"}>
        <p className="tfb-eyebrow mb-3.5">Delivery coverage</p>

        <h2 className="mb-4 text-4xl leading-tight text-deep-leaf">
          Do we deliver to you?
        </h2>

        <p className="mb-8 text-base leading-relaxed text-warmgray">
          Enter your address below and we&apos;ll check instantly if
          you&apos;re inside our delivery zone.
        </p>

        <form onSubmit={handleCheck} className="flex flex-col gap-3">
          <input
            type="text"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              setResult(null);
              setResultPoint(null);
            }}
            placeholder="e.g. 123 Main St, Overland Park, KS 66221"
            required
            className="w-full rounded-lg border border-herb bg-sage px-4.5 py-3.5 text-base text-deep-leaf outline-none transition-colors focus:border-terracotta focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
          />

          <div className="group relative self-start">
            <button
              type="submit"
              disabled={loading || !address.trim()}
              className="tfb-shadow-btn rounded-lg bg-terracotta px-7 py-3.5 text-sm font-medium text-sage transition-opacity hover:opacity-90 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
            >
              {loading ? "Checking…" : "Check my address"}
            </button>
            {!loading && !address.trim() && (
              <span className="pointer-events-none absolute top-full -right-6 mt-2 whitespace-nowrap text-[11px] font-medium text-warmgray opacity-0 transition-opacity group-hover:opacity-100">
                Enter an address
              </span>
            )}
          </div>
        </form>

        {/* Result */}
        {result && (
          <div
            className={`mt-5 flex items-start gap-3 rounded-lg border bg-sage px-5 py-4 ${resultConfig[result].className}`}
          >
            <span className="mt-px shrink-0 text-lg leading-none">
              {result === "in" ? "✓" : result === "out" ? "✕" : "–"}
            </span>
            <div>
              <p className="font-medium">{resultConfig[result].label}</p>
              <p className="mt-1 text-sm text-warmgray">
                {resultConfig[result].sublabel}
              </p>
              {result === "in" && checkedAddress && (
                <Link
                  href={`/menu?${new URLSearchParams({
                    street: checkedAddress.street,
                    city: checkedAddress.city,
                    zip: checkedAddress.zip,
                  }).toString()}`}
                  className="mt-3 inline-flex items-center gap-1.5 border-b border-terracotta text-sm font-medium text-terracotta"
                >
                  Continue to order →
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );

  if (variant === "embedded") {
    return <div className="flex flex-col gap-8">{content}</div>;
  }

  return (
    <section id="delivery-area">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-12 px-6 py-20 md:grid-cols-2">
        {content}
      </div>
    </section>
  );
}
