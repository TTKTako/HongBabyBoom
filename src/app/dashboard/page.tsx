"use client";

import dynamic from "next/dynamic";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wifi,
  WifiOff,
  Activity,
  Layers,
  Thermometer,
  SmilePlus,
  AlertTriangle,
  AlertCircle,
  Plus,
  X,
  Cpu,
} from "lucide-react";
import DashboardNav from "@/components/DashboardNav";
import DataPanel from "@/components/DataPanel";
import { MOCK_BOARDS, STATS, type Board } from "@/lib/mockData";

// Dynamically import leaflet map with no SSR
const MapComponent = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#0d1117]">
      <div className="flex flex-col items-center gap-3">
        <svg className="animate-spin w-6 h-6 text-[#22c55e]" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span className="text-sm text-[#4b5563]">Loading map...</span>
      </div>
    </div>
  ),
});

const STAT_CARDS = [
  {
    label: "Total Boards",
    value: STATS.total,
    icon: Layers,
    color: "#9ca3af",
    desc: "Across all rooms",
  },
  {
    label: "Online",
    value: STATS.online,
    icon: Activity,
    color: "#22c55e",
    desc: "Operating normally",
  },
  {
    label: "Offline",
    value: STATS.offline,
    icon: WifiOff,
    color: "#ef4444",
    desc: "Requires attention",
  },
  {
    label: "Comfortable",
    value: STATS.comfortable,
    icon: SmilePlus,
    color: "#22c55e",
    desc: "Current comfort",
  },
];

