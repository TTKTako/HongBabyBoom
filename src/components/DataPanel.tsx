"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Thermometer,
  Droplets,
  Sun,
  Radar,
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
  Loader2,
  Wind,
  ArrowUpRight,
  ArrowDownRight,
  Cloud,
} from "lucide-react";
import type { DashboardBoard } from "@/components/MapComponent";

export interface BoardSensorData {
  avg_temp:          number | null;
  avg_humidity:      number | null;
  avg_light:         number | null;
  motion_count:      number;
  reading_count:     number;
  outdoor_temp:      number | null;
  outdoor_humidity:  number | null;
  weather_condition: string | null;
  outdoor_fetched_at: string | null;
  delta_temp:        number | null; // indoor avg − outdoor (positive = indoor warmer)
  delta_humidity:    number | null;
  comfort_label: "Comfortable" | "Moderate" | "Uncomfortable" | null;
  model_confidence:  number | null;
  last_recorded_at:  string | null;
  is_historical?:    boolean;        // true when data is from an older 3-h window (board offline)
}

export interface HistoryPoint {
  time:             string;
  indoor_temp:      number | null;
  indoor_humidity:  number | null;
  outdoor_temp:     number | null;
  outdoor_humidity: number | null;
}

interface Props {
  board:    DashboardBoard | null;
  data:     BoardSensorData | null;
  loading:  boolean;
  history:  HistoryPoint[];
  historyLoading: boolean;
  onClose?: () => void;
}

const COMFORT_CONFIG = {
  Comfortable:   { color: "#22c55e", bg: "#22c55e15", icon: SmilePlus,     label: "Comfortable"   },
  Moderate:      { color: "#f97316", bg: "#f9731615", icon: AlertTriangle,  label: "Moderate"      },
  Uncomfortable: { color: "#ef4444", bg: "#ef444415", icon: AlertCircle,    label: "Uncomfortable" },
};

