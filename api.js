// lib/api.js
// ─────────────────────────────────────────────────────────────────
//  Centralised API layer — all calls to Flask backend go here.
//
//  Base URL is read from .env.local → NEXT_PUBLIC_API_URL
//  Falls back to http://127.0.0.1:5000/api
//
//  Every function returns:
//    { ok:true,  data:{...} }   on HTTP 2xx
//    { ok:false, error:"..."  } on any failure
//
//  Detected from app.py (backend NOT modified):
//  ─────────────────────────────────────────────
//  GET  /health             → {success,message}
//  GET  /students           → {success,count,students:[Student]}
//  GET  /students/:id       → {success,student:Student}
//  POST /students           → {success,message,student:Student}  201
//  PUT  /students/:id       → {success,message,student:Student}  200
//  DELETE /students/:id     → {success,message}                  200
//
//  Student shape (from to_dict):
//    id, name, course, age,
//    joining_date : "YYYY-MM-DD"   ← ISO, use directly in <input type="date">
//    created_at   : "DD-MM-YYYY"   ← display-only
//
//  Error shape: { success:false, error:"msg1; msg2" }
// ─────────────────────────────────────────────────────────────────

import axios from "axios";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/api";

// Axios instance — all requests share this config
const http = axios.create({
  baseURL: BASE,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,   // 10 s — surface network errors quickly
});

// ── Internal wrapper ──────────────────────────────────────────────
async function call(fn) {
  try {
    const res = await fn();
    return { ok: true, data: res.data };
  } catch (err) {
    // Axios puts the server's JSON body in err.response.data
    const msg =
      err?.response?.data?.error ||
      err?.message ||
      "Unknown error";
    return { ok: false, error: msg };
  }
}

// ── Public API functions ──────────────────────────────────────────

/** GET /health */
export const checkHealth = () =>
  call(() => http.get("/health"));

/** GET /students → data.students[] */
export const fetchStudents = () =>
  call(() => http.get("/students"));

/** GET /students/:id → data.student */
export const fetchStudent = (id) =>
  call(() => http.get(`/students/${id}`));

/**
 * POST /students
 * payload: { name:str, course:str, age:int, joining_date:"YYYY-MM-DD" }
 */
export const createStudent = (payload) =>
  call(() => http.post("/students", payload));

/**
 * PUT /students/:id
 * payload: { name:str, course:str, age:int, joining_date:"YYYY-MM-DD" }
 */
export const updateStudent = (id, payload) =>
  call(() => http.put(`/students/${id}`, payload));

/** DELETE /students/:id */
export const deleteStudent = (id) =>
  call(() => http.delete(`/students/${id}`));

// ── Date helpers ──────────────────────────────────────────────────
/**
 * "YYYY-MM-DD"  →  "27 May 2026"
 * Splits manually to avoid JS timezone-shift bugs.
 */
export function formatJoiningDate(str) {
  if (!str) return "—";
  const [y, m, d] = str.split("-").map(Number);
  const months = ["Jan","Feb","Mar","Apr","May","Jun",
                  "Jul","Aug","Sep","Oct","Nov","Dec"];
  if (!months[m - 1]) return str;
  return `${String(d).padStart(2, "0")} ${months[m - 1]} ${y}`;
}
