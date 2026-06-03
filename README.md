# 🎓 Student Management System
**Full-Stack CRUD — Flask + SQLAlchemy + SQLite + Vanilla JS**

---

## 📁 Project Structure

```
project/
│
├── backend/
│   ├── app.py            ← Flask REST API (all routes)
│   ├── models.py         ← SQLAlchemy Student model
│   ├── requirements.txt  ← Python packages
│   ├── run.bat           ← Windows one-click starter
│   └── students.db       ← SQLite database (auto-created)
│
├── frontend/
│   ├── index.html        ← UI layout
│   ├── style.css         ← Dark navy styling
│   └── script.js         ← All CRUD fetch() calls
│
└── README.md
```

---

## ⚙️ Step 1 — Install Python Packages

```bash
cd backend
pip install -r requirements.txt
```

Or just double-click **`run.bat`** — it installs everything automatically.

---

## 🚀 Step 2 — Start Flask Backend

```bash
cd backend
python app.py
```

Expected output:
```
✅ Database ready → .../backend/students.db
====================================================
  🎓 Student Management System  —  Flask API
  URL   : http://127.0.0.1:5000
  Health: http://127.0.0.1:5000/api/health
====================================================
```

---

## 🌐 Step 3 — Verify Backend Works

Open in browser:
```
http://127.0.0.1:5000/api/health
```
Expected:
```json
{ "success": true, "message": "API is running" }
```

---

## 🖥️ Step 4 — Open Frontend

Double-click `frontend/index.html`.
Header shows **● API Online** (green) when Flask is reachable.

---

## 🗄️ Database Fields

| Field         | Type     | Notes                        |
|---------------|----------|------------------------------|
| id            | INTEGER  | Auto-increment primary key   |
| name          | TEXT     | Student full name            |
| course        | TEXT     | Course name                  |
| age           | INTEGER  | 1–100                        |
| joining_date  | DATE     | Stored as YYYY-MM-DD         |
| created_at    | DATETIME | Auto UTC timestamp           |

---

## 🔌 API Reference

| Method | Route                   | Body                              | Success             |
|--------|-------------------------|-----------------------------------|---------------------|
| GET    | /api/health             | —                                 | 200                 |
| GET    | /api/students           | —                                 | 200 + students[]    |
| GET    | /api/students/\<id\>   | —                                 | 200 + student{}     |
| POST   | /api/students           | {name,course,age,joining_date}    | 201 + student{}     |
| PUT    | /api/students/\<id\>   | {name,course,age,joining_date}    | 200 + student{}     |
| DELETE | /api/students/\<id\>   | —                                 | 200 + message       |

---

## 📮 Postman Examples

### Create Student
```
POST http://127.0.0.1:5000/api/students
Content-Type: application/json

{
  "name": "Narendra Dedi",
  "course": "B.Tech CSE",
  "age": 20,
  "joining_date": "2024-08-01"
}
```
Response (201):
```json
{
  "success": true,
  "message": "Student added successfully.",
  "student": { "id": 1, "name": "Narendra Dedi", "course": "B.Tech CSE",
               "age": 20, "joining_date": "2024-08-01", "created_at": "27-05-2026" }
}
```

### Update Student
```
PUT http://127.0.0.1:5000/api/students/1
Content-Type: application/json

{ "name": "Narendra K", "course": "M.Tech AI", "age": 22, "joining_date": "2025-01-15" }
```

### Delete Student
```
DELETE http://127.0.0.1:5000/api/students/1
```
Response:
```json
{ "success": true, "message": "Narendra K deleted successfully." }
```

### Validation Error
```
POST http://127.0.0.1:5000/api/students
{ "name": "", "course": "", "age": 999, "joining_date": "" }
```
Response (400):
```json
{ "success": false, "error": "Name is required.; Course is required.; Age must be between 1 and 100.; Joining date is required (YYYY-MM-DD)." }
```

---

## 🔄 Data Flow

```
User fills form
      ↓
script.js: submitForm()
  → client-side validation
  → fetch("POST /api/students", { body: JSON.stringify(payload) })
      ↓
Flask: create_student() in app.py
  → validate_student(data)       server-side validation
  → datetime.strptime(jd_str, "%Y-%m-%d").date()   string → Python date
  → Student(name=..., joining_date=...) → db.session.add() → commit()
      ↓
Flask returns JSON: { success, message, student:{...} }
      ↓
script.js: showToast() + loadStudents() → re-renders table
```

---

## 🗃️ How SQLite Stores Dates

- SQLite has no native DATE type — dates stored as text `"YYYY-MM-DD"`
- SQLAlchemy's `db.Column(db.Date)` handles the Python ↔ SQLite conversion
- `to_dict()` converts back to string with `.strftime("%Y-%m-%d")`
- Frontend's `formatDate()` converts `"YYYY-MM-DD"` → `"27 May 2026"` for display

---

## 🛑 Common Errors

| Error | Fix |
|-------|-----|
| API Offline / spinner stuck | Run `python app.py` |
| `ModuleNotFoundError: flask_cors` | `pip install -r requirements.txt` |
| `ModuleNotFoundError: models` | Run from inside `backend/` folder |
| CORS error in browser console | `CORS(app)` already in app.py ✅ |
| Date not saving | Use the date picker, don't type manually |
| Port 5000 in use | Change `port=5000` to `port=5001` in app.py |
