"use client";

import Link from "next/link";
import { Wifi, Menu, X, LayoutDashboard } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it Works", href: "#how-it-works" },
  { label: "About", href: "#about" },
];

export default function LandingNav() {
  const [open, setOpen] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.displayName) setDisplayName(data.displayName);
      })
      .catch(() => {});
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#1f2937] bg-[#0a0a0a]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 rounded-lg bg-[#22c55e]/20 group-hover:bg-[#22c55e]/30 transition-colors" />
            <Wifi className="absolute inset-0 m-auto w-5 h-5 text-[#22c55e]" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white">
            Nest<span className="text-[#22c55e]">Sense</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-[#9ca3af] hover:text-[#22c55e] text-sm transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {displayName ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-[#1f2937] bg-[#0d1117] text-[#f0f0f0] hover:border-[#22c55e]/50 hover:text-[#22c55e] transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-[#22c55e]/20 flex items-center justify-center">
                <span className="text-[#22c55e] text-xs font-bold">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              </div>
              <span>{displayName}</span>
              <LayoutDashboard className="w-3.5 h-3.5 text-[#9ca3af]" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 text-sm text-[#9ca3af] hover:text-white transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/login/signup"
                className="px-4 py-2 text-sm font-medium rounded-lg bg-[#22c55e] text-black hover:bg-[#4ade80] transition-colors"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-[#9ca3af] hover:text-white"
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-[#1f2937] bg-[#0a0a0a]/95 px-6 py-4 flex flex-col gap-4"
          >
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-[#9ca3af] hover:text-[#22c55e] text-sm"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </a>
            ))}
            {displayName ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg border border-[#1f2937] bg-[#0d1117] text-[#f0f0f0]"
                onClick={() => setOpen(false)}
              >
                <div className="w-5 h-5 rounded-full bg-[#22c55e]/20 flex items-center justify-center">
                  <span className="text-[#22c55e] text-xs font-bold">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm text-[#9ca3af]" onClick={() => setOpen(false)}>Log in</Link>
                <Link
                  href="/login/signup"
                  className="text-sm font-medium px-4 py-2 rounded-lg bg-[#22c55e] text-black text-center"
                  onClick={() => setOpen(false)}
                >
                  Get Started
                </Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
