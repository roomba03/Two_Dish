"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import type { GeoJsonPolygon } from "@/lib/data/menu";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import { point, polygon } from "@turf/helpers";
import "leaflet/dist/leaflet.css";

const ZoneMap = dynamic(() => import("./DeliveryZoneCheckerMap"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: "100%",
        background: "#E8DCCF",
        borderRadius: "inherit",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span style={{ fontSize: "0.875rem", color: "#9B7E6A" }}>
        Loading map…
      </span>
    </div>
  ),
});

type CheckResult = "in" | "out" | "not_found" | "error";

type Props = {
  zone: GeoJsonPolygon | null;
  activeZips: string[];
};

const C = {
  cream: "#FDF8F2",
  ink: "#1C1008",
  rust: "#C4622D",
  sand: "#F0E6D8",
  border: "#E5D4C0",
  muted: "#9B7E6A",
} as const;

export default function DeliveryZoneChecker({ zone, activeZips }: Props) {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [resultPoint, setResultPoint] = useState<[number, number] | null>(null);

  async function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    const q = address.trim();
    if (!q) return;

    setLoading(true);
    setResult(null);
    setResultPoint(null);

    try {
      const encoded = encodeURIComponent(`${q}, US`);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1&countrycodes=us`,
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
    { label: string; sublabel: string; color: string; bg: string }
  > = {
    in: {
      label: "Great news — we deliver there!",
      sublabel: "Your address is inside our delivery zone.",
      color: "#16a34a",
      bg: "#f0fdf4",
    },
    out: {
      label: "Outside the delivery zone.",
      sublabel: "We don't deliver to that address.",
      color: "#dc2626",
      bg: "#fef2f2",
    },
    not_found: {
      label: "Address not found.",
      sublabel: "Double-check your address and try again.",
      color: "#9B7E6A",
      bg: "#F0E6D8",
    },
    error: {
      label: "Couldn't check right now.",
      sublabel: "Something went wrong. Please try again.",
      color: "#9B7E6A",
      bg: "#F0E6D8",
    },
  };

  return (
    <section
      style={{
        background: C.sand,
        borderTop: `1px solid ${C.border}`,
        borderBottom: `1px solid ${C.border}`,
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "5rem 1.5rem 5.5rem",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "3rem",
          alignItems: "start",
        }}
      >
        {/* ── Map ── */}
        <div
          style={{
            height: "420px",
            borderRadius: "1.25rem",
            overflow: "hidden",
            border: `1px solid ${C.border}`,
            boxShadow: "0 1px 3px rgba(28,16,8,0.06)",
          }}
        >
          <ZoneMap
            zone={zone}
            resultPoint={resultPoint}
            resultInZone={result === "in"}
          />
        </div>

        {/* ── Form side ── */}
        <div style={{ paddingTop: "0.5rem" }}>
          <p
            style={{
              fontFamily: "var(--font-dm-sans)",
              fontSize: "0.6875rem",
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: C.rust,
              marginBottom: "0.875rem",
            }}
          >
            Delivery coverage
          </p>

          <h2
            style={{
              fontFamily: "var(--font-fraunces)",
              fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
              fontWeight: 400,
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              color: C.ink,
              marginBottom: "1rem",
            }}
          >
            Do we deliver to you?
          </h2>

          <p
            style={{
              fontFamily: "var(--font-dm-sans)",
              fontSize: "0.9375rem",
              lineHeight: 1.7,
              color: C.muted,
              marginBottom: "2rem",
            }}
          >
            Enter your address below and we&apos;ll check instantly if
            you&apos;re inside our delivery zone.
          </p>

          <form onSubmit={handleCheck} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
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
              style={{
                width: "100%",
                padding: "0.9375rem 1.125rem",
                borderRadius: "0.875rem",
                border: `1.5px solid ${C.border}`,
                background: C.cream,
                fontFamily: "var(--font-dm-sans)",
                fontSize: "0.9375rem",
                color: C.ink,
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.15s",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = C.ink)}
              onBlur={(e) => (e.currentTarget.style.borderColor = C.border)}
            />

            <button
              type="submit"
              disabled={loading || !address.trim()}
              style={{
                padding: "0.9375rem 1.75rem",
                borderRadius: "999px",
                background: loading || !address.trim() ? C.muted : C.ink,
                color: C.cream,
                fontFamily: "var(--font-dm-sans)",
                fontSize: "0.9375rem",
                fontWeight: 600,
                letterSpacing: "0.01em",
                border: "none",
                cursor: loading || !address.trim() ? "not-allowed" : "pointer",
                transition: "background 0.15s, opacity 0.15s",
                opacity: loading ? 0.7 : 1,
                alignSelf: "flex-start",
              }}
            >
              {loading ? "Checking…" : "Check my address"}
            </button>
          </form>

          {/* Result */}
          {result && (
            <div
              style={{
                marginTop: "1.25rem",
                padding: "1rem 1.25rem",
                borderRadius: "0.875rem",
                background: resultConfig[result].bg,
                border: `1px solid ${resultConfig[result].color}22`,
                display: "flex",
                alignItems: "flex-start",
                gap: "0.75rem",
              }}
            >
              <span
                style={{
                  fontSize: "1.125rem",
                  lineHeight: 1,
                  flexShrink: 0,
                  marginTop: "1px",
                  color: resultConfig[result].color,
                }}
              >
                {result === "in" ? "✓" : result === "out" ? "✕" : "–"}
              </span>
              <div>
                <p
                  style={{
                    fontFamily: "var(--font-dm-sans)",
                    fontSize: "0.9375rem",
                    fontWeight: 600,
                    color: resultConfig[result].color,
                    margin: 0,
                  }}
                >
                  {resultConfig[result].label}
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-dm-sans)",
                    fontSize: "0.8125rem",
                    color: C.muted,
                    margin: "0.25rem 0 0",
                  }}
                >
                  {resultConfig[result].sublabel}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
