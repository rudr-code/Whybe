# SMS Frontend — Campus ERP Dashboard

React (Vite) + Tailwind + Recharts. Connects to the sms-backend API for
auth, student CRUD, and attendance tracking.

## 1. Setup

Make sure the backend is running first (`npm run dev` in `sms-backend`,
listening on `http://localhost:5000`).

```bash
npm install
cp .env.example .env
```

`.env` just needs to point at your backend:
```
VITE_API_URL=http://localhost:5000/api
```

## 2. Run it

```bash
npm run dev
```

Opens at `http://localhost:5173`. Log in with the seeded demo accounts:
- Admin: `admin@sms.com` / `admin123`
- Faculty: `faculty@sms.com` / `faculty123`

(Run `npm run seed` in the backend first if you haven't already — that's
what creates these accounts and 20 demo students with attendance history.)

## What's built

- **Login** — JWT auth against the backend, token stored and attached to
  every API call automatically via an axios interceptor
- **Dashboard** — stat cards (total students, avg. attendance, fees
  overdue), a bar chart of attendance % by roll number, and a pie chart of
  fee status breakdown — both fed directly from the backend's aggregation
  endpoints, no client-side math needed
- **Students** — searchable table, add/edit modal, role-gated actions
  (admin + faculty can edit, only admin can delete — student role is
  view-only)
- **Attendance** — mark present/absent by date, live-updating summary
  table with color-coded attendance % (green ≥85%, amber ≥70%, red below)

## Folder structure

```
sms-frontend/
├── src/
│   ├── api/axios.js         # API client, auto-attaches JWT
│   ├── context/AuthContext.jsx
│   ├── components/           # Sidebar, ProtectedRoute, StudentModal
│   ├── pages/                 # Login, Dashboard, Students, Attendance
│   ├── App.jsx                 # routes
│   └── index.css                # Tailwind + status chip styles
├── tailwind.config.js          # design tokens (indigo/amber palette, Fraunces/Inter)
└── index.html
```

## Notes for your demo

- Role gating is real: log in as `faculty@sms.com` and the Delete button
  disappears from the Students table (admin-only), which is a good thing
  to point out live to judges.
- The dashboard charts pull from the backend's MongoDB aggregation
  pipeline (`/api/attendance/summary/all`), not a hardcoded array — worth
  mentioning since judges often ask "is this real or mocked."
- If you add a Fee/Result-specific screen later, the `feeStatus`,
  `feeAmount` and `grade` fields already exist on every student record and
  render in the table — you likely don't need new backend endpoints.
