"use client";

import React from "react";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#030014] text-white flex flex-col items-center justify-center relative overflow-hidden px-6">
      {/* Background Blurry Glows */}
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-red-600/10 blur-[100px] rounded-full pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-orange-600/10 blur-[100px] rounded-full pointer-events-none animate-pulse-slow" />

      {/* Main Content Card */}
      <div className="relative z-10 text-center max-w-lg glass-card p-8 sm:p-12 rounded-3xl border border-white/10 backdrop-blur-lg shadow-2xl flex flex-col items-center gap-6">
        {/* Error Header */}
        <div className="relative">
          <h1 className="text-8xl font-black bg-gradient-to-r from-red-500 via-orange-400 to-yellow-500 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]">
            Error
          </h1>
        </div>

        <h2 className="text-2xl font-bold text-white tracking-wide">
          Something went wrong
        </h2>

        <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
          An unexpected error occurred. Please try again or contact support if the problem persists.
        </p>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={reset}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all font-medium text-sm border border-white/10"
          >
            Try Again
          </button>
          <a
            href="/"
            className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all font-medium text-sm border border-white/10"
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}