"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import type { GeoJsonPolygon } from "@/lib/data/menu";
import { saveDeliveryZone, clearDeliveryZone } from "@/lib/actions/zoneActions";

type Props = {
  existingZone: GeoJsonPolygon | null;
};

export default function ZoneEditorMap({ existingZone }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const drawnMarkersRef = useRef<import("leaflet").CircleMarker[]>([]);
  const drawnPolyRef = useRef<import("leaflet").Polygon | null>(null);
  const existingPolyRef = useRef<import("leaflet").Polygon | null>(null);

  const [points, setPoints] = useState<[number, number][]>([]); // [lat, lng]
  const [status, setStatus] = useState<"idle" | "saved" | "cleared" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let cancelled = false;

    import("leaflet").then((L) => {
      if (cancelled || !containerRef.current) return;

      const map = L.map(containerRef.current, {
        center: [38.853, -94.678],
        zoom: 12,
      });
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Render existing saved zone
      if (existingZone) {
        const latLngs = existingZone.coordinates[0].map(
          ([lng, lat]) => [lat, lng] as [number, number]
        );
        const poly = L.polygon(latLngs, {
          color: "#3B6D11",
          weight: 2,
          fillOpacity: 0.15,
        }).addTo(map);
        existingPolyRef.current = poly;
        map.fitBounds(poly.getBounds(), { padding: [40, 40] });
      }

      // Click to add vertices
      map.on("click", (e) => {
        if (cancelled) return;
        const { lat, lng } = e.latlng;
        setStatus("idle");

        const marker = L.circleMarker([lat, lng], {
          radius: 6,
          color: "#D97C4A",
          fillColor: "#D97C4A",
          fillOpacity: 1,
          weight: 2,
        }).addTo(map);
        drawnMarkersRef.current.push(marker);

        setPoints((prev) => {
          const next = [...prev, [lat, lng] as [number, number]];

          if (drawnPolyRef.current) {
            drawnPolyRef.current.remove();
            drawnPolyRef.current = null;
          }
          if (next.length >= 3) {
            drawnPolyRef.current = L.polygon(next, {
              color: "#D97C4A",
              weight: 2,
              fillOpacity: 0.1,
              dashArray: "6 4",
            }).addTo(map);
          }

          return next;
        });
      });
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function clearDrawing() {
    drawnMarkersRef.current.forEach((m) => m.remove());
    drawnMarkersRef.current = [];
    drawnPolyRef.current?.remove();
    drawnPolyRef.current = null;
    setPoints([]);
    setStatus("idle");
    setErrorMsg(null);
  }

  function handleSave() {
    if (points.length < 3) return;
    // Close the ring: last point = first point
    const ring: [number, number][] = [
      ...points.map(([lat, lng]) => [lng, lat] as [number, number]),
    ];
    ring.push(ring[0]);
    const geoJson: GeoJsonPolygon = { type: "Polygon", coordinates: [ring] };

    startTransition(async () => {
      const result = await saveDeliveryZone(geoJson);
      if (result.success) {
        // Swap drawn polygon for a solid saved-style polygon
        clearDrawing();
        if (mapRef.current) {
          existingPolyRef.current?.remove();
          const latLngs = geoJson.coordinates[0]
            .slice(0, -1)
            .map(([lng, lat]) => [lat, lng] as [number, number]);
          const L = await import("leaflet");
          existingPolyRef.current = L.polygon(latLngs, {
            color: "#3B6D11",
            weight: 2,
            fillOpacity: 0.15,
          }).addTo(mapRef.current);
        }
        setStatus("saved");
      } else {
        setErrorMsg(result.error);
        setStatus("error");
      }
    });
  }

  function handleClearZone() {
    startTransition(async () => {
      const result = await clearDeliveryZone();
      if (result.success) {
        existingPolyRef.current?.remove();
        existingPolyRef.current = null;
        clearDrawing();
        setStatus("cleared");
      } else {
        setErrorMsg(result.error);
        setStatus("error");
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        ref={containerRef}
        className="h-[500px] w-full overflow-hidden rounded-lg border border-herb/25"
      />

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-herb">
          {points.length === 0
            ? "Click the map to place zone vertices."
            : `${points.length} point${points.length !== 1 ? "s" : ""} placed${points.length >= 3 ? " — ready to save" : " — need at least 3"}`}
        </span>

        {points.length > 0 && (
          <button
            type="button"
            onClick={clearDrawing}
            disabled={isPending}
            className="tfb-btn-secondary w-auto px-3 py-1.5 text-sm disabled:opacity-50"
          >
            Clear drawing
          </button>
        )}

        {points.length >= 3 && (
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="tfb-btn-primary w-auto px-4 py-1.5 text-sm disabled:opacity-50"
          >
            {isPending ? "Saving…" : "Save zone"}
          </button>
        )}

        {(existingZone || status === "saved") && points.length === 0 && (
          <button
            type="button"
            onClick={handleClearZone}
            disabled={isPending}
            className="rounded-lg border border-rust/40 px-3 py-1.5 text-sm font-medium text-rust transition-opacity hover:opacity-70 disabled:opacity-50"
          >
            Remove zone
          </button>
        )}

        {status === "saved" && (
          <span className="text-sm font-medium text-herb">Zone saved.</span>
        )}
        {status === "cleared" && (
          <span className="text-sm font-medium text-warmgray">
            Zone removed. Falling back to ZIP list.
          </span>
        )}
        {status === "error" && errorMsg && (
          <span className="text-sm font-medium text-rust">{errorMsg}</span>
        )}
      </div>

      <p className="text-xs text-warmgray">
        The herb-green polygon is your current saved delivery zone. Terracotta
        outlines your new drawing. Drawing a new zone replaces the existing one.
      </p>
    </div>
  );
}
