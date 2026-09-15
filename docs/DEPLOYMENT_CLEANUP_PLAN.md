# CampusSync ERP — Deployment Cleanup Plan
> Audit completed: 2026-09-15  
> Status: READ-ONLY — nothing deleted yet

---

## A. MUST KEEP
Files and folders **required** to run the application in production.

### Root (workspace root)
| Path | Reason |
|------|--------|
| `vercel.json` | **Root-level Vercel config** — tells Vercel the build command, output directory (`sms-frontend/sms-frontend/dist`), and SPA rewrite rules. Required for Vercel deployment. |
| `api/` | **Vercel Serverless Function entry point** — `api/index.js` wraps `sms-backend/sms-backend/server.js` so Vercel routes `/api/*` calls to Express. Required for full-stack Vercel deployment. |
| `api/index.js` | Routes all requests to Express app. |
| `api/[...path].js` | Catch-all dynamic route handler for Vercel serverless functions. |
| `package.json` | Root package with `build` script and shared backend dependencies. Required by Vercel to install and build. |
| `.gitignore` | Must stay. |
| `docs/` | Documentation folder — keep for project context. |

### Frontend — `sms-frontend/sms-frontend/`
| Path | Reason |
|------|--------|
| `src/` | **All frontend source code** — components, pages, context, api, styles. |
| `index.html` | Vite entry point. |
| `package.json` | Frontend dependencies and build scripts. |
| `package-lock.json` | Locks dependency versions. |
| `vite.config.js` | Vite bundler configuration. |
| `tailwind.config.js` | Tailwind CSS design tokens. |
| `postcss.config.js` | Required by Tailwind. |
| `vercel.json` | Frontend-only SPA rewrite rule (used if deploying frontend as a separate Vercel project). |
| `.env.example` | Documents required env vars — keep for reference. |
| `.env.production` | Sets `VITE_API_URL` for production builds. **Update the value before deploying.** |
| `public/` | Static assets served at root. |

### Backend — `sms-backend/sms-backend/`
| Path | Reason |
|------|--------|
| `server.js` | **Express app entry point.** |
| `dataStore.js` | **In-memory data layer** — generates all 1,000 students, marks, attendance, etc. Required unless MongoDB is fully wired up. |
| `config/db.js` | MongoDB connection logic. |
| `controllers/` (all 9 files) | Business logic for every API endpoint. |
| `routes/` (all 9 files) | Express router definitions. |
| `middleware/auth.js` | JWT verification and RBAC. |
| `models/` (3 files) | Mongoose schemas — required if `MONGO_URI` is provided. |
| `package.json` | Backend dependencies. |
| `package-lock.json` | Locks backend dependency versions. |
| `.env.example` | Documents required env vars — keep for reference. |

---

## B. SAFE TO REMOVE
Files that are **clearly unnecessary** for production and can be deleted to clean up the repo.

| Path | Reason it is safe to delete |
|------|------------------------------|
| `erp-frontend.zip` | Old ZIP archive — not used in build or runtime. |
| `sms-backend.zip` | Old ZIP archive — not used. |
| `sms-frontend.zip` | Old ZIP archive — not used. |
| `erp-frontend/` | **Old Next.js frontend** — replaced entirely by `sms-frontend/sms-frontend/`. Not referenced by any active config or script. |
| `sms-frontend/sms-frontend/dist/` | **Generated build output** — rebuilt by Vercel on every deploy. Should also be in `.gitignore` (already is). Do not commit this folder. |
| `sms-backend/sms-backend/node_modules/` | Generated — installed by `npm install`. Never commit. Already in `.gitignore`. |
| `sms-frontend/sms-frontend/node_modules/` | Generated — installed by `npm install`. Never commit. Already in `.gitignore`. |
| `SECTION A SEM 2 B.TECH FY 2025 (NEW ATTENDANCE SHEET)..xlsx - All_Data.csv` | Raw data file used during development — not referenced by code. |
| `Sem_3_LAB_Attendance - AI_ML_B2.csv` | Raw data file — not referenced by code. |
| `Sem_3_LAB_Attendance - Combine.csv` | Raw data file — not referenced by code. |
| `Sem_3_LAB_Attendance - DEL_B1.csv` | Raw data file — not referenced by code. |
| `Sem_3_LAB_Attendance - DSA_B1.csv` | Raw data file — not referenced by code. |
| `mobile no all btech students.xlsx` | Raw data file — not referenced by code. |
| `mobile no all btech students.xlsx - Sheet1.csv` | Raw data file — not referenced by code. |
| `mobile no all btech students.xlsx - Sheet2.csv` | Raw data file — not referenced by code. |
| `Student Mess menu Aug 2026.xlsx` | Raw data file — already embedded in `dataStore.js`. |
| `CampusSync_OnePager_-4.pdf` | Marketing/design file — not needed in production repo. |
| `progress.md` | Dev-time progress notes — not needed in production. |
| `sms-backend/sms-backend/seed.js` | One-time seed script used during development — not part of the production runtime. |
| `sms-backend/sms-backend/test/auth.test.js` | Test file — not deployed. Move to a `__tests__` folder if you want to keep it, or delete. |
| `sms-frontend/sms-frontend/.env` | Local dev env file with `localhost:5000` — must NOT be committed to git (already in `.gitignore`). Delete from git tracking if accidentally staged. |

---

## C. DO NOT REMOVE
Files that **look unnecessary** but are actually required.

