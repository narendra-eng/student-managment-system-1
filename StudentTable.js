// components/StudentTable.js
// ─────────────────────────────────────────────────────────────────
//  Table panel — search, spinner, empty state, rows.
//  Columns: ID | Name | Course | Age | Joining Date | Added On | Actions
//
//  Date rendering:
//    joining_date : "YYYY-MM-DD" → formatJoiningDate() → "27 May 2026"
//    created_at   : "DD-MM-YYYY" → display as-is (Flask format)
// ─────────────────────────────────────────────────────────────────
"use client";
import { useState, useMemo } from "react";
import { formatJoiningDate } from "@/lib/api";

export default function StudentTable({
  students, loading, onEdit, onDelete, onRefresh
}) {
  const [query, setQuery] = useState("");

  // Client-side search on name and course
  const rows = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return students;
    return students.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.course.toLowerCase().includes(q)
    );
  }, [students, query]);

  return (
    <div className="bg-[#1e293b] border border-slate-700 rounded-2xl
                    shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden
                    animate-fade-up [animation-delay:70ms]">

      {/* ── Top bar ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between
                      gap-3 p-5 border-b border-slate-700">
        <h2 className="text-base font-semibold text-slate-200">📋 All Students</h2>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs pointer-events-none">
              🔍
            </span>
            <input
              value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search name or course…"
              className="bg-[#0f172a] border border-slate-700 rounded-lg
                         pl-8 pr-3 py-2 text-sm text-slate-200 placeholder-slate-600
                         outline-none w-48 focus:border-sky-500 focus:ring-2
                         focus:ring-sky-500/20 transition-all"
            />
          </div>
          {/* Refresh */}
          <button onClick={onRefresh} disabled={loading}
                  className="border border-slate-700 text-slate-400 text-sm
                             px-4 py-2 rounded-lg hover:border-sky-500 hover:text-sky-400
                             transition-all disabled:opacity-40 whitespace-nowrap">
            {loading ? <span className="inline-block animate-spin">↻</span> : "↻"} Refresh
          </button>
        </div>
      </div>

      {/* ── Spinner ──────────────────────────────────────────── */}
      {loading && (
        <div className="flex flex-col items-center gap-3 py-20 text-slate-500 text-sm">
          <div className="w-9 h-9 border-[3px] border-slate-700 border-t-sky-500
                          rounded-full animate-spin"/>
          Loading…
        </div>
      )}

      {/* ── Empty state ───────────────────────────────────────── */}
      {!loading && rows.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-16 text-center px-4">
          <span className="text-5xl">🎓</span>
          <p className="text-slate-300 font-medium mt-2">
            {query ? "No students match your search." : "No students found."}
          </p>
          <small className="text-slate-500 text-xs">
            {query ? "Try a different search term." : "Add a student using the form."}
          </small>
        </div>
      )}

      {/* ── Table ─────────────────────────────────────────────── */}
      {!loading && rows.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-sky-500/10 border-b border-slate-700">
                {["ID","Name","Course","Age","Joining Date","Added On","Actions"].map(h => (
                  <th key={h}
                      className="px-4 py-3 text-left text-[0.68rem] font-semibold
                                 uppercase tracking-widest text-sky-400 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((s, i) => (
                <tr key={s.id}
                    className="border-b border-slate-800 hover:bg-white/[0.025]
                               transition-colors animate-row-in"
                    style={{ animationDelay: `${i * 0.04}s` }}>
                  <td className="px-4 py-3 text-slate-500 text-[0.78rem] w-12">#{s.id}</td>
                  <td className="px-4 py-3 font-medium text-slate-200 whitespace-nowrap">{s.name}</td>
                  <td className="px-4 py-3">
                    <span className="bg-sky-500/10 border border-sky-500/25 text-sky-300
                                     text-[0.72rem] px-2.5 py-0.5 rounded-full whitespace-nowrap">
                      {s.course}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{s.age}</td>
                  {/* joining_date: "YYYY-MM-DD" → "27 May 2026" */}
                  <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                    {formatJoiningDate(s.joining_date)}
                  </td>
                  {/* created_at: "DD-MM-YYYY" from Flask — display as-is */}
                  <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                    {s.created_at || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => onEdit(s)}
                              className="bg-amber-500/15 border border-amber-500/30
                                         text-amber-400 text-[0.78rem] px-3 py-1.5
                                         rounded-md hover:bg-amber-500/25 transition-all">
                        ✏️ Edit
                      </button>
                      <button onClick={() => onDelete(s.id, s.name)}
                              className="bg-red-500/10 border border-red-500/25
                                         text-red-400 text-[0.78rem] px-3 py-1.5
                                         rounded-md hover:bg-red-500/25 transition-all">
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
