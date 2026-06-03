// app/page.js  — Main dashboard page
// ─────────────────────────────────────────────────────────────────
//  All state and CRUD logic lives in useStudents() hook.
//  This file only wires components together.
//  Layout mirrors the original index.html two-column design.
// ─────────────────────────────────────────────────────────────────
"use client";
import { useCallback } from "react";
import { useStudents }   from "@/hooks/useStudents";
import Navbar            from "@/components/Navbar";
import StudentForm       from "@/components/StudentForm";
import StudentTable      from "@/components/StudentTable";
import Toast             from "@/components/Toast";

export default function HomePage() {
  const {
    students, loading, submitting,
    editTarget, toast, apiOnline,
    loadStudents, handleCreate, handleUpdate, handleDelete,
    startEdit, cancelEdit, dismissToast,
  } = useStudents();

  // Single submit handler — decides create vs update
  const handleSubmit = useCallback(async (payload, id) => {
    if (id) return handleUpdate(id, payload);
    return handleCreate(payload);
  }, [handleCreate, handleUpdate]);

  // Start edit and scroll to top on mobile
  const onEdit = useCallback((student) => {
    startEdit(student);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [startEdit]);

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Navbar apiOnline={apiOnline} />

      {/* Two-column layout — 380px form | 1fr table */}
      <div className="max-w-[1400px] mx-auto px-6 py-8
                      grid grid-cols-1 lg:grid-cols-[380px_1fr]
                      gap-6 items-start">
        <StudentForm
          editTarget={editTarget}
          onSubmit={handleSubmit}
          onCancel={cancelEdit}
          submitting={submitting}
          students={students}
        />
        <StudentTable
          students={students}
          loading={loading}
          onEdit={onEdit}
          onDelete={handleDelete}
          onRefresh={loadStudents}
        />
      </div>

      {/* Footer */}
      <footer className="text-center py-5 text-[0.72rem] text-slate-700
                         border-t border-slate-800 mt-4">
        Student Management System &nbsp;·&nbsp; Flask + SQLAlchemy + SQLite
      </footer>

      <Toast toast={toast} onClose={dismissToast} />
    </div>
  );
}
