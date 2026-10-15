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

        // Ikon penanda bawaan Leaflet gagal dimuat oleh bundler (tampil sebagai gambar rusak "?"),
        // jadi penanda digambar sendiri dengan SVG sehingga tidak butuh berkas gambar.
        const pin = L.divIcon({
          className: "",
          iconSize: [28, 38],
          iconAnchor: [14, 38],
          popupAnchor: [0, -34],
          html: `<svg width="28" height="38" viewBox="0 0 28 38" aria-hidden="true">
            <path d="M14 1C7 1 1.5 6.4 1.5 13.2 1.5 22.6 14 37 14 37s12.5-14.4 12.5-23.8C26.5 6.4 21 1 14 1z" fill="#1D5A8C" stroke="#ffffff" stroke-width="2"/>
            <circle cx="14" cy="13.5" r="4.8" fill="#ffffff"/>
          </svg>`,
        });

        L.marker([-7.7956, 110.3695], { icon: pin, title: "Daerah Istimewa Yogyakarta", alt: "Penanda lokasi studi: Daerah Istimewa Yogyakarta" })
          .bindPopup(
            `<div class="text-center">
              <h3 class="font-bold">Daerah Istimewa Yogyakarta</h3>
              <p class="text-sm text-gray-600">Pusat Simulasi</p>
            </div>`
          )
          .addTo(map);

        fetch("/diy-boundary.geojson")
          .then((res) => res.json())
          .then((geojson) => {
            const boundary = L.geoJSON(geojson, {
              style: {
                color: "#1D5A8C",
                weight: 3,
                opacity: 0.9,
                fillColor: "#2BB3B6",
                fillOpacity: 0.08,
              },
            }).addTo(map);
            map.fitBounds(boundary.getBounds(), { padding: [20, 20] });
          })
          .catch((error) => console.error("Boundary load error:", error));

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
