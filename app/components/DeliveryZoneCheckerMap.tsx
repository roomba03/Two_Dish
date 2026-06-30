"use client";

import { useEffect, useRef } from "react";
import type { GeoJsonPolygon } from "@/lib/data/menu";

type Props = {
  zone: GeoJsonPolygon | null;
  resultPoint: [number, number] | null; // [lat, lng]
  resultInZone: boolean | null;
};

export default function DeliveryZoneCheckerMap({
  zone,
  resultPoint,
  resultInZone,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const markerRef = useRef<import("leaflet").CircleMarker | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let cancelled = false;

    import("leaflet").then((L) => {
      if (cancelled || !containerRef.current) return;

      const map = L.map(containerRef.current, {
        center: [38.853, -94.678],
        zoom: 12,
        scrollWheelZoom: false,
        zoomControl: true,
      });
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      if (zone) {
        const latLngs = zone.coordinates[0].map(
          ([lng, lat]) => [lat, lng] as [number, number]
        );
        const poly = L.polygon(latLngs, {
          color: "#C4622D",
          weight: 2,
          fillColor: "#C4622D",
          fillOpacity: 0.14,
        }).addTo(map);
        map.fitBounds(poly.getBounds(), { padding: [32, 32] });
      }
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Drop / update result marker whenever the geocoded point changes
  useEffect(() => {
    if (!mapRef.current) return;

    if (!resultPoint) {
      markerRef.current?.remove();
      markerRef.current = null;
      return;
    }

    import("leaflet").then((L) => {
      if (!mapRef.current) return;
      markerRef.current?.remove();

      const color = resultInZone ? "#16a34a" : "#dc2626";
      markerRef.current = L.circleMarker(resultPoint, {
        radius: 9,
        color,
        fillColor: color,
        fillOpacity: 0.9,
        weight: 3,
      }).addTo(mapRef.current);

      mapRef.current.flyTo(resultPoint, Math.max(mapRef.current.getZoom(), 14), {
        animate: true,
        duration: 0.6,
      });
    });
  }, [resultPoint, resultInZone]);

  return (
    <div
      ref={containerRef}
      style={{ height: "100%", width: "100%", borderRadius: "inherit" }}
    />
  );
}
