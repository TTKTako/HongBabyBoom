"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Thermometer,
  Droplets,
  Sun,
  Radar,
  ShieldCheck,
  BarChart3,
  Map,
  Cpu,
  Wifi,
  ArrowRight,
  CheckCircle2,
  Activity,
  Lock,
  Layers,
  ChevronRight,
} from "lucide-react";
import AnimatedGrid from "@/components/AnimatedGrid";
import LandingNav from "@/components/LandingNav";

const FEATURES = [
  { icon: Thermometer, color: "#22c55e", title: "Real-time Temperature", desc: "Continuous temperature monitoring every 30 seconds, plotted over time to reveal patterns and anomalies in each room." },
  { icon: Droplets, color: "#38bdf8", title: "Humidity Tracking", desc: "Watch relative humidity levels to prevent mold, discomfort, and protect electronics with proactive alerts." },
  { icon: Sun, color: "#facc15", title: "Light Sensing", desc: "Ambient light data helps correlate comfort scores with natural light cycles and occupancy behavior." },
  { icon: Radar, color: "#a78bfa", title: "Motion Detection", desc: "Passive infrared motion detection tracks occupancy so the system can prioritize active rooms." },
  { icon: ShieldCheck, color: "#22c55e", title: "AI Comfort Scoring", desc: "A trained Random Forest model classifies each reading as Comfortable, Moderate, or Uncomfortable with a confidence score." },
  { icon: Map, color: "#f97316", title: "Spatial Dashboard", desc: "Geo-referenced boards are plotted on an interactive map so you can see your home environment at a glance." },
  { icon: BarChart3, color: "#22c55e", title: "Historical Analytics", desc: "Dive into rolling charts and trends for any board to understand how your rooms evolve throughout the day." },
  { icon: Wifi, color: "#38bdf8", title: "Zero-config WiFi Setup", desc: "The KidBright board creates its own hotspot on first boot. Enter your WiFi credentials once, and it handles the rest." },
];

const STEPS = [
  { icon: Cpu, step: "01", title: "Flash & Boot", desc: "Power on the KidBright board. It broadcasts a setup hotspot automatically." },
  { icon: Wifi, step: "02", title: "Connect & Configure", desc: "Join the hotspot, enter your home WiFi credentials on the onboard config page." },
  { icon: Lock, step: "03", title: "Register & Link", desc: "Create your NestSense account and link the board to a room in the web app." },
  { icon: Activity, step: "04", title: "Monitor Live", desc: "Readings flow every 30 seconds. Your dashboard lights up with real-time comfort data." },
];

