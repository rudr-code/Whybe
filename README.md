# ERP Academic Suite — Frontend

A Next.js (App Router) frontend for the Student Performance Dashboard, built
to match and extend your deployed app: stat summary row, analytics section,
filterable/searchable/paginated student records table, and a new **student
detail page** for the "View" action.

Currently uses deterministic mock data (1,000 students) shaped exactly like
the Supabase `students` table your live site queries, so the UI and layout
are ready to go — swap in real Supabase with no component changes (see
"Connecting real Supabase data" below).

## Run it locally

You need [Node.js 18.18+](https://nodejs.org) installed.

```bash
cd erp-frontend
npm install
npm run dev
```

Then open **http://localhost:3000** in your browser. That's your local dev
server — I can't expose a live localhost link to you from here since this
runs in your own machine's browser, not mine; `npm run dev` is the way to
get it.

## Pages

- `/` — dashboard: stat row, analytics charts, filterable student table
- `/students/[id]` — student detail page, e.g. `/students/STU-0001`

## Connecting real Supabase data

Everything reads through `lib/data.js`. To go live:

1. `npm install @supabase/supabase-js` (already in `package.json`)
2. Create `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
3. In `lib/data.js`, replace the body of `getStudents`, `getStudentById`,
   `getSummary`, etc. with Supabase queries against your `students` table,
   keeping the same return shapes — every component keeps working unchanged.

## Deploy to Vercel

```bash
npm install -g vercel   # if you don't have it
vercel login
vercel                  # first deploy, follow prompts
vercel --prod           # promote to production
```

Or push this folder to a GitHub repo and import it in the
[Vercel dashboard](https://vercel.com/new) — same as your existing deployment.
If you connect real Supabase, add `NEXT_PUBLIC_SUPABASE_URL` and
`NEXT_PUBLIC_SUPABASE_ANON_KEY` as Environment Variables in the Vercel
project settings before deploying.

## Design notes

Ledger/report-card visual language: hairline borders instead of shadowed
cards, a serif (Source Serif 4) for headings paired with Inter for data and
UI text, tabular figures throughout so scores align, and a
chalkboard-green / brass-gold palette instead of default SaaS blues. Score
values are color-coded (green ≥75, brass 50–74, brick red <50) consistently
across the table and detail page.
