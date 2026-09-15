# SMS Backend — ERP Student Management System

Express + MongoDB (Mongoose) backend with JWT auth, role-based access
(admin/faculty/student), student CRUD, and attendance tracking with a
dashboard-ready percentage aggregation.

## 1. Setup

```bash
npm install
cp .env.example .env
```

Edit `.env` and paste in your MongoDB URI (get a free cluster at
mongodb.com/cloud/atlas — takes ~2 min) and a JWT secret:

```bash
# generate a secret quickly:
openssl rand -hex 32
```

## 2. Seed demo data (recommended before your demo)

```bash
npm run seed
```

This creates:
- Admin login: `admin@sms.com` / `admin123`
- Faculty login: `faculty@sms.com` / `faculty123`
- 20 students with realistic names, classes, fee status, grades
- 30 days of attendance history per student (dashboard-ready)

## 3. Run the server

```bash
npm run dev
```

Server starts at `http://localhost:5000`. Visit `/` in a browser or with
`curl` to confirm it's alive.

## 4. Test endpoints from the terminal (no Postman needed)

**Login and grab a token:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sms.com","password":"admin123"}'
```
Copy the `token` value from the response for the next calls.

**List students:**
```bash
TOKEN="paste_token_here"

curl http://localhost:5000/api/students \
  -H "Authorization: Bearer $TOKEN"
```

**Create a student:**
```bash
curl -X POST http://localhost:5000/api/students \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Student","rollNo":"R9999","class":"10-A"}'
```

**Mark attendance:**
```bash
curl -X POST http://localhost:5000/api/attendance \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"studentId":"PASTE_STUDENT_ID","status":"present"}'
```

**Get attendance % summary (for your dashboard chart):**
```bash
curl http://localhost:5000/api/attendance/summary/all \
  -H "Authorization: Bearer $TOKEN"
```

## API Reference

| Method | Route | Access | Description |
|---|---|---|---|
| POST | /api/auth/register | Public | Create a user |
| POST | /api/auth/login | Public | Login, returns JWT |
| GET | /api/auth/me | Logged in | Get current user |
| GET | /api/students | Logged in | List all students |
| GET | /api/students/:id | Logged in | Get one student |
| POST | /api/students | admin, faculty | Create student |
| PUT | /api/students/:id | admin, faculty | Update student |
| DELETE | /api/students/:id | admin | Delete student |
| POST | /api/attendance | admin, faculty | Mark attendance |
| GET | /api/attendance/:studentId | Logged in | Student's attendance history |
| GET | /api/attendance/summary/all | Logged in | % summary for dashboard |

## Folder structure

```
sms-backend/
├── config/db.js          # MongoDB connection
├── models/                # User, Student, Attendance schemas
├── middleware/auth.js     # JWT verification + role guard
├── controllers/           # Route logic
├── routes/                 # Route definitions
├── seed.js                 # Demo data generator
└── server.js                # App entry point
```

## Next steps for your frontend

- Connect via `fetch`/`axios`, store the JWT in memory or localStorage
- Hit `GET /api/attendance/summary/all` to feed straight into a Recharts
  bar chart — it's already shaped as `{ name, rollNo, attendancePercent }[]`
- `feeStatus` and `grade` fields on the Student model are ready for your
  fee/result module — no extra endpoints needed unless you want update logic
  beyond the generic `PUT /api/students/:id`
