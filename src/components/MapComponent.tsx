import { useEffect, useRef } from "react";
import type { Board } from "@/lib/mockData";

interface Props {
  boards: Board[];
  selectedId: string | null;
  onBoardClick: (id: string) => void;
}

const COMFORT_COLOR: Record<string, string> = {
  Comfortable: "#22c55e",
  Moderate: "#f97316",
  Uncomfortable: "#ef4444",
};

export default function MapComponent({ boards, selectedId, onBoardClick }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const leafletRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<Record<string, any>>({});

  useEffect(() => {
    if (!mapRef.current || leafletRef.current) return;

    let L: typeof import("leaflet");

    const init = async () => {
      L = (await import("leaflet")).default;

      // Compute bounds from all boards so the map auto-fits
      const lats = boards.map((b) => b.lat);
      const lngs = boards.map((b) => b.lng);
      const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
      const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;

      const map = L.map(mapRef.current!, {
        center: [centerLat, centerLng],
        zoom: 15,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          subdomains: "abcd",
          maxZoom: 20,
        }
      ).addTo(map);

      leafletRef.current = map;

      // Add markers
      boards.forEach((board) => {
        const color = board.online
          ? COMFORT_COLOR[board.current.comfortScore]
          : "#6b7280";

        const markerHtml = `
          <div style="position:relative;width:36px;height:36px;cursor:pointer;">
            <!-- outer ring anim -->
            ${board.online ? `<div style="position:absolute;inset:-4px;border-radius:50%;border:2px solid ${color};opacity:0.4;animation:signal-ring 2s ease-out infinite;"></div>` : ""}
            <!-- bg circle -->
            <div style="
              width:36px;height:36px;border-radius:50%;
              background:${color}22;
              border:2px solid ${color};
              display:flex;align-items:center;justify-content:center;
              box-shadow:0 0 12px ${color}55;
            ">
              <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='${color}' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'>
                <path d='M5 12.55a11 11 0 0 1 14.08 0'/>
                <path d='M1.42 9a16 16 0 0 1 21.16 0'/>
                <path d='M8.53 16.11a6 6 0 0 1 6.95 0'/>
                <line x1='12' y1='20' x2='12.01' y2='20'/>
              </svg>
            </div>
          </div>
        `;

        const icon = L.divIcon({
          html: markerHtml,
          className: "",
          iconSize: [36, 36],
          iconAnchor: [18, 18],
          popupAnchor: [0, -22],
        });

        const popupContent = `
          <div style="font-family:system-ui,sans-serif;padding:2px;">
            <div style="font-weight:700;color:#f0f0f0;font-size:13px;margin-bottom:4px;">${board.room}</div>
            <div style="font-size:11px;color:#9ca3af;margin-bottom:8px;">${board.name} · ${board.online ? '<span style="color:#22c55e">Online</span>' : '<span style="color:#6b7280">Offline</span>'}</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;">
              <div style="background:#0d1117;border-radius:6px;padding:6px;">
                <div style="font-size:9px;color:#6b7280;margin-bottom:1px;">Temp</div>
                <div style="font-size:14px;font-weight:700;color:#f97316;">${board.current.temperature}°C</div>
              </div>
              <div style="background:#0d1117;border-radius:6px;padding:6px;">
                <div style="font-size:9px;color:#6b7280;margin-bottom:1px;">Humidity</div>
                <div style="font-size:14px;font-weight:700;color:#38bdf8;">${board.current.humidity}%</div>
              </div>
              <div style="background:#0d1117;border-radius:6px;padding:6px;">
                <div style="font-size:9px;color:#6b7280;margin-bottom:1px;">Light</div>
                <div style="font-size:14px;font-weight:700;color:#facc15;">${board.current.light} lx</div>
              </div>
              <div style="background:#0d1117;border-radius:6px;padding:6px;">
                <div style="font-size:9px;color:#6b7280;margin-bottom:1px;">Comfort</div>
                <div style="font-size:11px;font-weight:700;color:${color};">${board.current.comfortScore}</div>
              </div>
            </div>
          </div>
        `;

        const marker = L.marker([board.lat, board.lng], { icon })
          .addTo(map)
          .bindPopup(popupContent, {
            maxWidth: 200,
            className: "leaflet-dark-popup",
          });

        marker.on("click", () => onBoardClick(board.id));
        markersRef.current[board.id] = marker;
      });

      // Fit map to show all board markers with padding
      if (boards.length > 0) {
        const bounds = L.latLngBounds(boards.map((b) => [b.lat, b.lng] as [number, number]));
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 17 });
      }

      // Let the container fully render before invalidating size
      setTimeout(() => map.invalidateSize(), 100);
    };

    init();

    return () => {
      if (leafletRef.current) {
        leafletRef.current.remove();
        leafletRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Highlight selected marker
  useEffect(() => {
    if (!leafletRef.current || !selectedId) return;
    const marker = markersRef.current[selectedId];
    if (marker) {
      leafletRef.current.setView(marker.getLatLng(), 17, { animate: true });
      marker.openPopup();
    }
  }, [selectedId]);

  return (
    <div ref={mapRef} className="w-full h-full" />
  );
}
