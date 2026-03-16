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

          {/* Preview card */}
          <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.5 }} className="relative max-w-4xl mx-auto">
            <div className="absolute -inset-4 bg-[#22c55e]/5 rounded-3xl blur-2xl" />
            <div className="relative rounded-2xl border border-[#1f2937] bg-[#111827] overflow-hidden shadow-2xl">
              <div className="flex items-center gap-2 px-4 h-10 bg-[#0d1117] border-b border-[#1f2937]">
                <span className="w-3 h-3 rounded-full bg-[#ef4444]/60" />
                <span className="w-3 h-3 rounded-full bg-[#f97316]/60" />
                <span className="w-3 h-3 rounded-full bg-[#22c55e]/60" />
                <div className="ml-4 flex-1 h-5 rounded-md bg-[#1f2937] max-w-xs" />
              </div>
              <div className="p-4 grid grid-cols-3 gap-3">
                {[{ label: "Total Boards", value: "6", color: "#9ca3af" }, { label: "Online", value: "5", color: "#22c55e" }, { label: "Offline", value: "1", color: "#ef4444" }].map((s) => (
                  <div key={s.label} className="rounded-xl p-3 border border-[#1f2937] bg-[#0d1117]">
                    <p className="text-xs text-[#9ca3af] mb-1">{s.label}</p>
                    <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
                  </div>
                ))}
                <div className="col-span-2 rounded-xl border border-[#1f2937] bg-[#0d1117] h-32 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(rgba(34,197,94,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.3) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
                  {[{ top: "30%", left: "25%", c: "#22c55e" }, { top: "55%", left: "55%", c: "#22c55e" }, { top: "20%", left: "65%", c: "#ef4444" }, { top: "70%", left: "35%", c: "#f97316" }].map((p, i) => (
                    <div key={i} className="absolute" style={{ top: p.top, left: p.left }}>
                      <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: p.c + "33", border: `1px solid ${p.c}` }}>
                        <div className="w-2 h-2 rounded-full" style={{ background: p.c }} />
                      </div>
                    </div>
                  ))}
                  <Map className="w-6 h-6 text-[#374151]" />
                </div>
                <div className="rounded-xl border border-[#1f2937] bg-[#0d1117] h-32 p-3 flex flex-col justify-center gap-2">
                  {[{ label: "Temp", val: "26.4°C", color: "#f97316" }, { label: "Humidity", val: "58%", color: "#38bdf8" }, { label: "Score", val: "Good", color: "#22c55e" }].map((r) => (
                    <div key={r.label} className="flex justify-between items-center">
                      <span className="text-[10px] text-[#9ca3af]">{r.label}</span>
                      <span className="text-xs font-semibold" style={{ color: r.color }}>{r.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
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