function BoardListItem({
  board,
  selected,
  onClick,
}: {
  board: Board;
  selected: boolean;
  onClick: () => void;
}) {
  const scoreColor =
    board.current.comfortScore === "Comfortable"
      ? "#22c55e"
      : board.current.comfortScore === "Moderate"
      ? "#f97316"
      : "#ef4444";

  const ScoreIcon =
    board.current.comfortScore === "Comfortable"
      ? SmilePlus
      : board.current.comfortScore === "Moderate"
      ? AlertTriangle
      : AlertCircle;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2.5 rounded-xl border transition-all flex items-center gap-3 ${
        selected
          ? "border-[#22c55e]/40 bg-[#22c55e]/10"
          : "border-[#1f2937] bg-[#111827] hover:border-[#374151]"
      }`}
    >
      {/* Status dot */}
      <div
        className="w-2 h-2 rounded-full shrink-0"
        style={{ background: board.online ? "#22c55e" : "#ef4444" }}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-white truncate">{board.room}</p>
          <ScoreIcon className="w-3 h-3 shrink-0" style={{ color: scoreColor }} />
        </div>
        <div className="flex gap-3 mt-0.5">
          <span className="text-[10px] text-[#f97316]">
            <Thermometer className="inline w-2.5 h-2.5 mr-0.5" />
            {board.current.temperature}°C
          </span>
          <span className="text-[10px] text-[#38bdf8]">{board.current.humidity}%</span>
          {!board.online && <span className="text-[10px] text-[#6b7280]">Offline</span>}
        </div>
      </div>
    </button>
  );
}

interface NewBoardForm {
  kidbrightId: string;
  name: string;
}

function AddBoardModal({ onClose, onAdd }: { onClose: () => void; onAdd: (form: NewBoardForm) => void }) {
  const [form, setForm] = useState<NewBoardForm>({ kidbrightId: "", name: "" });
  const [error, setError] = useState("");
  const idRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    idRef.current?.focus();
  }, []);

  const update = (k: keyof NewBoardForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.kidbrightId.trim()) { setError("KidBright ID is required."); return; }
    if (!form.name.trim()) { setError("Board name is required."); return; }
    onAdd(form);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />
      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ type: "spring", duration: 0.35 }}
        className="relative w-full max-w-md rounded-2xl border border-[#1f2937] bg-[#0d1117] shadow-2xl shadow-black/60 overflow-hidden"
      >
        {/* Green top accent */}
        <div className="h-1 w-full bg-gradient-to-r from-[#22c55e]/0 via-[#22c55e] to-[#22c55e]/0" />

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#22c55e]/15 border border-[#22c55e]/20 flex items-center justify-center">
                <Cpu className="w-5 h-5 text-[#22c55e]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Add KidBright Board</h2>
                <p className="text-xs text-[#6b7280] mt-0.5">Link a new sensor node to your account</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#1f2937] text-[#6b7280] hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* KidBright ID */}
            <div>
              <label className="block text-sm text-[#9ca3af] mb-2">
                KidBright ID <span className="text-[#ef4444]">*</span>
              </label>
              <div className="relative">
                <Cpu className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4b5563]" />
                <input
                  ref={idRef}
                  type="text"
                  value={form.kidbrightId}
                  onChange={update("kidbrightId")}
                  placeholder="e.g. KB-00042"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#111827] border border-[#1f2937] text-[#f0f0f0] placeholder-[#374151] focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/30 transition-all text-sm font-mono"
                />
              </div>
              <p className="mt-1.5 text-[10px] text-[#4b5563]">The unique ID printed on the board label.</p>
            </div>

            {/* Board Name */}
            <div>
              <label className="block text-sm text-[#9ca3af] mb-2">
                Board Name <span className="text-[#ef4444]">*</span>
              </label>
              <div className="relative">
                <Wifi className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4b5563]" />
                <input
                  type="text"
                  value={form.name}
                  onChange={update("name")}
                  placeholder="e.g. Bedroom Sensor"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#111827] border border-[#1f2937] text-[#f0f0f0] placeholder-[#374151] focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/30 transition-all text-sm"
                />
              </div>
              <p className="mt-1.5 text-[10px] text-[#4b5563]">A friendly name to identify this board in your dashboard.</p>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[#ef4444] text-xs bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-lg px-3 py-2"
              >
                {error}
              </motion.p>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-[#1f2937] text-sm text-[#9ca3af] hover:border-[#374151] hover:text-white transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-[#22c55e] text-black text-sm font-semibold hover:bg-[#4ade80] transition-all shadow-lg shadow-[#22c55e]/20 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Board
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default function DashboardPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [boards, setBoards] = useState(MOCK_BOARDS);

  const selectedBoard = boards.find((b) => b.id === selectedId) ?? null;

  const handleAddBoard = ({ kidbrightId, name }: NewBoardForm) => {
    const newBoard = {
      ...MOCK_BOARDS[0],
      id: `board-${Date.now()}`,
      name: kidbrightId,
      room: name,
      online: false,
      lastUpdated: new Date().toISOString(),
    };
    setBoards((prev) => [...prev, newBoard]);
    setShowAddModal(false);
  };

  return (
    <div className="h-screen flex flex-col bg-[#0a0a0a] overflow-hidden">
      <DashboardNav />

      {/* Stat bar */}
      <div className="shrink-0 px-4 py-3 border-b border-[#1f2937] bg-[#0d1117]">
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
          {STAT_CARDS.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="shrink-0 flex items-center gap-3 px-4 py-2.5 rounded-xl border border-[#1f2937] bg-[#111827] min-w-[160px]"
                style={{ borderColor: s.color + "22" }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: s.color + "15" }}
                >
                  <Icon className="w-4 h-4" style={{ color: s.color }} />
                </div>
                <div>
                  <p className="text-xs text-[#6b7280]">{s.label}</p>
                  <p className="text-xl font-bold leading-tight" style={{ color: s.color }}>
                    {s.value}
                  </p>
                </div>
              </motion.div>
            );
          })}

          <div className="shrink-0 flex-1 hidden sm:flex items-center justify-end gap-2 text-xs text-[#4b5563]">
            <Wifi className="w-3 h-3" />
            <span>Mock data · refreshes on reload</span>
          </div>
        </div>
      </div>

      {/* Main content: map 70% | panel 30% */}
      <div className="flex-1 flex overflow-hidden">
        {/* Board selector sidebar (thin) */}
        <div className="hidden xl:flex w-56 shrink-0 flex-col border-r border-[#1f2937] bg-[#0d1117]">
          <div className="p-3 border-b border-[#1f2937] flex items-center justify-between">
            <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Boards</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="w-6 h-6 rounded-md bg-[#22c55e]/15 hover:bg-[#22c55e]/30 border border-[#22c55e]/20 flex items-center justify-center text-[#22c55e] transition-colors"
              title="Add new board"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {boards.map((b) => (
              <BoardListItem
                key={b.id}
                board={b}
                selected={selectedId === b.id}
                onClick={() => setSelectedId(selectedId === b.id ? null : b.id)}
              />
            ))}
          </div>
        </div>

        {/* Map (70%) — isolation:isolate keeps Leaflet's z-indexes from escaping this stacking context */}
        <div className="flex-1 relative overflow-hidden" style={{ isolation: "isolate" }}>
          <MapComponent
            boards={boards}
            selectedId={selectedId}
            onBoardClick={(id) => {
              setSelectedId(id);
              setShowSidebar(true);
            }}
          />

          {/* Mobile board list overlay button */}
          {!selectedId && (
            <div className="xl:hidden absolute bottom-4 left-4 right-4 flex gap-2 overflow-x-auto pb-1">
              {boards.map((b) => (
                <button
                  key={b.id}
                  onClick={() => {
                    setSelectedId(b.id);
                    setShowSidebar(true);
                  }}
                  className="shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl border border-[#1f2937] bg-[#0d1117]/90 backdrop-blur-sm text-xs text-white"
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: b.online ? "#22c55e" : "#ef4444" }}
                  />
                  {b.room}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Data panel (30%) */}
        <div
          className={`shrink-0 transition-all duration-300 ${
            showSidebar && selectedBoard ? "w-80 xl:w-[30%]" : "w-0 xl:w-80"
          } overflow-hidden`}
        >
          <div className="w-80 xl:w-full h-full">
            <DataPanel
              board={selectedBoard}
              onClose={() => {
                setSelectedId(null);
                setShowSidebar(false);
              }}
            />
          </div>
        </div>
      </div>

      {/* Add Board Modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddBoardModal
            onClose={() => setShowAddModal(false)}
            onAdd={handleAddBoard}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
