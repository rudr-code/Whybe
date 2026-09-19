-- ============================================================
-- Migration 3: Enable Realtime for public.marks ONLY
-- Adds public.marks to the supabase_realtime publication.
-- Keeps the default replica identity (primary key: id).
-- ============================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.marks;
