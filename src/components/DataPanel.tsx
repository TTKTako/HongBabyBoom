"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useRef } from "react";
import type { Board, SensorReading } from "@/lib/mockData";
import {
  Thermometer,
  Droplets,
  Sun,
  Radar,
  Activity,
  Clock,
  Wifi,
  WifiOff,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronLeft,
  SmilePlus,
  AlertCircle,
  AlertTriangle,
  CalendarRange,
} from "lucide-react";

interface Props {
  board: Board | null;
  onClose?: () => void;
}

const COMFORT_CONFIG = {
  Comfortable: { color: "#22c55e", bg: "#22c55e15", icon: SmilePlus, label: "Comfortable" },
  Moderate:    { color: "#f97316", bg: "#f9731615", icon: AlertTriangle, label: "Moderate" },
  Uncomfortable: { color: "#ef4444", bg: "#ef444415", icon: AlertCircle, label: "Uncomfortable" },
};

/* โ”€โ”€ Time range options โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€ */
type RangeKey = "latest" | "1h" | "2h" | "5h" | "10h" | "1d" | "2d" | "30d" | "custom";

const RANGE_OPTIONS: { key: RangeKey; label: string }[] = [
  { key: "latest", label: "Latest" },
  { key: "1h",     label: "1 hr" },
  { key: "2h",     label: "2 hrs" },
  { key: "5h",     label: "5 hrs" },
  { key: "10h",    label: "10 hrs" },
  { key: "1d",     label: "1 day" },
  { key: "2d",     label: "2 days" },
  { key: "30d",    label: "30 days" },
  { key: "custom", label: "Custom" },
];

const RANGE_MS: Partial<Record<RangeKey, number>> = {
  "1h":  1 * 60 * 60 * 1000,
  "2h":  2 * 60 * 60 * 1000,
  "5h":  5 * 60 * 60 * 1000,
  "10h": 10 * 60 * 60 * 1000,
  "1d":  24 * 60 * 60 * 1000,
  "2d":  48 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
};

/* โ”€โ”€ Helpers โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€ */
function filterHistory(
  history: SensorReading[],
  range: RangeKey,
  customFrom: string,
  customTo: string
): SensorReading[] {
  if (range === "latest") return history.slice(-1);

  if (range === "custom") {
    if (!customFrom && !customTo) return history;
    const from = customFrom ? new Date(customFrom).getTime() : -Infinity;
    const to   = customTo   ? new Date(customTo).getTime()   : Infinity;
    return history.filter((r) => {
      const t = new Date(r.timestamp).getTime();
      return t >= from && t <= to;
    });
  }

  const ms = RANGE_MS[range];
  if (!ms) return history;
  const cutoff = Date.now() - ms;
  const filtered = history.filter((r) => new Date(r.timestamp).getTime() >= cutoff);
  // Always show at least the most recent entry so sparklines aren't empty
  return filtered.length > 0 ? filtered : history.slice(-1);
}

