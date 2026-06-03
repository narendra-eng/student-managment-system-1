// components/Navbar.js
"use client";

export default function Navbar({ apiOnline }) {
  const badge = apiOnline === null
    ? { cls: "text-yellow-300 border-yellow-600", label: "● Connecting…",  dot: "bg-yellow-400 animate-pulse" }
    : apiOnline
    ? { cls: "text-emerald-300 border-emerald-600", label: "● API Online", dot: "bg-emerald-400" }
    : { cls: "text-red-300 border-red-600",         label: "● API Offline", dot: "bg-red-400" };

  return (
    <header className="sticky top-0 z-50 bg-[#1e293b] border-b-2 border-sky-500
                        shadow-[0_2px_20px_rgba(0,0,0,0.4)]">
      <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎓</span>
          <span className="text-lg font-bold text-sky-400 tracking-wide">
            Student Management System
          </span>
        </div>
        {/* API status */}
        <span className={`text-xs px-3 py-1.5 rounded-full border bg-[#0f172a]
                          font-medium transition-all ${badge.cls}`}>
          {badge.label}
        </span>
      </div>
    </header>
  );
}
