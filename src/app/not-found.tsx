"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import { Home, ArrowLeft } from "lucide-react";

const ASCIIText = dynamic(() => import("@/components/ACSIIText"), { ssr: false });
const SplashCursor = dynamic(() => import("@/components/SplashCursor"), { ssr: false });

export default function NotFound() {
  return (
    <div className="relative h-screen w-screen bg-[#0a0a0a] overflow-hidden flex flex-col">
      {/* Fluid cursor splash effect */}
      <SplashCursor
        BACK_COLOR={{ r: 0.04, g: 0.04, b: 0.04 }}
        TRANSPARENT
        DENSITY_DISSIPATION={3}
        VELOCITY_DISSIPATION={1.8}
        SPLAT_RADIUS={0.18}
        CURL={22}
      />

      {/* ASCII animated "404" */}
      <div className="relative flex-[0_0_52%] w-full pointer-events-none">
        <ASCIIText
          text="404"
          asciiFontSize={8}
          textFontSize={260}
          textColor="#22c55e"
          enableWaves
        />
      </div>

      {/* Text + buttons */}
      <div className="relative z-10 flex-[0_0_48%] flex flex-col items-center justify-start gap-6 px-4 select-none pt-2">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="text-center"
        >
          <p className="text-xl font-semibold text-white tracking-wide">Page not found</p>
          <p className="text-sm text-[#4b5563] mt-1">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex gap-3"
        >
          <Link
            href="/"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#22c55e] text-black text-sm font-semibold hover:bg-[#4ade80] transition-colors shadow-lg shadow-[#22c55e]/20"
          >
            <Home className="w-4 h-4" />
            Go home
          </Link>
          <button
            onClick={() => history.back()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#1f2937] text-sm text-[#9ca3af] hover:border-[#374151] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go back
          </button>
        </motion.div>
      </div>
    </div>
  );
}
