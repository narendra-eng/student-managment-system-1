// components/Toast.js
"use client";

export default function Toast({ toast, onClose }) {
  if (!toast) return null;
  const ok = toast.type === "success";
  return (
    <div className={`fixed bottom-6 right-6 z-50 animate-slide-up
                     flex items-center gap-3 px-4 py-3 rounded-xl
                     text-sm font-medium border shadow-2xl
                     ${ok
                       ? "bg-emerald-950/90 border-emerald-500/40 text-emerald-300"
                       : "bg-red-950/90 border-red-500/40 text-red-300"}`}>
      <span>{ok ? "✅" : "❌"}</span>
      <span>{toast.message}</span>
      <button onClick={onClose}
              className="ml-2 opacity-50 hover:opacity-100 text-base leading-none">×</button>
    </div>
  );
}
