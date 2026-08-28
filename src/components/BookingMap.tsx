"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import { MapContainer, Marker, Polyline, TileLayer, useMap } from "react-leaflet";

type Point = { lat: number; lng: number };

function dotIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="width:18px;height:18px;border-radius:9999px;background:${color};border:3px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

const workerIcon = dotIcon("#2563EB");
const destinationIcon = dotIcon("#111827");

function FitBounds({ points }: { points: Point[] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 14);
      return;
    }
    map.fitBounds(
      points.map((p) => [p.lat, p.lng] as [number, number]),
      { padding: [40, 40] }
    );
  }, [map, points]);
  return null;
}

export default function BookingMap({
  destination,
  workerPos,
  workerLabel,
  destinationLabel,
}: {
  destination: Point | null;
  workerPos: Point | null;
  workerLabel: string;
  destinationLabel: string;
}) {
  const points = [destination, workerPos].filter((p): p is Point => p !== null);

  if (points.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-100 text-sm text-gray-400">
        No location data yet
      </div>
    );
  }

  return (
    <MapContainer
      center={[points[0].lat, points[0].lng]}
      zoom={13}
      scrollWheelZoom
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds points={points} />
      {destination && (
        <Marker position={[destination.lat, destination.lng]} icon={destinationIcon} />
      )}
      {workerPos && <Marker position={[workerPos.lat, workerPos.lng]} icon={workerIcon} />}
      {destination && workerPos && (
        <Polyline
          positions={[
            [destination.lat, destination.lng],
            [workerPos.lat, workerPos.lng],
          ]}
          pathOptions={{ color: "#2563EB", dashArray: "6 8" }}
        />
      )}
      <MapLegend workerLabel={workerLabel} destinationLabel={destinationLabel} />
    </MapContainer>
  );
}

function MapLegend({
  workerLabel,
  destinationLabel,
}: {
  workerLabel: string;
  destinationLabel: string;
}) {
  return (
    <div className="pointer-events-none absolute bottom-2 left-2 z-[1000] rounded-md bg-white/95 px-2 py-1.5 text-xs shadow">
      <div className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> {workerLabel}
      </div>
      <div className="mt-0.5 flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-gray-900" /> {destinationLabel}
      </div>
    </div>
  );
}
