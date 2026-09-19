import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";

const AuthContext = createContext(null);

export const DEMO_CREDENTIALS = [
  { role: "admin", roleName: "Admin", email: "admin@campussync.edu", password: "admin123", desc: "System Administration & Analytics" },
  { role: "faculty", roleName: "Faculty", email: "prof.sharma@campussync.edu", password: "faculty123", desc: "Academics & Attendance Approval" },
  { role: "ta", roleName: "Teaching Assistant", email: "ta.priya@campussync.edu", password: "ta123456", desc: "Marks Entry & Timetable Management" },
  { role: "student", roleName: "Student", email: "aarav.sharma@campussync.edu", password: "2005-03-15", desc: "Personal Academics, Timetable, Mess" },
  { role: "exam_cell", roleName: "Examination Cell", email: "examcell@campussync.edu", password: "examcell123", desc: "Curriculum & Grade Verifications" },
];

const DEMO_USERS = {
  "admin@campussync.edu": {
    _id: "user-admin-001",
    name: "Dr. Rajesh Kumar",
    email: "admin@campussync.edu",
    role: "admin",
    password: "admin123",
  },
  "prof.sharma@campussync.edu": {
    _id: "user-faculty-001",
    name: "Prof. Sunita Sharma",
    email: "prof.sharma@campussync.edu",
    role: "faculty",
    password: "faculty123",
  },
  "ta.priya@campussync.edu": {
    _id: "user-ta-001",
    name: "Priya Desai",
    email: "ta.priya@campussync.edu",
    role: "ta",
    password: "ta123456",
  },
  "aarav.sharma@campussync.edu": {
    _id: "user-student-0001",
    studentRef: "student-0001",
    name: "Aarav Sharma",
    email: "aarav.sharma@campussync.edu",
    role: "student",
    password: "2005-03-15",
    dob: "2005-03-15",
  },
  "examcell@campussync.edu": {
    _id: "user-examcell-001",
    name: "Exam Controller Office",
    email: "examcell@campussync.edu",
    role: "exam_cell",
    password: "examcell123",
  },
  // Legacy aliases
  "admin@sms.com": {
    _id: "user-admin-001",
    name: "Dr. Rajesh Kumar",
    email: "admin@campussync.edu",
    role: "admin",
    password: "admin123",
  },
  "faculty@sms.com": {
    _id: "user-faculty-001",
    name: "Prof. Sunita Sharma",
    email: "prof.sharma@campussync.edu",
    role: "faculty",
    password: "faculty123",
  },
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const stored = localStorage.getItem("sms_user");
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch (e) {
          localStorage.removeItem("sms_user");
        }
      }

      if (isSupabaseConfigured && supabase) {
        try {
          const { data } = await supabase.auth.getSession();
          if (data?.session?.access_token) {
            localStorage.setItem("sms_token", data.session.access_token);
          }
        } catch {
          // Keep stored token
        }
      }
      setLoading(false);
    };

    restoreSession();
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

        if (!error && data?.user && data?.session?.access_token) {
          // Fetch authoritative role and name from public.profiles (never from user_metadata)
          const { data: profile, error: profileErr } = await supabase
            .from("profiles")
            .select("id, legacy_id, name, role, email")
            .eq("id", data.user.id)
            .maybeSingle();

          if (!profileErr && profile && profile.role) {
            let studentRef = null;
            if (profile.role === "student") {
              const { data: studentRecord } = await supabase
                .from("students")
                .select("id, legacy_id")
                .eq("profile_id", data.user.id)
                .maybeSingle();
              studentRef = studentRecord?.legacy_id || null;
            }

            const userObj = {
              _id: profile.legacy_id || data.user.id,
              id: data.user.id,
              name: profile.name || data.user.email.split("@")[0],
              email: profile.email || data.user.email,
              role: profile.role,
              studentRef,
              token: data.session.access_token,
            };

            localStorage.setItem("sms_token", userObj.token);
            localStorage.setItem("sms_user", JSON.stringify(userObj));
            setUser(userObj);
            return userObj;
          }
          // If profile missing or errored, treat Supabase tier as failed -> fall through
        }
      } catch (sbErr) {
        console.warn("Supabase Auth error, fallback to API/demo:", sbErr.message);
      }
    }

    // Clear any stale Supabase session before falling back to Express / demo tier
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch {}
    }

    // 2. Try Express API backend login
    try {
      const { data } = await api.post("/auth/login", { email: cleanEmail, password });

      // After Express login succeeds (and provisions missing account in Supabase),
      // call Supabase signInWithPassword to acquire native Supabase session for Realtime
      if (isSupabaseConfigured && supabase) {
        try {
          const sbRetry = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password,
          });
          if (sbRetry.data?.session?.access_token) {
            data.token = sbRetry.data.session.access_token;
          }
        } catch {
          // Keep API token if Supabase sign-in fails
        }
      }

      localStorage.setItem("sms_token", data.token);
      localStorage.setItem("sms_user", JSON.stringify(data));
      setUser(data);
      return data;
    } catch (apiErr) {
      // 3. Fallback to client-side demo users if backend is unreachable or local
      const demo = DEMO_USERS[cleanEmail];
      if (demo && demo.password === password) {
        const demoData = {
          _id: demo._id,
          name: demo.name,
          email: demo.email,
          role: demo.role,
          studentRef: demo.studentRef,
          dob: demo.dob,
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

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch {}
    }
    localStorage.removeItem("sms_token");
    localStorage.removeItem("sms_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, DEMO_CREDENTIALS }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
