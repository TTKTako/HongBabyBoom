"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Wifi, Mail, Lock, Eye, EyeOff, User, ArrowRight, UserPlus, CheckCircle2 } from "lucide-react";

const PERKS = [
  "Unlimited boards & rooms",
  "Real-time sensor monitoring",
  "AI comfort scoring",
  "Historical data & charts",
];

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.email || !form.password || !form.confirm) {
      setError("Please fill in all fields.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push("/dashboard");
    }, 1400);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden bg-[#0d1117] border-r border-[#1f2937] flex-col justify-between p-12">
        <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(34,197,94,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.04) 1px, transparent 1px)", backgroundSize: "50px 50px" }} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_30%,rgba(34,197,94,0.08)_0%,transparent_60%)]" />

        <div className="relative z-10 flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-[#22c55e]/20 flex items-center justify-center">
            <Wifi className="w-5 h-5 text-[#22c55e]" />
          </div>
          <span className="text-xl font-bold text-white">Nest<span className="text-[#22c55e]">Sense</span></span>
        </div>

        <div className="relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="w-16 h-16 rounded-2xl border border-[#22c55e]/30 bg-[#111827] flex items-center justify-center mb-6">
              <Wifi className="w-8 h-8 text-[#22c55e]" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3 leading-snug">Start monitoring<br />your home today.</h2>
            <p className="text-[#9ca3af] text-sm leading-relaxed mb-8 max-w-xs">Create a free account and connect your KidBright sensors in under 5 minutes.</p>
            <div className="space-y-3">
              {PERKS.map((p) => (
                <div key={p} className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#22c55e] flex-shrink-0" />
                  <span className="text-sm text-[#d1d5db]">{p}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <p className="relative z-10 text-xs text-[#374151]">© 2026 NestSense · Kasetsart University</p>
      </div>

      {/* Right: Signup form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 overflow-y-auto">
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-[#22c55e]/20 flex items-center justify-center">
              <Wifi className="w-4 h-4 text-[#22c55e]" />
            </div>
            <span className="text-lg font-bold text-white">Nest<span className="text-[#22c55e]">Sense</span></span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Create your account</h1>
            <p className="text-[#9ca3af]">Get started with NestSense for free</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm text-[#9ca3af] mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4b5563]" />
                <input type="text" value={form.name} onChange={update("name")} placeholder="John Doe" className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#111827] border border-[#1f2937] text-[#f0f0f0] placeholder-[#4b5563] focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/30 transition-all text-sm" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm text-[#9ca3af] mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4b5563]" />
                <input type="email" value={form.email} onChange={update("email")} placeholder="you@example.com" className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#111827] border border-[#1f2937] text-[#f0f0f0] placeholder-[#4b5563] focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/30 transition-all text-sm" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-[#9ca3af] mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4b5563]" />
                <input type={showPw ? "text" : "password"} value={form.password} onChange={update("password")} placeholder="Min. 6 characters" className="w-full pl-10 pr-12 py-3 rounded-xl bg-[#111827] border border-[#1f2937] text-[#f0f0f0] placeholder-[#4b5563] focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/30 transition-all text-sm" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#4b5563] hover:text-[#9ca3af] transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-sm text-[#9ca3af] mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4b5563]" />
                <input type={showPw ? "text" : "password"} value={form.confirm} onChange={update("confirm")} placeholder="Repeat password" className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#111827] border border-[#1f2937] text-[#f0f0f0] placeholder-[#4b5563] focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/30 transition-all text-sm" />
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
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#22c55e] text-black font-semibold hover:bg-[#4ade80] transition-all shadow-lg shadow-[#22c55e]/20 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account...
                </span>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create Account
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#9ca3af]">
            Already have an account?{" "}
            <Link href="/login" className="text-[#22c55e] hover:text-[#4ade80] font-medium transition-colors">
              Sign in <ArrowRight className="inline w-3 h-3" />
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
