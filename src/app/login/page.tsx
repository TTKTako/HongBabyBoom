"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Wifi, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError("Login failed.");
        setLoading(false);
        return;
      }
      router.push("/dashboard");
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#0d1117] border-r border-[#1f2937] flex-col justify-between p-12">
        {/* Grid background */}
        <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(34,197,94,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.04) 1px, transparent 1px)", backgroundSize: "50px 50px" }} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(34,197,94,0.08)_0%,transparent_60%)]" />

        {/* Logo */}
        <div className="relative z-10 flex flex-col gap-3">
          <Link href="/" className="flex items-center gap-2 group w-fit">
            <div className="w-9 h-9 rounded-lg bg-[#22c55e]/20 flex items-center justify-center group-hover:bg-[#22c55e]/30 transition-colors">
              <Wifi className="w-5 h-5 text-[#22c55e]" />
            </div>
            <span className="text-xl font-bold text-white group-hover:text-[#22c55e] transition-colors">Nest<span className="text-[#22c55e]">Sense</span></span>
          </Link>
          <Link href="/" className="flex items-center gap-1.5 text-[#4b5563] hover:text-[#22c55e] transition-colors text-xs w-fit">
            <ArrowLeft className="w-3 h-3" />
            Back to home
          </Link>
        </div>

        {/* Center content */}
        <div className="relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="grid grid-cols-2 gap-3 mb-8 max-w-sm">
              {[
                { label: "Boards Online", value: "5", color: "#22c55e" },
                { label: "Readings Today", value: "2,880", color: "#38bdf8" },
                { label: "Avg Temperature", value: "26.1°C", color: "#f97316" },
                { label: "Comfort Rate", value: "83%", color: "#22c55e" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-[#1f2937] bg-[#111827] p-4">
                  <p className="text-[10px] text-[#6b7280] mb-1">{s.label}</p>
                  <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
                </div>
              ))}
            </div>
            <h2 className="text-3xl font-bold text-white mb-3 leading-snug">Monitor every corner<br />of your home.</h2>
            <p className="text-[#9ca3af] text-sm leading-relaxed max-w-xs">Real-time sensor data, AI comfort scoring, and room-by-room insights — all in one place.</p>
          </motion.div>
        </div>

        <p className="relative z-10 text-xs text-[#374151]">© 2026 NestSense · Kasetsart University</p>
      </div>

      {/* Right: Login form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-md">
          {/* Mobile logo */}
          <Link href="/" className="lg:hidden flex items-center gap-2 mb-3 group w-fit">
            <div className="w-8 h-8 rounded-lg bg-[#22c55e]/20 flex items-center justify-center group-hover:bg-[#22c55e]/30 transition-colors">
              <Wifi className="w-4 h-4 text-[#22c55e]" />
            </div>
            <span className="text-lg font-bold text-white group-hover:text-[#22c55e] transition-colors">Nest<span className="text-[#22c55e]">Sense</span></span>
          </Link>
          <Link href="/" className="lg:hidden flex items-center gap-1.5 text-[#4b5563] hover:text-[#22c55e] transition-colors text-xs mb-6 w-fit">
            <ArrowLeft className="w-3 h-3" />
            Back to home
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
            <p className="text-[#9ca3af]">Sign in to your NestSense dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm text-[#9ca3af] mb-2">Username</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4b5563]" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#111827] border border-[#1f2937] text-[#f0f0f0] placeholder-[#4b5563] focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/30 transition-all text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm text-[#9ca3af]">Password</label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4b5563]" />
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 rounded-xl bg-[#111827] border border-[#1f2937] text-[#f0f0f0] placeholder-[#4b5563] focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/30 transition-all text-sm"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#4b5563] hover:text-[#9ca3af] transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[#ef4444] text-sm bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-lg px-4 py-2">
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#22c55e] text-black font-semibold hover:bg-[#4ade80] transition-all shadow-lg shadow-[#22c55e]/20 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#9ca3af]">
            Don&apos;t have an account?{" "}
            <Link href="/login/signup" className="text-[#22c55e] hover:text-[#4ade80] font-medium transition-colors">
              Create one free <ArrowRight className="inline w-3 h-3" />
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
