"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Wifi, LogOut, User, Bell, Settings } from "lucide-react";

export default function DashboardNav() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data) setDisplayName(data.displayName); })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <header className="h-14 bg-[#0d1117] border-b border-[#1f2937] flex items-center px-6 gap-4 shrink-0 z-40">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mr-4 group">
        <div className="w-8 h-8 rounded-lg bg-[#22c55e]/20 flex items-center justify-center">
          <Wifi className="w-4 h-4 text-[#22c55e]" />
        </div>
        <span className="font-bold text-base text-white hidden sm:block">
          Nest<span className="text-[#22c55e]">Sense</span>
        </span>
      </Link>

      <div className="h-5 w-px bg-[#1f2937] hidden sm:block" />

      <span className="text-sm font-semibold text-[#9ca3af] hidden sm:block">Dashboard</span>

      <div className="flex-1" />

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <button className="relative p-2 rounded-lg hover:bg-[#1f2937] text-[#6b7280] hover:text-white transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
        </button>

        {/* Settings */}
        <button className="p-2 rounded-lg hover:bg-[#1f2937] text-[#6b7280] hover:text-white transition-colors">
          <Settings className="w-4 h-4" />
        </button>

        {/* User info */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#1f2937] bg-[#111827] ml-1">
          <User className="w-3.5 h-3.5 text-[#6b7280]" />
          <span className="text-sm text-[#d1d5db] hidden sm:block">{displayName ?? "…"}</span>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ef4444] hover:bg-[#dc2626] text-white text-sm font-medium transition-colors ml-1"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:block">Logout</span>
        </button>
      </div>
    </header>
  );
}
