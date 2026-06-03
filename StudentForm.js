// components/StudentForm.js
// ─────────────────────────────────────────────────────────────────
//  Add / Edit form.
//  Validation mirrors app.py validate() exactly:
//    name      → required
//    course    → required
//    age       → required, integer 1-100
//    joining_date → required, "YYYY-MM-DD"
// ─────────────────────────────────────────────────────────────────
"use client";
import { useState, useEffect } from "react";
import Stats from "./Stats";

const BLANK = { name: "", course: "", age: "", joining_date: "" };

export default function StudentForm({
  editTarget, onSubmit, onCancel, submitting, students
}) {
  const [form,   setForm]   = useState(BLANK);
  const [errors, setErrors] = useState({});

  // Populate form when editTarget changes
  useEffect(() => {
    if (editTarget) {
      setForm({
        name        : editTarget.name         || "",
        course      : editTarget.course       || "",
        age         : String(editTarget.age)  || "",
        joining_date: editTarget.joining_date || "",
        // joining_date is already "YYYY-MM-DD" from Flask → set directly into <input type="date">
      });
    } else {
      setForm(BLANK);
    }
    setErrors({});
  }, [editTarget]);

  function onChange(e) {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: "" }));
  }

  // Client-side validation — mirrors server validate()
  function validate() {
    const e = {};
    if (!form.name.trim())   e.name         = "Name is required.";
    if (!form.course.trim()) e.course       = "Course is required.";
    const age = parseInt(form.age, 10);
    if (!form.age || isNaN(age) || age < 1 || age > 100)
                             e.age          = "Enter a valid age (1–100).";
    if (!form.joining_date)  e.joining_date = "Please select a joining date.";
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const payload = {
      name        : form.name.trim(),
      course      : form.course.trim(),
      age         : parseInt(form.age, 10),
      joining_date: form.joining_date,   // "YYYY-MM-DD" — exactly what Flask expects
    };

    const ok = await onSubmit(payload, editTarget?.id ?? null);
    if (ok) { setForm(BLANK); setErrors({}); }
  }

  const isEdit = Boolean(editTarget);

  // Reusable labelled input
  function Field({ label, name, type = "text", placeholder, min, max }) {
    return (
      <div className="flex flex-col gap-1 mb-[1.1rem]">
        <label className="text-[0.72rem] font-semibold uppercase tracking-widest text-slate-400">
          {label} <span className="text-sky-400">*</span>
        </label>
        <input
          type={type} name={name} value={form[name]}
          onChange={onChange} placeholder={placeholder}
          min={min} max={max} autoComplete="off"
          className={`w-full bg-[#0f172a] border rounded-lg px-3 py-[0.6rem]
                      text-sm text-slate-200 placeholder-slate-600 outline-none
                      transition-all duration-200
                      focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20
                      ${errors[name] ? "border-red-500" : "border-slate-700"}`}
        />
        <span className="text-[0.72rem] text-red-400 min-h-[14px]">
          {errors[name] || ""}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-[#1e293b] border border-slate-700 rounded-2xl p-7
                    shadow-[0_8px_32px_rgba(0,0,0,0.4)] animate-fade-up">
      {/* Title */}
      <h2 className="text-base font-semibold text-slate-200 mb-5">
        {isEdit ? "✏️ Edit Student" : "➕ Add Student"}
      </h2>

      <form onSubmit={handleSubmit} noValidate>
        <Field label="Full Name"    name="name"         placeholder="Enter full name" />
        <Field label="Course"       name="course"       placeholder="Enter course name" />
        <Field label="Age"          name="age"          type="number" placeholder="Enter age" min="1" max="100" />
        <Field label="Joining Date" name="joining_date" type="date" />

        <div className="flex gap-3 mt-1">
          <button
            type="submit" disabled={submitting}
            className={`flex-1 flex items-center justify-center gap-2
                        py-[0.65rem] px-5 rounded-lg font-semibold text-sm
                        transition-all duration-200
                        ${submitting
                          ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                          : isEdit
                            ? "bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/25"
                            : "bg-sky-500 hover:bg-sky-400 text-white shadow-lg shadow-sky-500/30"}`}
          >
            {submitting
              ? <><span className="w-4 h-4 border-2 border-slate-500 border-t-white
                                   rounded-full animate-spin inline-block"/>Saving…</>
              : isEdit ? "💾 Update Student" : "➕ Add Student"}
          </button>

          {isEdit && (
            <button type="button" onClick={onCancel}
                    className="px-4 py-[0.65rem] rounded-lg border border-slate-600
                               text-slate-400 text-sm hover:border-slate-400
                               hover:text-slate-200 transition-all duration-200">
              ✖ Cancel
            </button>
          )}
        </div>
      </form>

      {/* Stats strip below form */}
      <Stats students={students} />
    </div>
  );
}
