import React from "react";
import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";

// Prevent build-time data fetching
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#030014] text-white flex flex-col items-center justify-center relative overflow-hidden px-6">
      {/* Background Blurry Glows */}
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-cyan-600/10 blur-[100px] rounded-full pointer-events-none animate-pulse-slow" />

      {/* Main Content Card */}
      <div className="relative z-10 text-center max-w-lg glass-card p-8 sm:p-12 rounded-3xl border border-white/10 backdrop-blur-lg shadow-2xl flex flex-col items-center gap-6">
        {/* Glowy 404 Header */}
        <div className="relative">
          <h1 className="text-8xl font-black bg-gradient-to-r from-purple-500 via-violet-400 to-cyan-500 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(112,66,248,0.5)]">
            404
          </h1>
        </div>

        <h2 className="text-2xl font-bold text-white tracking-wide">
          Page Not Found
        </h2>

        <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
          Oops! The page you are looking for doesn't exist, or has been moved to another universe.
        </p>

        {/* Action Button */}
        <Link
          href="/"
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-xl hover:shadow-[0_0_20px_rgba(112,66,248,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all font-medium text-sm border border-white/10"
        >
          <Home size={16} />
          Go Back Home
        </Link>
      </div>
    </div>
  );
}
