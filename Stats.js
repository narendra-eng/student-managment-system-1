// components/Stats.js
"use client";

export default function Stats({ students }) {
  const list    = Array.isArray(students) ? students : [];
  const total   = list.length;
  const courses = new Set(list.map(s => s.course).filter(Boolean)).size;
  const avgAge  = total > 0
    ? Math.round(list.reduce((sum, s) => sum + (Number(s.age) || 0), 0) / total)
    : null;

  return (
    <div className="flex items-center gap-3 mt-5 p-4 bg-[#0f172a]
                    border border-slate-700 rounded-xl">
      {[
        { num: total,                        lbl: "Total"    },
        { num: courses,                      lbl: "Courses"  },
        { num: avgAge !== null ? avgAge : "—", lbl: "Avg Age" },
      ].map((item, i) => (
        <div key={item.lbl} className={`flex-1 text-center ${i < 2 ? "border-r border-slate-700" : ""}`}>
          <div className="text-[1.8rem] font-bold text-sky-400 leading-none">{item.num}</div>
          <div className="text-[0.62rem] text-slate-500 uppercase tracking-widest mt-1">{item.lbl}</div>
        </div>
      ))}
    </div>
  );
}
