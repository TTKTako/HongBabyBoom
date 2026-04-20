"use client";

import dynamic from "next/dynamic";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
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
  Menu,
  MapPin,
  Camera,
  Upload,
  Loader2,
  ScanLine,
  CheckCircle2,
} from "lucide-react";
import DashboardNav from "@/components/DashboardNav";
import DataPanel, { type BoardSensorData, type HistoryPoint } from "@/components/DataPanel";
import type { DashboardBoard } from "@/components/MapComponent";

// ── Lazy-load heavy map components (no SSR) ──────────────────────────────────
const MapComponent = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#0d1117]">
      <div className="flex flex-col items-center gap-3">
        <svg className="animate-spin w-6 h-6 text-[#22c55e]" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span className="text-sm text-[#4b5563]">Loading map…</span>
      </div>
    </div>
  ),
});

const MapPicker = dynamic(() => import("@/components/MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="w-full rounded-xl border border-[#1f2937] bg-[#111827]" style={{ height: 200 }} />
  ),
});

// ── Types ─────────────────────────────────────────────────────────────────────
interface NewBoardForm {
  area_name:   string;
  board_token: string;
  lat:         number | null;
  lng:         number | null;
}

type TokenMode = "type" | "camera" | "upload";

// ── BoardListItem ─────────────────────────────────────────────────────────────
function BoardListItem({
  board,
  selected,
  onClick,
}: {
  board: DashboardBoard;
  selected: boolean;
  onClick: () => void;
}) {
  const comfortColor = board.latest_comfort
    ? ({ Comfortable: "#22c55e", Moderate: "#f97316", Uncomfortable: "#ef4444" } as Record<string, string>)[board.latest_comfort]
    : "#9ca3af";

  const ScoreIcon = board.latest_comfort === "Comfortable"
    ? SmilePlus
    : board.latest_comfort === "Moderate"
    ? AlertTriangle
    : board.latest_comfort === "Uncomfortable"
    ? AlertCircle
    : null;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2.5 rounded-xl border transition-all flex items-center gap-3 ${
        selected
          ? "border-[#22c55e]/40 bg-[#22c55e]/10"
          : "border-[#1f2937] bg-[#111827] hover:border-[#374151]"
      }`}
    >
      <div
        className="w-2 h-2 rounded-full shrink-0"
        style={{ background: board.online ? "#22c55e" : "#ef4444" }}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-white truncate">{board.area_name}</p>
          {ScoreIcon && <ScoreIcon className="w-3 h-3 shrink-0" style={{ color: comfortColor }} />}
        </div>
        <div className="flex gap-3 mt-0.5">
          {board.latest_temp != null && (
            <span className="text-[10px] text-[#f97316]">
              <Thermometer className="inline w-2.5 h-2.5 mr-0.5" />
              {board.latest_temp.toFixed(1)}°C
            </span>
          )}
          {board.latest_humidity != null && (
            <span className="text-[10px] text-[#38bdf8]">{board.latest_humidity.toFixed(0)}%</span>
          )}
          {!board.online && <span className="text-[10px] text-[#6b7280]">Offline</span>}
        </div>
      </div>
    </button>
  );
}

// ── AddBoardModal ─────────────────────────────────────────────────────────────
function AddBoardModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (form: NewBoardForm) => Promise<void>;
}) {
  const [form, setForm]           = useState<NewBoardForm>({ area_name: "", board_token: "", lat: null, lng: null });
  const [tokenMode, setTokenMode] = useState<TokenMode>("type");
  const [error, setError]         = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Camera state
  const videoRef        = useRef<HTMLVideoElement>(null);
  const scanTimerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const streamRef       = useRef<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState("");
  const [scanning, setScanning]       = useState(false);
  const [qrFound, setQrFound]         = useState(false);

  // File upload
  const fileInputRef   = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState("");

  // Stop camera when mode changes away
  useEffect(() => {
    if (tokenMode === "camera") {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenMode]);

  const stopCamera = useCallback(() => {
    if (scanTimerRef.current) { clearTimeout(scanTimerRef.current); scanTimerRef.current = null; }
    if (streamRef.current)    { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
    setScanning(false);
  }, []);

  const startCamera = async () => {
    setCameraError("");
    setQrFound(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setScanning(true);
        scheduleScan();
      }
    } catch {
      setCameraError("Cannot access camera. Please grant permission or use another method.");
    }
  };

  const scheduleScan = () => {
    scanTimerRef.current = setTimeout(scanFrame, 250);
  };

  const scanFrame = async () => {
    if (!videoRef.current || videoRef.current.readyState < 2) {
      scheduleScan();
      return;
    }
    const { default: jsQR } = await import("jsqr");
    const canvas = document.createElement("canvas");
    canvas.width  = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) { scheduleScan(); return; }
    ctx.drawImage(videoRef.current, 0, 0);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const result  = jsQR(imgData.data, imgData.width, imgData.height);
    if (result?.data) {
      setForm((f) => ({ ...f, board_token: result.data }));
      setQrFound(true);
      stopCamera();
      setTimeout(() => setTokenMode("type"), 800);
    } else {
      scheduleScan();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError("");
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement("canvas");
        canvas.width  = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const { default: jsQR } = await import("jsqr");
        const result = jsQR(imgData.data, imgData.width, imgData.height);
        if (result?.data) {
          setForm((f) => ({ ...f, board_token: result.data }));
          setTokenMode("type");
        } else {
          setUploadError("No QR code found in the image. Try a clearer photo.");
        }
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.area_name.trim())   { setError("Area name is required.");                 return; }
    if (!form.board_token.trim()) { setError("Board token is required.");               return; }
    if (form.lat == null || form.lng == null) { setError("Please pick a location on the map."); return; }
    setError("");
    setSubmitting(true);
    try {
      await onAdd(form);
      onClose();
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to add board.");
    } finally {
      setSubmitting(false);
    }
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
        className="relative w-full max-w-lg rounded-2xl border border-[#1f2937] bg-[#0d1117] shadow-2xl shadow-black/60 overflow-hidden max-h-[92vh] flex flex-col"
      >
        {/* Green accent top */}
        <div className="h-1 w-full bg-gradient-to-r from-[#22c55e]/0 via-[#22c55e] to-[#22c55e]/0 shrink-0" />

        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-[#1f2937] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#22c55e]/15 border border-[#22c55e]/20 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-[#22c55e]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Register New Board</h2>
              <p className="text-xs text-[#6b7280] mt-0.5">Link a sensor node to your account</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#1f2937] text-[#6b7280] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <form id="add-board-form" onSubmit={handleSubmit} className="space-y-5">

            {/* ── 1. Area name ─────────────────────────────────────── */}
            <div>
              <label className="block text-sm text-[#9ca3af] mb-2">
                Area Name <span className="text-[#ef4444]">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4b5563]" />
                <input
                  type="text"
                  value={form.area_name}
                  onChange={(e) => setForm((f) => ({ ...f, area_name: e.target.value }))}
                  placeholder="e.g. Living Room, Lab 301"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#111827] border border-[#1f2937] text-[#f0f0f0] placeholder-[#374151] focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/30 transition-all text-sm"
                  autoFocus
                />
              </div>
            </div>

            {/* ── 2. Board token ───────────────────────────────────── */}
            <div>
              <label className="block text-sm text-[#9ca3af] mb-2">
                Board Token <span className="text-[#ef4444]">*</span>
              </label>

              {/* Mode tabs */}
              <div className="flex rounded-xl overflow-hidden border border-[#1f2937] bg-[#111827] mb-3">
                {(["type", "camera", "upload"] as TokenMode[]).map((m) => {
                  const icons = { type: Cpu, camera: Camera, upload: Upload };
                  const labels = { type: "Type", camera: "Camera", upload: "Upload" };
                  const Icon = icons[m];
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => { setTokenMode(m); setUploadError(""); }}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-all ${
                        tokenMode === m
                          ? "bg-[#22c55e]/15 text-[#22c55e] border-b-2 border-[#22c55e]"
                          : "text-[#6b7280] hover:text-[#9ca3af]"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {labels[m]}
                    </button>
                  );
                })}
              </div>

              {/* Type mode */}
              {tokenMode === "type" && (
                <div className="relative">
                  <ScanLine className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4b5563]" />
                  <input
                    type="text"
                    value={form.board_token}
                    onChange={(e) => setForm((f) => ({ ...f, board_token: e.target.value }))}
                    placeholder="Paste or type board token"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#111827] border border-[#1f2937] text-[#f0f0f0] placeholder-[#374151] focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/30 transition-all text-sm font-mono"
                  />
                  {qrFound && (
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[#22c55e]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      QR code scanned successfully
                    </div>
                  )}
                </div>
              )}

              {/* Camera mode */}
              {tokenMode === "camera" && (
                <div className="space-y-2">
                  {cameraError ? (
                    <div className="rounded-xl border border-[#ef4444]/30 bg-[#ef4444]/10 p-4 text-xs text-[#ef4444] text-center">
                      {cameraError}
                    </div>
                  ) : (
                    <div className="relative rounded-xl overflow-hidden border border-[#1f2937] bg-black" style={{ height: 220 }}>
                      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                      <video
                        ref={videoRef}
                        className="w-full h-full object-cover"
                        playsInline
                        muted
                      />
                      {scanning && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <div className="border-2 border-[#22c55e]/60 rounded-xl w-40 h-40 relative">
                            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#22c55e] rounded-tl-lg" />
                            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[#22c55e] rounded-tr-lg" />
                            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[#22c55e] rounded-bl-lg" />
                            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#22c55e] rounded-br-lg" />
                            <div className="absolute left-0 right-0 border-t border-[#22c55e]/50 animate-[scan_2s_linear_infinite]" style={{ top: "50%" }} />
                          </div>
                          <p className="text-[10px] text-[#22c55e]/70 mt-2">Point at QR code</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Upload mode */}
              {tokenMode === "upload" && (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-8 rounded-xl border-2 border-dashed border-[#1f2937] bg-[#111827] hover:border-[#22c55e]/40 hover:bg-[#22c55e]/5 transition-all flex flex-col items-center gap-2 text-[#6b7280] hover:text-[#9ca3af]"
                  >
                    <Upload className="w-6 h-6" />
                    <span className="text-xs">Click to upload a QR code image</span>
                  </button>
                  {uploadError && (
                    <p className="mt-2 text-[11px] text-[#ef4444]">{uploadError}</p>
                  )}
                </div>
              )}
            </div>

            {/* ── 3. Location (map picker) ─────────────────────────── */}
            <div>
              <label className="block text-sm text-[#9ca3af] mb-2">
                Location <span className="text-[#ef4444]">*</span>
              </label>
              <MapPicker
                lat={form.lat}
                lng={form.lng}
                onChange={(lat, lng) => setForm((f) => ({ ...f, lat, lng }))}
              />
              {form.lat == null && (
                <p className="mt-1.5 text-[10px] text-[#4b5563]">
                  Search for an address or click the map to pin the board location.
                </p>
              )}
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
          </form>
        </div>

        {/* Footer actions */}
        <div className="flex gap-3 px-6 py-4 border-t border-[#1f2937] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-[#1f2937] text-sm text-[#9ca3af] hover:border-[#374151] hover:text-white transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="add-board-form"
            disabled={submitting}
            className="flex-1 py-2.5 rounded-xl bg-[#22c55e] text-black text-sm font-semibold hover:bg-[#4ade80] transition-all shadow-lg shadow-[#22c55e]/20 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {submitting
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Registering…</>
              : <><Plus className="w-4 h-4" /> Register Board</>
            }
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();

  const [boards, setBoards]               = useState<DashboardBoard[]>([]);
  const [loadingBoards, setLoadingBoards] = useState(true);
  const [selectedId, setSelectedId]       = useState<number | null>(null);
  const [selectedData, setSelectedData]   = useState<BoardSensorData | null>(null);
  const [loadingData, setLoadingData]     = useState(false);
  const [history, setHistory]             = useState<HistoryPoint[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showSidebar, setShowSidebar]     = useState(false);
  const [showAddModal, setShowAddModal]   = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // ── Auth guard + initial boards load ──────────────────────────────────────
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => {
        if (!r.ok) { router.replace("/login"); return null; }
        return r.json();
      })
      .then((me) => {
        if (!me) return;
        return fetch("/api/dashboard/boards")
          .then((r) => (r.ok ? r.json() : []))
          .then((data: DashboardBoard[]) => setBoards(data));
      })
      .catch(() => router.replace("/login"))
      .finally(() => setLoadingBoards(false));
  }, [router]);

  // ── Load detailed data when a board is selected ────────────────────────────
  useEffect(() => {
    if (selectedId == null) { setSelectedData(null); return; }
    setLoadingData(true);
    setSelectedData(null);
    fetch(`/api/dashboard/boards/${selectedId}/data`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data) setSelectedData(data); })
      .catch(console.error)
      .finally(() => setLoadingData(false));
  }, [selectedId]);

  // ── Load history (24h timeline) when a board is selected ──────────────────
  useEffect(() => {
    if (selectedId == null) { setHistory([]); return; }
    setHistoryLoading(true);
    setHistory([]);
    fetch(`/api/dashboard/boards/${selectedId}/history?hours=24`)
      .then((r) => (r.ok ? r.json() : { timeline: [] }))
      .then((d) => setHistory(d.timeline ?? []))
      .catch(console.error)
      .finally(() => setHistoryLoading(false));
  }, [selectedId]);

  const handleAddBoard = async (form: NewBoardForm) => {
    const res = await fetch("/api/dashboard/boards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        area_name:   form.area_name,
        board_token: form.board_token,
        lat:         form.lat,
        lng:         form.lng,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(err.error || "Failed to register board.");
    }
    // Refresh board list
    const fresh: DashboardBoard[] = await fetch("/api/dashboard/boards").then((r) => r.json());
    setBoards(fresh);
  };

  const closePanel = () => {
    setSelectedId(null);
    setShowSidebar(false);
  };

  const selectedBoard = boards.find((b) => b.id === selectedId) ?? null;

  const online  = boards.filter((b) => b.online).length;
  const offline = boards.length - online;

  const statCards = [
    { label: "Total Boards", value: boards.length, icon: Layers,   color: "#9ca3af", desc: "Registered boards" },
    { label: "Online",       value: online,         icon: Activity, color: "#22c55e", desc: "Responding"        },
    { label: "Offline",      value: offline,        icon: WifiOff,  color: "#ef4444", desc: "No signal"         },
  ];

  return (
    <div className="h-screen flex flex-col bg-[#0a0a0a] overflow-hidden">
      <DashboardNav />

      {/* ── Stat bar ─────────────────────────────────────────────── */}
      <div className="shrink-0 px-3 py-2 border-b border-[#1f2937] bg-[#0d1117]">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide items-center">
          {statCards.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl border border-[#1f2937] bg-[#111827] min-w-[130px] sm:min-w-[150px]"
                style={{ borderColor: s.color + "22" }}
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: s.color + "15" }}>
                  <Icon className="w-3.5 h-3.5" style={{ color: s.color }} />
                </div>
                <div>
                  <p className="text-[10px] text-[#6b7280]">{s.label}</p>
                  <p className="text-lg font-bold leading-tight" style={{ color: s.color }}>
                    {loadingBoards ? "—" : s.value}
                  </p>
                </div>
              </motion.div>
            );
          })}

          {/* Mobile: Boards + Add buttons */}
          <div className="shrink-0 flex gap-2 lg:hidden ml-1">
            <button
              onClick={() => setShowMobileSidebar(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#1f2937] bg-[#111827] text-[#9ca3af] text-xs hover:border-[#374151] transition-colors whitespace-nowrap"
            >
              <Menu className="w-3.5 h-3.5" />
              Boards
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#22c55e]/30 bg-[#22c55e]/10 text-[#22c55e] text-xs hover:bg-[#22c55e]/20 transition-colors whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          </div>

          <div className="shrink-0 flex-1 hidden sm:flex items-center justify-end gap-2 text-xs text-[#4b5563] min-w-[140px]">
            <Wifi className="w-3 h-3" />
            <span className="hidden md:inline">3-hour average · realtime</span>
          </div>
        </div>
      </div>

      {/* ── Main content ────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* Board sidebar (lg+) */}
        <div className="hidden lg:flex w-56 shrink-0 flex-col border-r border-[#1f2937] bg-[#0d1117]">
          <div className="p-3 border-b border-[#1f2937] flex items-center justify-between">
            <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Boards</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="w-6 h-6 rounded-md bg-[#22c55e]/15 hover:bg-[#22c55e]/30 border border-[#22c55e]/20 flex items-center justify-center text-[#22c55e] transition-colors"
              title="Register new board"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {loadingBoards ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 text-[#22c55e] animate-spin" />
              </div>
            ) : boards.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center px-3">
                <Cpu className="w-8 h-8 text-[#374151] mb-2" />
                <p className="text-[11px] text-[#4b5563]">No boards registered yet</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-3 text-[11px] text-[#22c55e] hover:underline"
                >
                  + Add your first board
                </button>
              </div>
            ) : (
              boards.map((b) => (
                <BoardListItem
                  key={b.id}
                  board={b}
                  selected={selectedId === b.id}
                  onClick={() => setSelectedId(selectedId === b.id ? null : b.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* Map area */}
        <div className="flex-1 relative overflow-hidden" style={{ isolation: "isolate" }}>
          <MapComponent
            key={boards.length}
            boards={boards}
            selectedId={selectedId}
            onBoardClick={(id) => {
              setSelectedId(id);
              setShowSidebar(true);
            }}
          />

          {/* Mobile: board chip row (when no panel open) */}
          {!selectedId && boards.length > 0 && (
            <div className="lg:hidden absolute bottom-4 left-3 right-3 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {boards.map((b) => (
                <button
                  key={b.id}
                  onClick={() => { setSelectedId(b.id); setShowSidebar(true); }}
                  className="shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl border border-[#1f2937] bg-[#0d1117]/90 text-xs text-white whitespace-nowrap"
                >
                  <div className="w-2 h-2 rounded-full" style={{ background: b.online ? "#22c55e" : "#ef4444" }} />
                  {b.area_name}
                </button>
              ))}
            </div>
          )}

          {/* Mobile: close hint when panel open */}
          {selectedId != null && (
            <button
              onClick={closePanel}
              className="lg:hidden absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#1f2937] bg-[#0d1117]/90 text-xs text-[#9ca3af] z-10"
            >
              <X className="w-3 h-3" />
              Close
            </button>
          )}
        </div>

        {/* Desktop data panel */}
        <div
          className={`hidden md:block shrink-0 transition-all duration-300 overflow-hidden ${
            showSidebar && selectedBoard ? "w-80 lg:w-[30%]" : "w-0 lg:w-80"
          }`}
        >
          <div className="w-80 lg:w-full h-full">
            <DataPanel
              board={selectedBoard}
              data={selectedData}
              loading={loadingData}
              history={history}
              historyLoading={historyLoading}
              onClose={closePanel}
            />
          </div>
        </div>

        {/* Mobile bottom sheet */}
        <AnimatePresence>
          {selectedBoard && (
            <motion.div
              key="mobile-panel"
              className="md:hidden absolute bottom-0 left-0 right-0 z-[200] rounded-t-2xl overflow-hidden border-t border-[#1f2937] shadow-2xl"
              style={{ height: "65vh" }}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 320 }}
            >
              <div className="flex justify-center items-center py-2 bg-[#0d1117] border-b border-[#1f2937]">
                <div className="w-8 h-1 rounded-full bg-[#374151]" />
              </div>
              <div className="h-full overflow-y-auto">
                <DataPanel
                  board={selectedBoard}
                  data={selectedData}
                  loading={loadingData}
                  history={history}
                  historyLoading={historyLoading}
                  onClose={closePanel}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile board list drawer */}
      <AnimatePresence>
        {showMobileSidebar && (
          <div className="lg:hidden fixed inset-0 z-[9998]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70"
              onClick={() => setShowMobileSidebar(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute left-0 top-0 bottom-0 w-72 bg-[#0d1117] border-r border-[#1f2937] flex flex-col"
            >
              <div className="p-4 border-b border-[#1f2937] flex items-center justify-between">
                <p className="text-sm font-semibold text-white">Boards</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setShowMobileSidebar(false); setShowAddModal(true); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#22c55e]/30 bg-[#22c55e]/10 text-[#22c55e] text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </button>
                  <button
                    onClick={() => setShowMobileSidebar(false)}
                    className="p-1.5 rounded-lg bg-[#111827] border border-[#1f2937] text-[#6b7280]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {boards.map((b) => (
                  <BoardListItem
                    key={b.id}
                    board={b}
                    selected={selectedId === b.id}
                    onClick={() => {
                      setSelectedId(selectedId === b.id ? null : b.id);
                      setShowSidebar(true);
                      setShowMobileSidebar(false);
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