function DeltaBadge({ delta, unit }: { delta: number; unit: string }) {
  if (Math.abs(delta) < 0.05) {
    return (
      <span className="flex items-center gap-0.5 text-[10px] text-[#9ca3af]">
        <Minus className="w-3 h-3" /> Same
      </span>
    );
  }
  const warmer = delta > 0;
  return (
    <span
      className="flex items-center gap-0.5 text-[10px] font-semibold"
      style={{ color: warmer ? "#ef4444" : "#22c55e" }}
    >
      {warmer ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
      {Math.abs(delta).toFixed(1)}{unit} {warmer ? "warmer" : "cooler"}
    </span>
  );
}

function HumDeltaBadge({ delta }: { delta: number }) {
  if (Math.abs(delta) < 0.5) {
    return (
      <span className="flex items-center gap-0.5 text-[10px] text-[#9ca3af]">
        <Minus className="w-3 h-3" /> Same
      </span>
    );
  }
  const higher = delta > 0;
  return (
    <span
      className="flex items-center gap-0.5 text-[10px] font-semibold"
      style={{ color: higher ? "#38bdf8" : "#9ca3af" }}
    >
      {higher ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {Math.abs(delta).toFixed(1)}% {higher ? "higher" : "lower"}
    </span>
  );
}

function formatRelative(iso: string | null) {
  if (!iso) return "—";
  try {
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  } catch { return "—"; }
}

function formatHour(iso: string) {
  try {
    const d = new Date(iso);
    return `${d.getHours().toString().padStart(2, "0")}:00`;
  } catch { return iso; }
}

interface MiniChartProps {
  data: HistoryPoint[];
  metric: "temp" | "humidity";
}

function MiniChart({ data, metric }: MiniChartProps) {
  const indoorKey  = metric === "temp" ? "indoor_temp"      : "indoor_humidity";
  const outdoorKey = metric === "temp" ? "outdoor_temp"     : "outdoor_humidity";
  const unit       = metric === "temp" ? "°C"               : "%";
  const indoorColor  = metric === "temp" ? "#f97316" : "#38bdf8";
  const outdoorColor = "#22c55e";

  const chartData = data.map((p) => ({
    time:    p.time,
    Indoor:  p[indoorKey],
    TMD:     p[outdoorKey],
  }));

  // compute domain with 2-unit padding
  const vals = chartData.flatMap((p) => [p.Indoor, p.TMD]).filter((v): v is number => v != null);
  const minVal = vals.length ? Math.floor(Math.min(...vals)) - 2  : 0;
  const maxVal = vals.length ? Math.ceil(Math.max(...vals))  + 2  : 100;

  return (
    <ResponsiveContainer width="100%" height={130}>
      <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id={`grad-indoor-${metric}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={indoorColor}  stopOpacity={0.35} />
            <stop offset="95%" stopColor={indoorColor}  stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id={`grad-tmd-${metric}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={outdoorColor} stopOpacity={0.35} />
            <stop offset="95%" stopColor={outdoorColor} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="time"
          tickFormatter={formatHour}
          tick={{ fill: "#4b5563", fontSize: 9 }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[minVal, maxVal]}
          tick={{ fill: "#4b5563", fontSize: 9 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${v}${unit}`}
        />
        <Tooltip
          contentStyle={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 8, fontSize: 11 }}
          labelStyle={{ color: "#6b7280", marginBottom: 4 }}
          labelFormatter={(l) => formatHour(l as string)}
          formatter={(value, name) => [value != null ? `${(+value).toFixed(1)}${unit}` : "—", name as string]}
          itemStyle={{ color: "#d1d5db" }}
        />
        <Legend
          iconType="circle"
          iconSize={6}
          wrapperStyle={{ fontSize: 10, paddingTop: 4 }}
          formatter={(value) => <span style={{ color: "#9ca3af" }}>{value}</span>}
        />
        <Area
          type="monotone"
          dataKey="TMD"
          stroke={outdoorColor}
          strokeWidth={1.5}
          fill={`url(#grad-tmd-${metric})`}
          dot={false}
          activeDot={{ r: 3 }}
          connectNulls
        />
        <Area
          type="monotone"
          dataKey="Indoor"
          stroke={indoorColor}
          strokeWidth={1.5}
          fill={`url(#grad-indoor-${metric})`}
          dot={false}
          activeDot={{ r: 3 }}
          connectNulls
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default function DataPanel({ board, data, loading, history, historyLoading, onClose }: Props) {
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
            {/* ── Header ─────────────────────────────────────────────── */}
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
                <h2 className="text-base font-bold text-white truncate">{board.area_name}</h2>
                <p className="text-[10px] text-[#4b5563] font-mono mt-0.5 truncate">{board.board_token}</p>
              </div>
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-[#1f2937] text-[#6b7280] hover:text-white transition-colors shrink-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* ── Body ───────────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">

              {/* Loading spinner */}
              {loading && (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-6 h-6 text-[#22c55e] animate-spin" />
                </div>
              )}

              {!loading && !data && (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Cloud className="w-8 h-8 text-[#374151] mb-3" />
                  <p className="text-xs text-[#4b5563]">No sensor data recorded yet</p>
                </div>
              )}

              {!loading && data && (
                <>
                  {/* ── Comfort Score ─────────────────────────────────── */}
                  {data.comfort_label && (() => {
                    const cfg = COMFORT_CONFIG[data.comfort_label];
                    const Icon = cfg.icon;
                    return (
                      <div className="rounded-xl border border-[#1f2937] p-4" style={{ background: cfg.bg }}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-[#9ca3af]">Comfort Score</span>
                          <Icon className="w-4 h-4" style={{ color: cfg.color }} />
                        </div>
                        <p className="text-2xl font-bold" style={{ color: cfg.color }}>{cfg.label}</p>
                        <p className="text-[10px] text-[#4b5563] mt-1">Based on latest model scoring</p>
                      </div>
                    );
                  })()}

                  {/* ── Indoor 3h averages ────────────────────────────── */}
                  <div>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-[10px] font-semibold text-[#374151] uppercase tracking-wider">Indoor (3h avg)</span>
                      {data.reading_count > 0 && (
                        <span className="text-[10px] text-[#4b5563]">· {data.reading_count} readings</span>
                      )}
                      {data.is_historical && (
                        <span className="text-[9px] font-semibold text-[#f59e0b] bg-[#f59e0b]/10 border border-[#f59e0b]/20 px-1.5 py-0.5 rounded-full">
                          Last known snapshot
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      {/* Temperature */}
                      <div className="rounded-xl border border-[#1f2937] bg-[#111827] p-3 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#f97316]/10 flex items-center justify-center shrink-0">
                          <Thermometer className="w-4 h-4 text-[#f97316]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-[#6b7280]">Temperature</p>
                          <p className="text-xl font-bold text-white">
                            {data.avg_temp != null ? `${data.avg_temp.toFixed(1)}°C` : "—"}
                          </p>
                        </div>
                      </div>

                      {/* Humidity */}
                      <div className="rounded-xl border border-[#1f2937] bg-[#111827] p-3 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#38bdf8]/10 flex items-center justify-center shrink-0">
                          <Droplets className="w-4 h-4 text-[#38bdf8]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-[#6b7280]">Humidity</p>
                          <p className="text-xl font-bold text-white">
                            {data.avg_humidity != null ? `${data.avg_humidity.toFixed(0)}%` : "—"}
                          </p>
                        </div>
                      </div>

                      {/* Light */}
                      <div className="rounded-xl border border-[#1f2937] bg-[#111827] p-3 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#facc15]/10 flex items-center justify-center shrink-0">
                          <Sun className="w-4 h-4 text-[#facc15]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-[#6b7280]">Light</p>
                          <p className="text-xl font-bold text-white">
                            {data.avg_light != null ? `${data.avg_light.toFixed(0)} lx` : "—"}
                          </p>
                        </div>
                      </div>

                      {/* Motion */}
                      <div className="rounded-xl border border-[#1f2937] bg-[#111827] p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#a78bfa]/10 flex items-center justify-center shrink-0">
                            <Radar className="w-4 h-4 text-[#a78bfa]" />
                          </div>
                          <div>
                            <p className="text-[10px] text-[#6b7280]">Motion Events</p>
                            <p className="text-sm font-semibold text-white">{data.motion_count}</p>
                          </div>
                        </div>
                        <span className={`text-xs font-semibold ${data.motion_count > 0 ? "text-[#a78bfa]" : "text-[#374151]"}`}>
                          {data.motion_count > 0 ? "Activity" : "None"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ── Outdoor Comparison ────────────────────────────── */}
                  {(data.outdoor_temp != null || data.outdoor_humidity != null) && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Wind className="w-3 h-3 text-[#374151]" />
                        <span className="text-[10px] font-semibold text-[#374151] uppercase tracking-wider">
                          Outdoor (กรมอุตุฯ)
                        </span>
                        {data.outdoor_fetched_at && (
                          <span className="text-[10px] text-[#4b5563] ml-auto">
                            {formatRelative(data.outdoor_fetched_at)}
                          </span>
                        )}
                      </div>

                      <div className="rounded-xl border border-[#1f2937] bg-[#111827] overflow-hidden">
                        {/* Outdoor temp row */}
                        {data.outdoor_temp != null && (
                          <div className="px-4 py-3 flex items-center gap-3 border-b border-[#1f2937]">
                            <Thermometer className="w-4 h-4 text-[#f97316] shrink-0" />
                            <div className="flex-1">
                              <p className="text-[10px] text-[#6b7280]">Temperature</p>
                              <p className="text-base font-bold text-white">{data.outdoor_temp.toFixed(1)}°C</p>
                            </div>
                            {data.delta_temp != null && (
                              <DeltaBadge delta={data.delta_temp} unit="°C" />
                            )}
                          </div>
                        )}

                        {/* Outdoor humidity row */}
                        {data.outdoor_humidity != null && (
                          <div className="px-4 py-3 flex items-center gap-3 border-b border-[#1f2937] last:border-0">
                            <Droplets className="w-4 h-4 text-[#38bdf8] shrink-0" />
                            <div className="flex-1">
                              <p className="text-[10px] text-[#6b7280]">Humidity</p>
                              <p className="text-base font-bold text-white">{data.outdoor_humidity.toFixed(0)}%</p>
                            </div>
                            {data.delta_humidity != null && (
                              <HumDeltaBadge delta={data.delta_humidity} />
                            )}
                          </div>
                        )}

                        {/* Weather condition */}
                        {data.weather_condition && (
                          <div className="px-4 py-3 flex items-center gap-3">
                            <Cloud className="w-4 h-4 text-[#9ca3af] shrink-0" />
                            <div>
                              <p className="text-[10px] text-[#6b7280]">Condition</p>
                              <p className="text-sm font-medium text-[#d1d5db]">{data.weather_condition}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Comparison summary pills */}
                      {(data.delta_temp != null || data.delta_humidity != null) && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {data.delta_temp != null && (
                            <div className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-[#111827] border border-[#1f2937]">
                              <Thermometer className="w-3 h-3 text-[#f97316]" />
                              <span className="text-[#9ca3af]">Indoor is</span>
                              <span className="font-semibold" style={{ color: data.delta_temp > 0 ? "#ef4444" : "#22c55e" }}>
                                {Math.abs(data.delta_temp).toFixed(1)}°C {data.delta_temp > 0 ? "warmer" : "cooler"}
                              </span>
                            </div>
                          )}
                          {data.delta_humidity != null && (
                            <div className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-[#111827] border border-[#1f2937]">
                              <Droplets className="w-3 h-3 text-[#38bdf8]" />
                              <span className="text-[#9ca3af]">Humidity</span>
                              <span className="font-semibold" style={{ color: data.delta_humidity > 0 ? "#38bdf8" : "#9ca3af" }}>
                                {Math.abs(data.delta_humidity).toFixed(1)}% {data.delta_humidity > 0 ? "higher" : "lower"}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* ── Historical Charts ─────────────────────────────── */}
                  {(history.length > 0 || historyLoading) && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-3 h-3 text-[#374151]" />
                        <span className="text-[10px] font-semibold text-[#374151] uppercase tracking-wider">
                          24h Trend — Indoor vs TMD
                        </span>
                      </div>

                      {historyLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-5 h-5 text-[#22c55e] animate-spin" />
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {/* Temperature chart */}
                          <div className="rounded-xl border border-[#1f2937] bg-[#111827] p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Thermometer className="w-3 h-3 text-[#f97316]" />
                              <span className="text-[10px] font-semibold text-[#9ca3af]">Temperature (°C)</span>
                            </div>
                            <MiniChart data={history} metric="temp" />
                          </div>

                          {/* Humidity chart */}
                          <div className="rounded-xl border border-[#1f2937] bg-[#111827] p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Droplets className="w-3 h-3 text-[#38bdf8]" />
                              <span className="text-[10px] font-semibold text-[#9ca3af]">Humidity (%)</span>
                            </div>
                            <MiniChart data={history} metric="humidity" />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* ── Footer ─────────────────────────────────────────────── */}
            <div className="p-3 border-t border-[#1f2937] flex items-center gap-2">
              <Clock className="w-3 h-3 text-[#374151]" />
              <span className="text-[10px] text-[#4b5563]">
                {data?.last_recorded_at
                  ? `Last reading ${formatRelative(data.last_recorded_at)}`
                  : board.last_seen_at
                  ? `Last seen ${formatRelative(board.last_seen_at)}`
                  : "No readings yet"}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
