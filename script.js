/* ================================================================
   Student Management System — script.js
   Connects to Flask REST API at http://127.0.0.1:5000/api

   Flow
   ----
   Page load  → checkHealth() + loadStudents()
   Add form   → submitForm() → createStudent()  POST /api/students
   Edit btn   → fillEditForm()  (populates form fields)
   Update btn → submitForm() → updateStudent()  PUT  /api/students/:id
   Delete btn → deleteStudent()                 DELETE /api/students/:id
   Search box → filterStudents()  (client-side, no API call)

   Date handling
   -------------
   <input type="date"> always gives value as "YYYY-MM-DD".
   Flask stores it as a DATE column and returns it as "YYYY-MM-DD".
   formatDate() converts "YYYY-MM-DD" → "27 May 2026" for display.
   created_at comes as "DD-MM-YYYY" from Flask — shown as-is.
   ================================================================ */

// ── Base URL of Flask backend ─────────────────────────────────────
const API = "http://127.0.0.1:5000/api";

// ── In-memory list — used by filterStudents() ─────────────────────
let allStudents = [];

// ── Edit mode flag: null = Add mode, number = ID being edited ─────
let editingId = null;

// ── Toast auto-dismiss timer ──────────────────────────────────────
let toastTimer = null;

// ================================================================
//  PAGE LOAD
// ================================================================
document.addEventListener("DOMContentLoaded", () => {
  checkHealth();
  loadStudents();
});

// ================================================================
//  HEALTH CHECK  GET /api/health
//  Updates the green / red dot in the header
// ================================================================
async function checkHealth() {
  const badge = document.getElementById("api-status");
  try {
    const res = await fetch(`${API}/health`);
    if (res.ok) {
      badge.textContent = "● API Online";
      badge.className   = "status-badge online";
    } else {
      throw new Error("not ok");
    }
  } catch {
    badge.textContent = "● API Offline";
    badge.className   = "status-badge offline";
  }
}

// ================================================================
//  LOAD ALL STUDENTS  GET /api/students
// ================================================================
async function loadStudents() {
  showSpinner(true);

  try {
    const res = await fetch(`${API}/students`);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `Server error ${res.status}`);
    }

    const data = await res.json();
    // data = { success, count, students: [ {id,name,course,age,joining_date,created_at} ] }
    allStudents = Array.isArray(data.students) ? data.students : [];

    renderTable(allStudents);
    updateStats(allStudents);

  } catch (err) {
    showToast("❌ Cannot reach Flask. Run: python app.py", "error");
    showEmpty(true);
  } finally {
    showSpinner(false);
  }
}

// ================================================================
//  SUBMIT FORM — decides Create vs Update
// ================================================================
async function submitForm() {
  clearFieldErrors();

  // Collect values
  const name   = document.getElementById("inp-name").value.trim();
  const course = document.getElementById("inp-course").value.trim();
  const ageRaw = document.getElementById("inp-age").value.trim();
  const date   = document.getElementById("inp-date").value; // "YYYY-MM-DD" or ""

  // ── Client-side validation (mirrors app.py validate()) ────────
  let valid = true;

  if (!name) {
    setFieldErr("err-name", "Name is required.");
    valid = false;
  }
  if (!course) {
    setFieldErr("err-course", "Course is required.");
    valid = false;
  }
  const age = parseInt(ageRaw, 10);
  if (!ageRaw || isNaN(age) || age < 1 || age > 100) {
    setFieldErr("err-age", "Enter a valid age (1–100).");
    valid = false;
  }
  if (!date) {
    setFieldErr("err-date", "Please select a joining date.");
    valid = false;
  }

  if (!valid) return;

  // Build payload — age as integer, date as "YYYY-MM-DD"
  const payload = { name, course, age, joining_date: date };

  if (editingId !== null) {
    await updateStudent(editingId, payload);
  } else {
    await createStudent(payload);
  }
}