function MiniSparkline({
  values,
  timestamps,
  color,
  fmt,
}: {
  values: number[];
  timestamps?: string[];
  color: string;
  fmt?: (v: number) => string;
}) {
  const [hovIdx, setHovIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  if (values.length < 2) return (
    <div className="w-full h-8 flex items-center justify-center">
      <span className="text-[10px] text-[#374151]">Single reading</span>
    </div>
  );
  const min = Math.min(...values);
  const max = Math.max(...values);
  const vRange = max - min || 1;
  const w = 100;
  const h = 32;
  const pts = values.map((v, i) => ({
    x: (i / (values.length - 1)) * w,
    y: h - ((v - min) / vRange) * (h - 4) - 2,
  }));
  const ptsStr = pts.map((p) => `${p.x},${p.y}`).join(" ");
  const areaPath = `M${pts[0].x},${pts[0].y} L${ptsStr} L${w},${h} L0,${h} Z`;
  const gradId = `grad-${color.replace("#", "")}`;

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width;
    const idx = Math.round(relX * (values.length - 1));
    setHovIdx(Math.max(0, Math.min(values.length - 1, idx)));
  };

  const hovPt = hovIdx !== null ? pts[hovIdx] : null;
  const hovPct = hovIdx !== null ? (hovIdx / (values.length - 1)) * 100 : 0;

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${w} ${h}`}
        className="w-full h-8 cursor-crosshair"
        preserveAspectRatio="none"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHovIdx(null)}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#${gradId})`} />
        <polyline points={ptsStr} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        {hovPt && (
          <>
            <line x1={hovPt.x} y1="0" x2={hovPt.x} y2={h} stroke={color} strokeWidth="0.5" strokeOpacity="0.6" strokeDasharray="2,2" />
            <circle cx={hovPt.x} cy={hovPt.y} r="2.5" fill={color} />
          </>
        )}
      </svg>
      {hovIdx !== null && (
        <div
          className="absolute bottom-full mb-1.5 pointer-events-none z-10"
          style={{
            left: `${hovPct}%`,
            transform: `translateX(${hovPct < 65 ? "0%" : "-100%"})`,
          }}
        >
          <div className="bg-[#1f2937] border border-[#374151] rounded-lg px-2 py-1 text-[10px] whitespace-nowrap shadow-lg">
            <p className="font-semibold" style={{ color }}>
              {fmt ? fmt(values[hovIdx]) : values[hovIdx]}
            </p>
            {timestamps?.[hovIdx] && (
              <p className="text-[#6b7280]">{formatTime(timestamps[hovIdx])}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Trend({ values }: { values: number[] }) {
  if (values.length < 2) return <Minus className="w-3 h-3 text-[#6b7280]" />;
  const diff = values[values.length - 1] - values[values.length - 2];
  if (Math.abs(diff) < 0.1) return <Minus className="w-3 h-3 text-[#6b7280]" />;
  if (diff > 0) return <TrendingUp className="w-3 h-3 text-[#ef4444]" />;
  return <TrendingDown className="w-3 h-3 text-[#22c55e]" />;
}

function formatTime(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  } catch { return "--:--"; }
}

function formatRelative(iso: string) {
  try {
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  } catch { return "โ€”"; }
}

/* โ”€โ”€ Main component โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€โ”€ */
export default function DataPanel({ board, onClose }: Props) {
  const [range, setRange] = useState<RangeKey>("2h");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo,   setCustomTo]   = useState("");

  const filtered = useMemo(
    () => board ? filterHistory(board.history, range, customFrom, customTo) : [],
    [board, range, customFrom, customTo]
  );

  return (
    <div className="h-full flex flex-col bg-[#0d1117] border-l border-[#1f2937]">
      <AnimatePresence mode="wait">
        {!board ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8 text-center"
          >
            <div className="w-16 h-16 rounded-2xl border border-[#1f2937] bg-[#111827] flex items-center justify-center mb-4">
              <Wifi className="w-7 h-7 text-[#374151]" />
            </div>
            <p className="text-[#4b5563] text-sm">Select a board on the map<br />to view its details</p>
          </motion.div>
        ) : (
          <motion.div
            key={board.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-[#1f2937] flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {board.online ? (
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-[#22c55e] bg-[#22c55e]/10 px-2 py-0.5 rounded-full border border-[#22c55e]/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
                      Online
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-[#6b7280] bg-[#6b7280]/10 px-2 py-0.5 rounded-full border border-[#6b7280]/20">
                      <WifiOff className="w-3 h-3" />
                      Offline
                    </span>
                  )}
                </div>
                <h2 className="text-base font-bold text-white truncate">{board.room}</h2>
                <p className="text-xs text-[#6b7280]">{board.name}</p>
              </div>
              {onClose && (
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#1f2937] text-[#6b7280] hover:text-white transition-colors shrink-0">
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* โ”€โ”€ Time range selector โ”€โ”€ */}
            <div className="border-b border-[#1f2937] px-3 py-2.5">
              <div className="flex items-center gap-2">
                <CalendarRange className="w-3.5 h-3.5 text-[#22c55e] shrink-0" />
                <div className="relative flex-1">
                  <select
                    value={range}
                    onChange={(e) => setRange(e.target.value as RangeKey)}
                    className="w-full appearance-none bg-[#111827] border border-[#1f2937] text-[#9ca3af] text-xs rounded-lg px-2.5 py-1.5 pr-7 focus:outline-none focus:border-[#22c55e] transition-colors cursor-pointer"
                  >
                    {RANGE_OPTIONS.map((opt) => (
                      <option key={opt.key} value={opt.key} className="bg-[#111827]">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#4b5563]" viewBox="0 0 12 12" fill="none">
                    <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>

              {/* Custom date inputs */}
              <AnimatePresence>
                {range === "custom" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-2 grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-[#6b7280] mb-1">From</label>
                        <input
                          type="datetime-local"
                          value={customFrom}
                          onChange={(e) => setCustomFrom(e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg bg-[#0a0a0a] border border-[#1f2937] text-[#9ca3af] text-[10px] focus:outline-none focus:border-[#22c55e] transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-[#6b7280] mb-1">To</label>
                        <input
                          type="datetime-local"
                          value={customTo}
                          onChange={(e) => setCustomTo(e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg bg-[#0a0a0a] border border-[#1f2937] text-[#9ca3af] text-[10px] focus:outline-none focus:border-[#22c55e] transition-colors"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">

              {/* Comfort score โ€” always from current reading */}
              {(() => {
                const cfg = COMFORT_CONFIG[board.current.comfortScore];
                const Icon = cfg.icon;
                return (
                  <div className="rounded-xl border border-[#1f2937] p-4" style={{ background: cfg.bg }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-[#9ca3af]">Comfort Score</span>
                      <Icon className="w-4 h-4" style={{ color: cfg.color }} />
                    </div>
                    <p className="text-2xl font-bold mb-1" style={{ color: cfg.color }}>{cfg.label}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-[#1f2937] overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${board.current.confidence * 100}%`, background: cfg.color }} />
                      </div>
                      <span className="text-xs text-[#6b7280]">{Math.round(board.current.confidence * 100)}% conf.</span>
                    </div>
                  </div>
                );
              })()}

              {/* Range label */}
              {range !== "latest" && (
                <div className="flex items-center gap-2 text-[10px] text-[#374151]">
                  <CalendarRange className="w-3 h-3" />
                  <span>
                    {range === "custom"
                      ? `${customFrom || "any"} - ${customTo || "now"}`
                      : `${RANGE_OPTIONS.find(o => o.key === range)?.label} - ${filtered.length} reading${filtered.length !== 1 ? "s" : ""}`}
                  </span>
                </div>
              )}

              {/* Sensor readings */}
              {[
                {
                  icon: Thermometer, label: "Temperature", color: "#f97316",
                  current: `${board.current.temperature}°C`,
                  history: filtered.map((h) => h.temperature),
                  timestamps: filtered.map((h) => h.timestamp),
                  fmt: (v: number) => `${v.toFixed(1)}°C`,
                },
                {
                  icon: Droplets, label: "Humidity", color: "#38bdf8",
                  current: `${board.current.humidity}%`,
                  history: filtered.map((h) => h.humidity),
                  timestamps: filtered.map((h) => h.timestamp),
                  fmt: (v: number) => `${v.toFixed(0)}%`,
                },
                {
                  icon: Sun, label: "Light", color: "#facc15",
                  current: `${board.current.light} lx`,
                  history: filtered.map((h) => h.light),
                  timestamps: filtered.map((h) => h.timestamp),
                  fmt: (v: number) => `${v} lx`,
                },
              ].map((s) => {
                const Icon = s.icon;
                const min = s.history.length ? Math.min(...s.history) : null;
                const max = s.history.length ? Math.max(...s.history) : null;
                const rangeStr = min !== null && max !== null && s.history.length > 1
                  ? `${s.fmt(min)} - ${s.fmt(max)}`
                  : "";
                return (
                  <div key={s.label} className="rounded-xl border border-[#1f2937] bg-[#111827] p-4">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5" style={{ color: s.color }} />
                        <span className="text-xs text-[#9ca3af]">{s.label}</span>
                      </div>
                      <Trend values={s.history} />
                    </div>
                    <div className="flex items-end justify-between mb-2">
                      <p className="text-2xl font-bold text-white">{s.current}</p>
                      {rangeStr && <p className="text-[10px] text-[#4b5563] pb-0.5">{rangeStr}</p>}
                    </div>
                    <MiniSparkline values={s.history} timestamps={s.timestamps} color={s.color} fmt={s.fmt} />
                  </div>
                );
              })}

              {/* Motion */}
              <div className="rounded-xl border border-[#1f2937] bg-[#111827] p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Radar className="w-3.5 h-3.5 text-[#a78bfa]" />
                  <span className="text-xs text-[#9ca3af]">Motion</span>
                </div>
                <span className={`text-sm font-semibold ${board.current.motion ? "text-[#a78bfa]" : "text-[#4b5563]"}`}>
                  {board.current.motion ? "Detected" : "None"}
                </span>
              </div>

              {/* History table */}
              <div className="rounded-xl border border-[#1f2937] bg-[#111827] overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1f2937]">
                  <Activity className="w-3.5 h-3.5 text-[#22c55e]" />
                  <span className="text-xs font-semibold text-[#9ca3af]">
                    {range === "latest" ? "Latest Reading" : "History"}
                  </span>
                  <span className="ml-auto text-[10px] text-[#374151]">{filtered.length} record{filtered.length !== 1 ? "s" : ""}</span>
                </div>
                {filtered.length === 0 ? (
                  <div className="px-4 py-6 text-center text-xs text-[#374151]">No data for this period</div>
                ) : (
                  <div className="divide-y divide-[#1f2937] max-h-48 overflow-y-auto">
                    {[...filtered].reverse().map((r, i) => {
                      const cfg = COMFORT_CONFIG[r.comfortScore];
                      return (
                        <div key={i} className="px-4 py-2.5 flex items-center gap-3">
                          <Clock className="w-3 h-3 text-[#374151] shrink-0" />
                          <span className="text-[10px] text-[#4b5563] w-12 shrink-0">{formatTime(r.timestamp)}</span>
                          <span className="text-xs text-[#f97316] w-14">{r.temperature}°C</span>
                          <span className="text-xs text-[#38bdf8] w-10">{r.humidity}%</span>
                          <span className="text-[10px] font-semibold ml-auto" style={{ color: cfg.color }}>{r.comfortScore.slice(0, 6)}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Footer timestamp */}
            <div className="p-3 border-t border-[#1f2937] flex items-center gap-2">
              <Clock className="w-3 h-3 text-[#374151]" />
              <span className="text-[10px] text-[#4b5563]">Last updated {formatRelative(board.lastUpdated)}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