const STATS = [
  { value: "30s", label: "Update interval" },
  { value: "4+", label: "Sensor types" },
  { value: "99%", label: "Model accuracy" },
  { value: "∞", label: "Rooms supported" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f0f0f0] overflow-x-hidden">
      <LandingNav />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0">
          <AnimatedGrid />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(34,197,94,0.07)_0%,transparent_65%)]" />
          <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(34,197,94,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.04) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full border border-[#22c55e]/30 bg-[#22c55e]/10 text-[#22c55e] text-sm font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22c55e]" />
            </span>
            Live Environmental Monitoring
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }} className="text-5xl md:text-7xl font-bold leading-tight tracking-tight mb-6">
            Your Home.{" "}
            <span className="text-[#22c55e] relative">
              Perfectly
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                <path d="M2 8 Q75 2, 150 8 Q225 14, 298 8" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.6" />
              </svg>
            </span>{" "}
            Monitored.
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="text-lg md:text-xl text-[#9ca3af] max-w-2xl mx-auto mb-10 leading-relaxed">
            NestSense connects KidBright sensors across every room in your home, delivering real-time temperature, humidity, light, and motion data — with AI-powered comfort scoring at every step.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35 }} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/login/signup" className="group flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#22c55e] text-black font-semibold hover:bg-[#4ade80] transition-all shadow-lg shadow-[#22c55e]/20 hover:shadow-[#22c55e]/40">
              Start Monitoring Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/login" className="flex items-center gap-2 px-7 py-3.5 rounded-xl border border-[#374151] text-[#9ca3af] hover:border-[#22c55e]/50 hover:text-white transition-all">
              Log in to Dashboard
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 border-y border-[#1f2937] bg-[#111827]/50">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}>
              <p className="text-4xl font-bold text-[#22c55e] mb-1">{s.value}</p>
              <p className="text-sm text-[#9ca3af]">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Preview card */}
      <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.5 }} className="relative max-w-4xl mx-auto my-10">
        <div className="absolute -inset-4 bg-[#22c55e]/5 rounded-3xl blur-2xl" />
        <div className="relative rounded-2xl border border-[#1f2937] bg-[#0d1117] overflow-hidden shadow-2xl text-left">

          {/* Browser chrome */}
          <div className="flex items-center gap-2 px-4 h-9 bg-[#0a0a0a] border-b border-[#1f2937]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#f97316]/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]/70" />
            <div className="ml-3 flex items-center gap-1.5 flex-1 max-w-xs">
              <div className="h-4 w-4 rounded bg-[#1f2937] flex items-center justify-center">
                <div className="w-2 h-2 rounded-full border border-[#374151]" />
              </div>
              <div className="flex-1 h-4 rounded bg-[#1f2937] flex items-center px-2 gap-1">
                <Wifi className="w-2.5 h-2.5 text-[#22c55e]" />
                <span className="text-[9px] text-[#4b5563]">nestsense.io/dashboard</span>
              </div>
            </div>
            <div className="ml-auto flex gap-3">
              <div className="h-4 w-12 rounded bg-[#1f2937]" />
              <div className="h-4 w-8 rounded bg-[#1f2937]" />
            </div>
          </div>

          {/* App nav */}
          <div className="flex items-center justify-between px-4 h-10 bg-[#0d1117] border-b border-[#1f2937]">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-[#22c55e]/20 flex items-center justify-center">
                <Wifi className="w-3 h-3 text-[#22c55e]" />
              </div>
              <span className="text-xs font-bold text-white">Nest<span className="text-[#22c55e]">Sense</span></span>
              <span className="text-[10px] text-[#374151] ml-1">/ Dashboard</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-[#1f2937]" />
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[#111827] border border-[#1f2937]">
                <div className="w-4 h-4 rounded-full bg-[#22c55e]/20 flex items-center justify-center"><span className="text-[7px] text-[#22c55e]">T</span></div>
                <span className="text-[9px] text-[#9ca3af]">test</span>
                <span className="text-[7px] px-1 rounded bg-[#38bdf8]/20 text-[#38bdf8]">User</span>
              </div>
              <div className="px-2 py-0.5 rounded-lg bg-[#ef4444]/20 border border-[#ef4444]/20">
                <span className="text-[8px] text-[#ef4444]">Logout</span>
              </div>
            </div>
          </div>

          {/* Stat bar */}
          <div className="flex gap-2 px-3 py-2 bg-[#0d1117] border-b border-[#1f2937]">
            {[{ label: "Total Boards", val: "6", color: "#9ca3af" }, { label: "Online", val: "5", color: "#22c55e" }, { label: "Offline", val: "1", color: "#ef4444" }, { label: "Comfortable", val: "4", color: "#22c55e" }].map((s) => (
              <div key={s.label} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border bg-[#111827] flex-1" style={{ borderColor: s.color + "22" }}>
                <div className="w-5 h-5 rounded flex items-center justify-center shrink-0" style={{ background: s.color + "20" }}>
                  <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                </div>
                <div>
                  <p className="text-[7px] text-[#6b7280] leading-tight">{s.label}</p>
                  <p className="text-sm font-bold leading-tight" style={{ color: s.color }}>{s.val}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Main area */}
          <div className="flex" style={{ height: "210px" }}>
            {/* Sidebar */}
            <div className="w-28 shrink-0 border-r border-[#1f2937] bg-[#0d1117] flex flex-col">
              <div className="flex items-center justify-between px-2 py-1.5 border-b border-[#1f2937]">
                <span className="text-[8px] font-semibold text-[#4b5563] uppercase tracking-wider">Boards</span>
                <div className="w-4 h-4 rounded bg-[#22c55e]/15 border border-[#22c55e]/20 flex items-center justify-center">
                  <span className="text-[#22c55e] text-[9px] font-bold leading-none">+</span>
                </div>
              </div>
              <div className="flex-1 p-1.5 space-y-1 overflow-hidden">
                {[
                  { room: "Living Room", temp: "26.4°C", online: true, score: "Comfortable", selected: true },
                  { room: "Bedroom", temp: "24.1°C", online: true, score: "Comfortable", selected: false },
                  { room: "Kitchen", temp: "29.3°C", online: true, score: "Uncomfortable", selected: false },
                  { room: "Study", temp: "25.8°C", online: false, score: "Moderate", selected: false },
                ].map((b) => (
                  <div key={b.room} className={`w-full text-left px-1.5 py-1 rounded-lg border flex items-center gap-1.5 ${b.selected ? "border-[#22c55e]/40 bg-[#22c55e]/10" : "border-[#1f2937] bg-[#111827]"}`}>
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: b.online ? "#22c55e" : "#ef4444" }} />
                    <div className="min-w-0">
                      <p className="text-[8px] font-medium text-white truncate">{b.room}</p>
                      <p className="text-[7px] text-[#f97316]">{b.temp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Map area */}
            <div className="flex-1 relative overflow-hidden bg-[#0d1117]">
              {/* Dark map grid */}
              <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(34,197,94,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.06) 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_40%_50%,rgba(10,10,20,0)_20%,rgba(5,5,10,0.6)_100%)]" />
              {/* Road-like lines */}
              <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 300 210" preserveAspectRatio="none">
                <path d="M0 80 Q80 75 150 90 Q220 105 300 95" stroke="#374151" strokeWidth="2" fill="none"/>
                <path d="M0 130 Q100 125 180 140 Q240 150 300 145" stroke="#374151" strokeWidth="1.5" fill="none"/>
                <path d="M120 0 Q125 50 130 105 Q133 155 135 210" stroke="#374151" strokeWidth="1.5" fill="none"/>
                <path d="M200 0 Q205 60 210 105 Q215 160 220 210" stroke="#374151" strokeWidth="1" fill="none"/>
              </svg>
              {/* Board markers */}
              {[
                { top: "32%", left: "28%", color: "#22c55e", label: "Living Room", selected: true },
                { top: "50%", left: "44%", color: "#22c55e", label: "Bedroom" },
                { top: "22%", left: "58%", color: "#ef4444", label: "Kitchen" },
                { top: "65%", left: "35%", color: "#6b7280", label: "Study" },
                { top: "42%", left: "68%", color: "#f97316", label: "Office" },
                { top: "72%", left: "62%", color: "#22c55e", label: "Garage" },
              ].map((m, i) => (
                <div key={i} className="absolute" style={{ top: m.top, left: m.left }}>
                  {m.selected && <div className="absolute -inset-2 rounded-full animate-ping" style={{ background: m.color + "30" }} />}
                  <div className="w-5 h-5 rounded-full flex items-center justify-center relative" style={{ background: m.color + "25", border: `1.5px solid ${m.color}` }}>
                    <Wifi className="w-2.5 h-2.5" style={{ color: m.color }} />
                  </div>
                  {m.selected && (
                    <div className="absolute left-6 top-0 bg-[#111827] border border-[#22c55e]/40 rounded-md px-1.5 py-0.5 whitespace-nowrap">
                      <p className="text-[8px] font-semibold text-[#22c55e]">{m.label}</p>
                      <p className="text-[7px] text-[#f97316]">26.4°C · 58%</p>
                    </div>
                  )}
                </div>
              ))}
              <div className="absolute bottom-2 right-2 flex flex-col gap-1">
                <div className="w-5 h-5 rounded bg-[#111827] border border-[#1f2937] flex items-center justify-center"><span className="text-[#6b7280] text-[10px]">+</span></div>
                <div className="w-5 h-5 rounded bg-[#111827] border border-[#1f2937] flex items-center justify-center"><span className="text-[#6b7280] text-[10px]">−</span></div>
              </div>
            </div>

            {/* Data panel */}
            <div className="w-36 shrink-0 border-l border-[#1f2937] bg-[#0d1117] flex flex-col overflow-hidden">
              {/* Panel header */}
              <div className="px-2 py-1.5 border-b border-[#1f2937]">
                <div className="flex items-center gap-1 mb-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
                  <span className="text-[7px] font-semibold text-[#22c55e]">Online</span>
                </div>
                <p className="text-[9px] font-bold text-white">Living Room</p>
                <p className="text-[7px] text-[#4b5563]">KidBright #1</p>
              </div>
              {/* Time range dropdown */}
              <div className="px-2 py-1 border-b border-[#1f2937] flex items-center gap-1">
                <div className="w-2.5 h-2.5 text-[#22c55e]"><Activity className="w-2.5 h-2.5 text-[#22c55e]"/></div>
                <div className="flex-1 h-4 rounded bg-[#111827] border border-[#1f2937] flex items-center px-1.5 justify-between">
                  <span className="text-[7px] text-[#6b7280]">2 hrs</span>
                  <ChevronRight className="w-2 h-2 text-[#374151] rotate-90" />
                </div>
              </div>
              {/* Comfort score */}
              <div className="mx-2 mt-1.5 rounded-lg p-1.5" style={{ background: "#22c55e15", border: "1px solid #22c55e30" }}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[7px] text-[#9ca3af]">Comfort</span>
                </div>
                <p className="text-[9px] font-bold text-[#22c55e] mb-1">Comfortable</p>
                <div className="h-1 rounded-full bg-[#1f2937] overflow-hidden">
                  <div className="h-full rounded-full bg-[#22c55e]" style={{ width: "94%" }} />
                </div>
                <p className="text-[6px] text-[#4b5563] mt-0.5 text-right">94% conf.</p>
              </div>
              {/* Sensor rows */}
              <div className="flex-1 px-2 py-1 space-y-1 overflow-hidden">
                {[
                  { label: "Temperature", val: "26.4°C", color: "#f97316", bars: [40, 55, 48, 60, 52, 58, 62, 59, 64, 60] },
                  { label: "Humidity", val: "58%", color: "#38bdf8", bars: [60, 58, 62, 55, 60, 57, 59, 61, 58, 60] },
                  { label: "Light", val: "620 lx", color: "#facc15", bars: [30, 45, 60, 70, 65, 75, 68, 72, 69, 71] },
                ].map((s) => (
                  <div key={s.label} className="rounded-lg bg-[#111827] border border-[#1f2937] p-1.5">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="text-[7px] text-[#6b7280]">{s.label}</span>
                      <span className="text-[8px] font-bold" style={{ color: s.color }}>{s.val}</span>
                    </div>
                    {/* Micro sparkline */}
                    <svg viewBox="0 0 60 12" className="w-full h-2.5" preserveAspectRatio="none">
                      <polyline
                        points={s.bars.map((v, i) => `${(i / (s.bars.length - 1)) * 60},${12 - (v / 100) * 10}`).join(" ")}
                        fill="none" stroke={s.color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-[#22c55e] text-sm font-semibold tracking-widest uppercase mb-3">Platform Features</p>
            <h2 className="text-4xl font-bold text-white mb-4">Everything you need to know<br />about your indoor climate</h2>
            <p className="text-[#9ca3af] max-w-xl mx-auto">A complete suite of environmental monitoring tools, powered by IoT hardware and machine learning.</p>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.3 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06, duration: 0.5 }} className="group relative rounded-2xl border border-[#1f2937] bg-[#111827] p-6 hover:border-[#22c55e]/40 transition-all cursor-default">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: f.color + "20" }}>
                    <Icon className="w-5 h-5" style={{ color: f.color }} />
                  </div>
                  <h3 className="font-semibold text-white mb-2 text-sm">{f.title}</h3>
                  <p className="text-[#9ca3af] text-xs leading-relaxed">{f.desc}</p>
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" style={{ background: `radial-gradient(circle at 50% 0%, ${f.color}08, transparent 70%)` }} />
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 px-6 bg-[#111827]/40 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-30" style={{ backgroundImage: "radial-gradient(circle, rgba(34,197,94,0.08) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-[#22c55e] text-sm font-semibold tracking-widest uppercase mb-3">Quick Setup</p>
            <h2 className="text-4xl font-bold text-white mb-4">Up and running in minutes</h2>
            <p className="text-[#9ca3af] max-w-lg mx-auto">From unboxing to live data — the entire setup process is guided and takes less than five minutes.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            <div className="absolute top-10 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#22c55e]/30 to-transparent hidden md:block" />
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div key={s.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }} className="flex flex-col items-center text-center">
                  <div className="relative mb-5">
                    <div className="w-20 h-20 rounded-2xl border border-[#22c55e]/30 bg-[#111827] flex items-center justify-center">
                      <Icon className="w-8 h-8 text-[#22c55e]" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#22c55e] text-black text-xs font-bold flex items-center justify-center">{parseInt(s.step)}</span>
                  </div>
                  <h3 className="font-semibold text-white mb-2">{s.title}</h3>
                  <p className="text-[#9ca3af] text-sm leading-relaxed">{s.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-24 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <p className="text-[#22c55e] text-sm font-semibold tracking-widest uppercase mb-4">The Platform</p>
            <h2 className="text-4xl font-bold text-white mb-6 leading-tight">Built on KidBright.<br /><span className="text-[#22c55e]">Powered by intelligence.</span></h2>
            <p className="text-[#9ca3af] leading-relaxed mb-8">Each KidBright node runs MicroPython on an ESP32, reading sensors every 30 seconds and pushing data over WiFi to our FastAPI backend. A pre-trained Random Forest classifier analyses each reading and returns a comfort label — with a rule-based fallback ensuring you always get a result.</p>
            <div className="space-y-3">
              {["Random Forest comfort classifier", "Rule-based fallback scoring", "MySQL data persistence", "FastAPI on Render cloud"].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#22c55e] flex-shrink-0" />
                  <span className="text-[#d1d5db] text-sm">{item}</span>
                </div>
              ))}
            </div>
            <Link href="/login/signup" className="group mt-8 inline-flex items-center gap-2 text-[#22c55e] font-medium text-sm hover:gap-3 transition-all">
              Get started now <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="grid grid-cols-2 gap-4">
            {[
              { icon: Thermometer, label: "Temperature", val: "26.4°C", color: "#f97316", sub: "±0.5°C accuracy" },
              { icon: Droplets, label: "Humidity", val: "58%", color: "#38bdf8", sub: "±2% RH" },
              { icon: Sun, label: "Light", val: "620 lx", color: "#facc15", sub: "0–1000 lux range" },
              { icon: Radar, label: "Motion", val: "Active", color: "#a78bfa", sub: "PIR detection" },
            ].map((c, i) => {
              const Icon = c.icon;
              return (
                <motion.div key={c.label} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="rounded-2xl border border-[#1f2937] bg-[#111827] p-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 rounded-bl-full opacity-10" style={{ background: c.color }} />
                  <Icon className="w-6 h-6 mb-3" style={{ color: c.color }} />
                  <p className="text-xs text-[#9ca3af] mb-1">{c.label}</p>
                  <p className="text-2xl font-bold text-white mb-1">{c.val}</p>
                  <p className="text-xs text-[#6b7280]">{c.sub}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-3xl mx-auto text-center">
          <div className="relative rounded-3xl border border-[#22c55e]/20 bg-gradient-to-br from-[#111827] to-[#0a0a0a] p-12 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(34,197,94,0.06)_0%,transparent_70%)]" />
            <div className="relative z-10">
              <Layers className="w-10 h-10 text-[#22c55e] mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white mb-4">Ready to understand your home?</h2>
              <p className="text-[#9ca3af] mb-8 max-w-md mx-auto">Register an account, link your KidBright boards, and watch your home come alive with data in minutes.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/login/signup" className="group flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#22c55e] text-black font-semibold hover:bg-[#4ade80] transition-all shadow-lg shadow-[#22c55e]/20">
                  Create Free Account
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/login" className="flex items-center justify-center px-8 py-3.5 rounded-xl border border-[#374151] text-[#9ca3af] hover:border-[#22c55e]/50 hover:text-white transition-all">
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1f2937] py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 text-[#22c55e]" />
            <span className="text-sm font-semibold text-white">Nest<span className="text-[#22c55e]">Sense</span></span>
          </div>
          <p className="text-xs text-[#6b7280]">Final Project — Data Acquisition · Kasetsart University · 2026</p>
          <div className="flex gap-6">
            <a href="#features" className="text-xs text-[#6b7280] hover:text-[#22c55e] transition-colors">Features</a>
            <Link href="/login" className="text-xs text-[#6b7280] hover:text-[#22c55e] transition-colors">Login</Link>
            <Link href="/login/signup" className="text-xs text-[#6b7280] hover:text-[#22c55e] transition-colors">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

