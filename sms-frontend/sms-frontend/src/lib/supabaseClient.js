import { createClient } from "@supabase/supabase-js";

const getEnv = (key) => {
  if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  return "";
};

const supabaseUrl =
  getEnv("VITE_SUPABASE_URL") ||
  getEnv("NEXT_PUBLIC_SUPABASE_URL");

const supabaseAnonKey =
  getEnv("VITE_SUPABASE_ANON_KEY") ||
  getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith("http") &&
    !supabaseUrl.includes("YOUR_SUPABASE_URL")
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
