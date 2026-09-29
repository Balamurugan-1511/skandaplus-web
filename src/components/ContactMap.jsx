'use client';

import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

// Loaded from the CDN at runtime instead of bundling Leaflet's default
// marker icons — avoids the well-known Leaflet + Webpack broken-icon-path
// issue without needing extra build config.
const MARKER_ICON_URL = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const MARKER_SHADOW_URL = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

// Office coordinates — decoded from Plus Code MR5H+R3X, Bhosari Rd,
// Sector No. 11, Moshi, Pimpri-Chinchwad, Maharashtra 411070.
// Update these if the office ever moves.
const OFFICE_POSITION = [18.6596, 73.8277];

// Free, no API key, no billing account. Renders OpenStreetMap tiles inside
// a plain div using Leaflet's JS API directly (skips react-leaflet so there
// are no React-19-compatibility questions to worry about). Everything here
// only runs in the browser — this component must be loaded with
// `next/dynamic(..., { ssr: false })` from the page that uses it, since
// Leaflet needs `window`/`document` and will throw during server rendering.
export default function ContactMap() {
  const mapRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const L = (await import('leaflet')).default;
      if (cancelled || !containerRef.current || mapRef.current) return;

      const map = L.map(containerRef.current, {
        center: OFFICE_POSITION,
        zoom: 15,
        scrollWheelZoom: false, // stops the map hijacking page-scroll on hover
      });
      mapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const icon = L.icon({
        iconUrl: MARKER_ICON_URL,
        shadowUrl: MARKER_SHADOW_URL,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      L.marker(OFFICE_POSITION, { icon })
        .addTo(map)
        .bindPopup('SkandaPlus — Moshi, Pune')
        .openPopup();
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return <div ref={containerRef} className="w-full h-56 rounded-xl overflow-hidden" />;
}
