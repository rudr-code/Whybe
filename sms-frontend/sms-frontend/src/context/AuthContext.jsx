import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";

const AuthContext = createContext(null);

const DEMO_USERS = {
  "admin@sms.com": {
    _id: "669000000000000000000001",
    name: "Admin User",
    email: "admin@sms.com",
    role: "admin",
  },
  "faculty@sms.com": {
    _id: "669000000000000000000002",
    name: "Faculty User",
    email: "faculty@sms.com",
    role: "faculty",
  },
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("sms_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        localStorage.removeItem("sms_user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const cleanEmail = email.toLowerCase().trim();

    // 1. Try Supabase Auth if configured
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (!error && data?.user) {
          const userObj = {
            _id: data.user.id,
            name: data.user.user_metadata?.name || data.user.email.split("@")[0],
            email: data.user.email,
            role: data.user.user_metadata?.role || (cleanEmail.includes("faculty") ? "faculty" : "admin"),
            token: data.session?.access_token || "supabase_token",
          };

          localStorage.setItem("sms_token", userObj.token);
          localStorage.setItem("sms_user", JSON.stringify(userObj));
          setUser(userObj);
          return userObj;
        }
      } catch (sbErr) {
        console.warn("Supabase Auth error, checking API/demo fallback:", sbErr.message);
      }
    }

    // 2. Try API backend login
    try {
      const { data } = await api.post("/auth/login", { email: cleanEmail, password });
      localStorage.setItem("sms_token", data.token);
      localStorage.setItem("sms_user", JSON.stringify(data));
      setUser(data);
      return data;
    } catch (apiErr) {
      // 3. Demo user fallback check
      const demo = DEMO_USERS[cleanEmail];
      if (demo && (password === "admin123" || password === "faculty123")) {
        const demoData = {
          ...demo,
          token: "demo_jwt_token_" + demo.role,
        };
        localStorage.setItem("sms_token", demoData.token);
        localStorage.setItem("sms_user", JSON.stringify(demoData));
        setUser(demoData);
        return demoData;
      }

      const errMsg =
        apiErr.response?.data?.message ||
        (apiErr.message ? `Login error: ${apiErr.message}` : "Invalid email or password");
      throw new Error(errMsg);
    }
  };

  const logout = () => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.signOut().catch(() => {});
    }
    localStorage.removeItem("sms_token");
    localStorage.removeItem("sms_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
