import axios from "axios";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";

const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
    return "/api";
  }
  return "http://localhost:5000/api";
};

const api = axios.create({
  baseURL: getBaseURL(),
});

// Attach the JWT to every request once the user is logged in
api.interceptors.request.use(async (config) => {
  let token = localStorage.getItem("sms_token");

  // Always prefer fresh Supabase session token to prevent 1-hour expiration
  if (isSupabaseConfigured && supabase) {
    try {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.access_token) {
        token = data.session.access_token;
        localStorage.setItem("sms_token", token);
      }
    } catch {
      // Fall back to stored token
    }
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
