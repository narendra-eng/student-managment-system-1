// hooks/useStudents.js
// ─────────────────────────────────────────────────────────────────
//  Custom React hook that owns ALL student state and CRUD logic.
//  Components just call the returned functions — no fetch logic
//  leaks into UI code.
//
//  Returns
//  -------
//  students      : Student[]
//  loading       : bool   (table spinner)
//  submitting    : bool   (form button spinner)
//  editTarget    : Student | null   (null = Add mode)
//  toast         : { message, type } | null
//  apiOnline     : bool | null
//  loadStudents  : () => void
//  handleCreate  : (payload) => Promise<bool>
//  handleUpdate  : (id, payload) => Promise<bool>
//  handleDelete  : (id, name) => void
//  startEdit     : (student) => void
//  cancelEdit    : () => void
//  dismissToast  : () => void
// ─────────────────────────────────────────────────────────────────

"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  checkHealth,
  fetchStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} from "@/lib/api";

export function useStudents() {
  const [students,   setStudents]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [toast,      setToast]      = useState(null);
  const [apiOnline,  setApiOnline]  = useState(null);
  const toastTimer = useRef(null);

  // ── Toast helpers ───────────────────────────────────────────────
  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }, []);

  const dismissToast = useCallback(() => {
    setToast(null);
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  // ── Health ping ──────────────────────────────────────────────────
  const pingHealth = useCallback(async () => {
    const res = await checkHealth();
    setApiOnline(res.ok);
  }, []);

  // ── Load all students ────────────────────────────────────────────
  const loadStudents = useCallback(async () => {
    setLoading(true);
    const res = await fetchStudents();
    if (res.ok) {
      setStudents(Array.isArray(res.data.students) ? res.data.students : []);
    } else {
      setStudents([]);
      showToast("❌ Cannot reach Flask backend. Run: python app.py", "error");
    }
    setLoading(false);
  }, [showToast]);

  // ── Mount ────────────────────────────────────────────────────────
  useEffect(() => {
    pingHealth();
    loadStudents();
    return () => { if (toastTimer.current) clearTimeout(toastTimer.current); };
  }, [pingHealth, loadStudents]);

  // ── Create ───────────────────────────────────────────────────────
  const handleCreate = useCallback(async (payload) => {
    setSubmitting(true);
    const res = await createStudent(payload);
    setSubmitting(false);
    if (res.ok) {
      showToast("✅ " + res.data.message, "success");
      await loadStudents();
      return true;
    } else {
      showToast("❌ " + res.error, "error");
      return false;
    }
  }, [loadStudents, showToast]);

  // ── Update ───────────────────────────────────────────────────────
  const handleUpdate = useCallback(async (id, payload) => {
    setSubmitting(true);
    const res = await updateStudent(id, payload);
    setSubmitting(false);
    if (res.ok) {
      showToast("✅ " + res.data.message, "success");
      setEditTarget(null);
      await loadStudents();
      return true;
    } else {
      showToast("❌ " + res.error, "error");
      return false;
    }
  }, [loadStudents, showToast]);

  // ── Delete ───────────────────────────────────────────────────────
  const handleDelete = useCallback(async (id, name) => {
    if (!window.confirm(`Delete "${name}"?\nThis cannot be undone.`)) return;
    const res = await deleteStudent(id);
    if (res.ok) {
      showToast("✅ " + res.data.message, "success");
      await loadStudents();
    } else {
      showToast("❌ " + res.error, "error");
    }
  }, [loadStudents, showToast]);

  // ── Edit helpers ─────────────────────────────────────────────────
  const startEdit  = useCallback((student) => setEditTarget(student), []);
  const cancelEdit = useCallback(() => setEditTarget(null), []);

  return {
    students, loading, submitting, editTarget, toast,
    apiOnline, loadStudents,
    handleCreate, handleUpdate, handleDelete,
    startEdit, cancelEdit, dismissToast,
  };
}
