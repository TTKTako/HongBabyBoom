"use client";

import { useEffect, useRef, useState } from "react";
import { Search, MapPin, Loader2, X } from "lucide-react";

interface Props {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number) => void;
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

const PIN_ICON_HTML = `<div style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50% 50% 50% 0;background:#22c55e;border:2px solid #fff;transform:rotate(-45deg);box-shadow:0 0 10px rgba(34,197,94,0.5);"><div style="width:8px;height:8px;border-radius:50%;background:#fff;transform:rotate(45deg);"></div></div>`;

export default function MapPicker({ lat, lng, onChange }: Props) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const leafletRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerRef  = useRef<any>(null);
  const onChangeRef = useRef(onChange);

  const [search, setSearch]       = useState("");
  const [results, setResults]     = useState<NominatimResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched]   = useState(false);

  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buildIcon = (L: any) =>
    L.divIcon({
      html:        PIN_ICON_HTML,
      className:   "",
      iconSize:    [28, 28],
      iconAnchor:  [14, 28],
      popupAnchor: [0, -32],
    });

  useEffect(() => {
    if (!mapContainerRef.current || leafletRef.current) return;

    const init = async () => {
      const L    = (await import("leaflet")).default;
      const icon = buildIcon(L);

      const initLat = lat ?? 13.7563;
      const initLng = lng ?? 100.5018;

      const map = L.map(mapContainerRef.current!, {
        center:             [initLat, initLng],
        zoom:               lat != null ? 15 : 10,
        zoomControl:        true,
        attributionControl: false,
      });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        subdomains: "abcd",
        maxZoom:    20,
      }).addTo(map);

      leafletRef.current = map;

      if (lat != null && lng != null) {
        const m = L.marker([lat, lng], { icon, draggable: true }).addTo(map);
        m.on("dragend", (e: { target: { getLatLng: () => { lat: number; lng: number } } }) => {
          const p = e.target.getLatLng();
          onChangeRef.current(p.lat, p.lng);
        });
        markerRef.current = m;
      }

      map.on("click", (e: { latlng: { lat: number; lng: number } }) => {
        const { lat: clat, lng: clng } = e.latlng;
        onChangeRef.current(clat, clng);
        if (markerRef.current) {
          markerRef.current.setLatLng([clat, clng]);
        } else {
          const m = L.marker([clat, clng], { icon, draggable: true }).addTo(map);
          m.on("dragend", (ev: { target: { getLatLng: () => { lat: number; lng: number } } }) => {
            const p = ev.target.getLatLng();
            onChangeRef.current(p.lat, p.lng);
          });
          markerRef.current = m;
        }
      });

      setTimeout(() => map.invalidateSize(), 100);
    };

    init();

    return () => {
      if (leafletRef.current) {
        leafletRef.current.remove();
        leafletRef.current = null;
        markerRef.current  = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!leafletRef.current || lat == null || lng == null) return;

    const sync = async () => {
      const L    = (await import("leaflet")).default;
      const icon = buildIcon(L);
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        const m = L.marker([lat, lng], { icon, draggable: true }).addTo(leafletRef.current);
        m.on("dragend", (e: { target: { getLatLng: () => { lat: number; lng: number } } }) => {
          const p = e.target.getLatLng();
          onChangeRef.current(p.lat, p.lng);
        });
        markerRef.current = m;
      }
      leafletRef.current.setView([lat, lng], 15, { animate: true });
    };

    sync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng]);

  const handleSearch = async () => {
    const q = search.trim();
    if (!q) return;
    setSearching(true);
    setResults([]);
    setSearched(false);
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=6`;
      const res  = await fetch(url, {
        headers: { "Accept-Language": "th,en", "User-Agent": "NestSense-Dashboard/1.0" },
      });
      const data: NominatimResult[] = await res.json();
      setResults(data);
    } catch {
      // silent
    } finally {
      setSearching(false);
      setSearched(true);
    }
  };

  const handleSelect = (r: NominatimResult) => {
    const newLat = parseFloat(r.lat);
    const newLng = parseFloat(r.lon);
    onChange(newLat, newLng);
    setSearch(r.display_name.split(",")[0]);
    setResults([]);
    setSearched(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#4b5563] pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); if (searched) setSearched(false); }}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search address or place name..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#111827] border border-[#1f2937] text-[#f0f0f0] placeholder-[#374151] focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/30 transition-all text-sm"
          />
        </div>
        <button
          type="button"
          onClick={handleSearch}
          disabled={searching || !search.trim()}
          className="px-4 py-2.5 rounded-xl bg-[#22c55e]/15 border border-[#22c55e]/20 text-[#22c55e] hover:bg-[#22c55e]/25 transition-colors disabled:opacity-40 flex items-center gap-1.5 text-xs font-medium whitespace-nowrap"
        >
          {searching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
          {searching ? "Searching..." : "Search"}
        </button>
      </div>

      {searched && results.length === 0 && (
        <p className="text-xs text-[#4b5563] text-center py-2">No results found.</p>
      )}

      {results.length > 0 && (
        <div className="rounded-xl border border-[#1f2937] bg-[#111827] overflow-hidden divide-y divide-[#1f2937]">
          <div className="flex items-center justify-between px-3 py-2 bg-[#0d1117]">
            <span className="text-[10px] text-[#4b5563]">
              {results.length} result{results.length !== 1 ? "s" : ""} -- click to set location
            </span>
            <button
              type="button"
              onClick={() => { setResults([]); setSearched(false); }}
              className="text-[#4b5563] hover:text-[#9ca3af] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          {results.map((r) => (
            <button
              key={r.place_id}
              type="button"
              onClick={() => handleSelect(r)}
              className="w-full px-3 py-2.5 text-left flex items-start gap-2.5 hover:bg-[#1f2937] transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-[#22c55e] shrink-0 mt-0.5" />
              <span className="text-xs text-[#9ca3af] leading-relaxed">{r.display_name}</span>
            </button>
          ))}
        </div>
      )}

      <div className="relative rounded-xl overflow-hidden border border-[#1f2937]" style={{ height: 220 }}>
        <div ref={mapContainerRef} className="w-full h-full" />
        {lat == null && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-[#0d1117]/80 rounded-xl border border-[#1f2937] px-3 py-2 text-xs text-[#6b7280] text-center">
              <MapPin className="w-4 h-4 mx-auto mb-1 text-[#374151]" />
              Click the map to place a marker
            </div>
          </div>
        )}
        <div className="absolute bottom-2 right-2 pointer-events-none bg-[#0d1117]/80 rounded-lg px-2 py-1 text-[10px] text-[#4b5563]">
          Drag pin to adjust
        </div>
      </div>

      {lat != null && lng != null && (
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#111827] border border-[#1f2937] text-[10px] text-[#4b5563]">
          <MapPin className="w-3 h-3 text-[#22c55e] shrink-0" />
          <span className="font-mono">{lat.toFixed(6)}, {lng.toFixed(6)}</span>
        </div>
      )}
    </div>
  );
}
