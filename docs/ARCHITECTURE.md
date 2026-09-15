# CampusSync Architecture & Authentication Flow

## Authentication Architecture Overview

CampusSync uses a resilient multi-tier authentication system supporting Supabase Auth, Node.js/Express Serverless API Auth, and Demo Mode Fallbacks.

```text
                  +-------------------------+
                  |   React + Vite Frontend |
                  |   (Login Component)     |
                  +------------+------------+
                               |
         +---------------------+---------------------+
         |                                           |
         v                                           v
[Supabase Auth Client]                    [Backend Express API]
(NEXT_PUBLIC_SUPABASE_URL)                (/api/auth/login)
         |                                           |
         v                                           v
(Supabase auth.users)                     (MongoDB / Demo Users)
```

## Layered Auth Fallback Order

1. **Layer 1: Supabase Auth**
   - Active when `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are provided.
   - Calls `supabase.auth.signInWithPassword({ email, password })`.

2. **Layer 2: Express Backend API**
   - Route: `/api/auth/login`.
   - Queries MongoDB if `MONGO_URI` is connected.

3. **Layer 3: Demo Account Fallback**
   - Credentials: `admin@sms.com` / `admin123` & `faculty@sms.com` / `faculty123`.
   - Generates JWT token and stores session in `localStorage`.