| Path | Why it must stay |
|------|-----------------|
| `api/index.js` | Looks like a duplicate of the backend — it is actually the **Vercel Serverless Function entry point**. Deleting it breaks the full-stack Vercel deployment. |
| `api/[...path].js` | Vercel dynamic catch-all route — required so every `/api/*` path is handled. |
| `vercel.json` (root) | Looks redundant next to `sms-frontend/sms-frontend/vercel.json` but serves a different purpose: it directs the **root-level Vercel project** build and output. |
| `sms-frontend/sms-frontend/vercel.json` | Used only if the **frontend** is deployed as a standalone Vercel project (separate from the backend). Needed for SPA routing. |
| `package.json` (root) | Contains the `build` script and backend dependencies required by Vercel's root-level build process. |
| `sms-backend/sms-backend/dataStore.js` | Even if you add MongoDB, this is the **fallback data layer** when no `MONGO_URI` is present. Required unless you fully replace it. |
| `sms-backend/sms-backend/models/` | Required when `MONGO_URI` env var is provided — Mongoose uses these schemas. |
| `sms-frontend/sms-frontend/.env.production` | Required for Vite to inject the production API URL at build time. |
| `sms-frontend/sms-frontend/.env.example` | Reference documentation for other developers — harmless, keep it. |
| `sms-backend/sms-backend/.env.example` | Reference documentation — keep it. |

---

## D. FRONTEND DEPLOYMENT
### Exact folder to deploy to Vercel

```
sms-frontend/sms-frontend/
```

**Vercel project settings (if deploying frontend only):**

| Setting | Value |
|---------|-------|
| Framework Preset | Vite |
| Root Directory | `sms-frontend/sms-frontend` |
| Build Command | `npm install && npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

**If deploying full-stack from root** (current setup via root `vercel.json`):

| Setting | Value |
|---------|-------|
| Root Directory | `.` (repo root) |
| Build Command | `cd sms-frontend/sms-frontend && npm install && npm run build` |
| Output Directory | `sms-frontend/sms-frontend/dist` |
| Serverless Functions | `api/` folder auto-detected by Vercel |

---

## E. BACKEND DEPLOYMENT

### Exact folder
```
sms-backend/sms-backend/
```

### Option 1 — Vercel Serverless (recommended for simplicity)
The `api/` folder at the repo root already wraps the Express app as a Vercel serverless function.  
**No additional host needed** — backend runs alongside the frontend on the same Vercel project.

- Start command: not needed (Vercel handles it)
- Entry point: `api/index.js` → `sms-backend/sms-backend/server.js`

### Option 2 — Dedicated Node.js host (Render / Fly.io / Railway)
Use this if you want persistent in-memory data or need WebSocket support.

| Setting | Value |
|---------|-------|
| Root Directory | `sms-backend/sms-backend` |
| Build Command | `npm install` |
| Start Command | `node server.js` |
| Port | Reads `process.env.PORT` (defaults to 5000) |

---

## F. ENVIRONMENT VARIABLES
Variable **names** only — never commit actual secret values.

### Backend (set on Vercel or Render/Fly.io dashboard)
| Variable | Required | Purpose |
|----------|----------|---------|
| `JWT_SECRET` | **YES** | Signs and verifies JSON Web Tokens — must be a long random string |
| `MONGO_URI` | Optional | MongoDB Atlas connection string — if omitted, app runs in in-memory demo mode |
| `CORS_ORIGIN` | **YES** (production) | Frontend URL to allow CORS — e.g. `https://campussync.vercel.app` |
| `PORT` | Optional | Listening port — Vercel/Render set this automatically |

### Frontend (set on Vercel dashboard OR in `.env.production`)
| Variable | Required | Purpose |
|----------|----------|---------|
| `VITE_API_URL` | **YES** | Backend API base URL — e.g. `https://campussync.vercel.app/api` |

---

## G. API CONFIGURATION
Every place where `localhost:5000` is referenced and what must replace it.

| File | Line | Current Value | Production Replacement |
|------|------|---------------|------------------------|
| `sms-frontend/sms-frontend/src/api/axios.js` | 10 | `"http://localhost:5000/api"` | This is the **dev fallback only**. In production, the code at line 7-8 returns `"/api"` (relative URL) when not on localhost — so this line is **never reached in production**. No code change needed. |
| `sms-frontend/sms-frontend/.env` | 2 | `VITE_API_URL=http://localhost:5000/api` | Dev-only file — never deployed. Already in `.gitignore`. OK as-is. |
| `sms-frontend/sms-frontend/.env.production` | 1 | `VITE_API_URL=https://api.campussync.example.com/api` | **UPDATE THIS** to your real backend URL before deploying, e.g. `https://campussync.vercel.app/api` |
| `sms-frontend/sms-frontend/README.md` | 9, 18 | `localhost:5000` | Documentation only — no code impact. Update for clarity but not blocking. |
| `sms-backend/sms-backend/README.md` | 40, 47, 57, 63, 71, 79 | `localhost:5000` | Documentation only — no code impact. |

### Summary: Only 1 file needs an actual value change before deploying
> **`sms-frontend/sms-frontend/.env.production`**  
> Change `VITE_API_URL` from the placeholder to your real Vercel backend URL.  
> Everything else is either dev-only or documentation.

---

## Next Steps (in order)
1. ✅ Review this plan
2. 🗑️ Delete the `SAFE TO REMOVE` items (optional but recommended)
3. 🔧 Update `VITE_API_URL` in `.env.production` with the real backend URL
4. 🔑 Set `JWT_SECRET`, `CORS_ORIGIN`, and optionally `MONGO_URI` in the Vercel/host dashboard
5. 🚀 Push to GitHub → connect to Vercel → deploy
6. ✔️ Smoke test: login with each role, verify API calls use the production URL
