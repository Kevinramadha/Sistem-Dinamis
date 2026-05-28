"use client";

import { useEffect, useState } from "react";

export default function MapComponent() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    if (typeof window === "undefined" || !window.document) return;

    // Dynamic Leaflet import for client-side only
    import("leaflet").then((L) => {
      import("leaflet/dist/leaflet.css");

      const container = document.getElementById("map");
      if (!container || (container as any).leafletMap) return;

      try {
        const map = L.map(container, {
          center: [-7.7956, 110.3695],
          zoom: 10,
          scrollWheelZoom: true,
        });

        L.tileLayer(
          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
          }
        ).addTo(map);

        L.marker([-7.7956, 110.3695])
          .bindPopup(
            `<div class="text-center">
              <h3 class="font-bold">Daerah Istimewa Yogyakarta</h3>
              <p class="text-sm text-gray-600">Pusat Simulasi</p>
            </div>`
          )
          .addTo(map);

        (container as any).leafletMap = map;
      } catch (error) {
        console.error("Map error:", error);
      }
    });
  }, []);

  if (!mounted) {
    return <div className="w-full h-96 bg-gray-200 rounded flex items-center justify-center">Memuat peta...</div>;
  }

  return (
    <div
      id="map"
      className="w-full h-96 rounded-lg shadow"
      style={{ background: "#f0f0f0" }}
    />
  );
}
