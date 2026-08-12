"use client";

import dynamic from "next/dynamic";
import type { GeoJsonPolygon } from "@/lib/data/menu";
import "leaflet/dist/leaflet.css";

const ZoneEditorMap = dynamic(() => import("./ZoneEditorMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[500px] w-full items-center justify-center rounded-lg border border-herb bg-midsage/30">
      <span className="text-sm text-warmgray">Loading map…</span>
    </div>
  ),
});

type Props = {
  existingZone: GeoJsonPolygon | null;
};

export default function ZoneEditor({ existingZone }: Props) {
  return <ZoneEditorMap existingZone={existingZone} />;
}
