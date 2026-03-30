import { useEffect, useRef } from "react";

export interface DashboardBoard {
  id: number;
  area_name: string;
  board_token: string;
  lat: number;
  lng: number;
  online: boolean;
  last_seen_at: string | null;
  registered_at: string;
  latest_temp: number | null;
  latest_humidity: number | null;
  latest_comfort: "Comfortable" | "Moderate" | "Uncomfortable" | null;
}

interface Props {
  boards: DashboardBoard[];
  selectedId: number | null;
  onBoardClick: (id: number) => void;
}

const COMFORT_COLOR: Record<string, string> = {
  Comfortable:   "#22c55e",
  Moderate:      "#f97316",
  Uncomfortable: "#ef4444",
};

export default function MapComponent({ boards, selectedId, onBoardClick }: Props) {
  const mapRef     = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const leafletRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<Record<number, any>>({});

  useEffect(() => {
    if (!mapRef.current || leafletRef.current) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let L: any;

    const init = async () => {
      L = (await import("leaflet")).default;

      // Compute bounds from all boards so the map auto-fits
      const lats = boards.map((b) => b.lat);
      const lngs = boards.map((b) => b.lng);
      const centerLat = boards.length
        ? (Math.min(...lats) + Math.max(...lats)) / 2
        : 13.7563;
      const centerLng = boards.length
        ? (Math.min(...lngs) + Math.max(...lngs)) / 2
        : 100.5018;

      const map = L.map(mapRef.current!, {
        center: [centerLat, centerLng],
        zoom: 13,
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
          ? (board.latest_comfort ? COMFORT_COLOR[board.latest_comfort] : "#22c55e")
          : "#6b7280";

        const markerHtml = `
          <div style="position:relative;width:36px;height:36px;cursor:pointer;">
            ${board.online ? `<div style="position:absolute;top:-4px;left:-4px;right:-4px;bottom:-4px;border-radius:50%;border:2px solid ${color};opacity:0.4;animation:signal-ring 2s ease-out infinite;"></div>` : ""}
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

        const tempCell = board.latest_temp != null
          ? `<div style="background:#0d1117;border-radius:6px;padding:6px;">
               <div style="font-size:9px;color:#6b7280;margin-bottom:1px;">Temp</div>
               <div style="font-size:14px;font-weight:700;color:#f97316;">${board.latest_temp.toFixed(1)}°C</div>
             </div>`
          : "";
        const humCell = board.latest_humidity != null
          ? `<div style="background:#0d1117;border-radius:6px;padding:6px;">
               <div style="font-size:9px;color:#6b7280;margin-bottom:1px;">Humidity</div>
               <div style="font-size:14px;font-weight:700;color:#38bdf8;">${board.latest_humidity.toFixed(0)}%</div>
             </div>`
          : "";
        const comfortCell = board.latest_comfort
          ? `<div style="background:#0d1117;border-radius:6px;padding:6px;grid-column:span 2;">
               <div style="font-size:9px;color:#6b7280;margin-bottom:1px;">Comfort</div>
               <div style="font-size:11px;font-weight:700;color:${color};">${board.latest_comfort}</div>
             </div>`
          : "";
        const gridContent = tempCell || humCell || comfortCell
          ? `<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;">${tempCell}${humCell}${comfortCell}</div>`
          : `<div style="font-size:10px;color:#374151;">No readings yet</div>`;

        const popupContent = `
          <div style="font-family:system-ui,sans-serif;padding:2px;">
            <div style="font-weight:700;color:#f0f0f0;font-size:13px;margin-bottom:4px;">${board.area_name}</div>
            <div style="font-size:11px;color:#9ca3af;margin-bottom:8px;">
              ${board.online
                ? '<span style="color:#22c55e">● Online</span>'
                : '<span style="color:#6b7280">● Offline</span>'}
            </div>
            ${gridContent}
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
    if (!leafletRef.current || selectedId == null) return;
    const marker = markersRef.current[selectedId];
    if (marker) {
      leafletRef.current.setView(marker.getLatLng(), 17, { animate: true });
      marker.openPopup();
    }
  }, [selectedId]);

  return (
    <>
      <style>{`
        .leaflet-dark-popup .leaflet-popup-content-wrapper {
          background: #111827;
          border: 1px solid #1f2937;
          color: #f0f0f0;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.6);
        }
        .leaflet-dark-popup .leaflet-popup-tip { background: #111827; }
        .leaflet-dark-popup .leaflet-popup-close-button { color: #6b7280 !important; }
      `}</style>
      <div ref={mapRef} className="w-full h-full" />
    </>
  );
}