// ================================================================
//  CREATE  POST /api/students
// ================================================================
async function createStudent(payload) {
  try {
    const res = await fetch(`${API}/students`, {
      method : "POST",
      headers: { "Content-Type": "application/json" },
      body   : JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to add student.");

    // data.message = "Student added successfully."
    showToast("✅ " + data.message, "success");
    resetForm();
    loadStudents();

  } catch (err) {
    showToast("❌ " + err.message, "error");
  }
}

// ================================================================
//  FILL FORM FOR EDITING  (called by Edit button in table row)
// ================================================================
function fillEditForm(student) {
  editingId = student.id;

  document.getElementById("inp-name").value   = student.name;
  document.getElementById("inp-course").value = student.course;
  document.getElementById("inp-age").value    = student.age;
  // joining_date from Flask is already "YYYY-MM-DD" — set directly
  document.getElementById("inp-date").value   = student.joining_date || "";

  document.getElementById("form-title").textContent    = "✏️ Edit Student";
  document.getElementById("submit-btn").textContent     = "💾 Update Student";
  document.getElementById("cancel-btn").style.display  = "inline-flex";

  // Scroll the form into view on mobile screens
  document.querySelector(".form-panel").scrollIntoView({ behavior: "smooth", block: "start" });
}

// ================================================================
//  UPDATE  PUT /api/students/<id>
// ================================================================
async function updateStudent(id, payload) {
  try {
    const res = await fetch(`${API}/students/${id}`, {
      method : "PUT",
      headers: { "Content-Type": "application/json" },
      body   : JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to update student.");

    showToast("✅ " + data.message, "success");
    resetForm();
    loadStudents();

  } catch (err) {
    showToast("❌ " + err.message, "error");
  }
}

// ================================================================
//  DELETE  DELETE /api/students/<id>
// ================================================================
async function deleteStudent(id, name) {
  if (!confirm(`Delete "${name}"?\nThis action cannot be undone.`)) return;

  try {
    const res  = await fetch(`${API}/students/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to delete.");

    // data.message = "{name} deleted successfully."
    showToast("✅ " + data.message, "success");
    loadStudents();

  } catch (err) {
    showToast("❌ " + err.message, "error");
  }
}

// ================================================================
//  CANCEL EDIT — return form to Add mode
// ================================================================
function cancelEdit() { resetForm(); }

function resetForm() {
  editingId = null;
  ["inp-name", "inp-course", "inp-age", "inp-date"].forEach(
    (id) => (document.getElementById(id).value = "")
  );
  document.getElementById("edit-id").value                = "";
  document.getElementById("form-title").textContent       = "➕ Add Student";
  document.getElementById("submit-btn").textContent       = "➕ Add Student";
  document.getElementById("cancel-btn").style.display     = "none";
  clearFieldErrors();
}

// ================================================================
//  SEARCH  (client-side — no extra API call)
// ================================================================
function filterStudents() {
  const q = document.getElementById("search-input").value.toLowerCase().trim();
  if (!q) { renderTable(allStudents); return; }
  renderTable(
    allStudents.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.course.toLowerCase().includes(q)
    )
  );
}

// ================================================================
//  RENDER TABLE
//  Uses createElement + addEventListener (NO inline onclick strings)
//  This avoids XSS and string-escaping bugs for names like O'Brien
// ================================================================
function renderTable(students) {
  const tbody = document.getElementById("students-tbody");
  tbody.innerHTML = "";

  if (!students || students.length === 0) {
    document.getElementById("table-wrap").style.display = "none";
    showEmpty(true);
    return;
  }

  document.getElementById("table-wrap").style.display = "block";
  showEmpty(false);

  students.forEach((s, i) => {
    const tr = document.createElement("tr");
    tr.style.animationDelay = `${i * 0.04}s`;

    // ID
    const tdId = document.createElement("td");
    tdId.textContent = "#" + s.id;

    // Name
    const tdName = document.createElement("td");
    tdName.textContent = s.name;

    // Course  (badge pill)
    const tdCourse = document.createElement("td");
    const badge    = document.createElement("span");
    badge.className   = "course-tag";
    badge.textContent = s.course;
    tdCourse.appendChild(badge);

    // Age
    const tdAge = document.createElement("td");
    tdAge.textContent = s.age;

    // Joining Date  "YYYY-MM-DD" → "27 May 2026"
    const tdJoin = document.createElement("td");
    tdJoin.textContent = formatDate(s.joining_date);
    tdJoin.style.color = "#94a3b8";

    // Created At  "DD-MM-YYYY" — display as-is from Flask
    const tdCreated = document.createElement("td");
    tdCreated.textContent = s.created_at || "—";
    tdCreated.style.color = "#475569";

    // Actions  — Edit + Delete buttons
    const tdActions = document.createElement("td");
    tdActions.className = "actions-cell";

    const editBtn = document.createElement("button");
    editBtn.className   = "btn-edit";
    editBtn.textContent = "✏️ Edit";
    editBtn.addEventListener("click", () => fillEditForm(s));

    const delBtn = document.createElement("button");
    delBtn.className   = "btn-delete";
    delBtn.textContent = "🗑️ Delete";
    delBtn.addEventListener("click", () => deleteStudent(s.id, s.name));

    tdActions.appendChild(editBtn);
    tdActions.appendChild(delBtn);

    tr.appendChild(tdId);
    tr.appendChild(tdName);
    tr.appendChild(tdCourse);
    tr.appendChild(tdAge);
    tr.appendChild(tdJoin);
    tr.appendChild(tdCreated);
    tr.appendChild(tdActions);

    tbody.appendChild(tr);
  });
}

// ================================================================
//  STATS STRIP
// ================================================================
function updateStats(students) {
  const list = Array.isArray(students) ? students : [];
  document.getElementById("stat-total").textContent   = list.length;

  const courses = new Set(list.map((s) => s.course).filter(Boolean));
  document.getElementById("stat-courses").textContent = courses.size;

  if (list.length > 0) {
    const avg = Math.round(
      list.reduce((sum, s) => sum + (Number(s.age) || 0), 0) / list.length
    );
    document.getElementById("stat-avg").textContent = avg;
  } else {
    document.getElementById("stat-avg").textContent = "—";
  }
}

// ================================================================
//  DATE FORMAT HELPER
//  "YYYY-MM-DD" → "27 May 2026"
//  Split manually to avoid JS timezone-shift bugs
//  (new Date("2026-05-27") shifts to May 26 in UTC-offset timezones)
// ================================================================
function formatDate(str) {
  if (!str) return "—";
  const parts = str.split("-");
  if (parts.length !== 3) return str;
  const [y, m, d] = parts.map(Number);
  const months = ["Jan","Feb","Mar","Apr","May","Jun",
                  "Jul","Aug","Sep","Oct","Nov","Dec"];
  if (!months[m - 1]) return str;
  return `${String(d).padStart(2, "0")} ${months[m - 1]} ${y}`;
}

// ================================================================
//  UI HELPERS
// ================================================================

// Toast notification (auto-dismisses after 3.5 s)
function showToast(msg, type = "success") {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.className   = `toast show ${type}`;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.className = "toast"; }, 3500);
}

// Per-field inline error messages
function setFieldErr(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg;
}
function clearFieldErrors() {
  ["err-name","err-course","err-age","err-date"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.textContent = "";
  });
}

// Spinner
function showSpinner(show) {
  const el = document.getElementById("spinner");
  if (el) el.style.display = show ? "flex" : "none";
}

// Empty state
function showEmpty(show) {
  const es = document.getElementById("empty-state");
  if (es) es.style.display = show ? "flex" : "none";
  if (show) {
    const tw = document.getElementById("table-wrap");
    if (tw) tw.style.display = "none";
  }
}

// ── Enter key shortcut — submit form from any input ────────────────
// Skip if the user is typing in the search box
document.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  if (document.activeElement &&
      document.activeElement.id === "search-input") return;
  submitForm();
});
