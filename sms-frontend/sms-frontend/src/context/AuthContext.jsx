import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";

const AuthContext = createContext(null);

export const DEMO_CREDENTIALS = [
  { role: "admin", roleName: "Admin", email: "admin@campussync.edu", password: "admin123", desc: "System Administration & Analytics" },
  { role: "faculty", roleName: "Faculty", email: "prof.sharma@campussync.edu", password: "faculty123", desc: "Academics & Attendance Approval" },
  { role: "ta", roleName: "Teaching Assistant", email: "ta.priya@campussync.edu", password: "ta123", desc: "Marks Entry & Timetable Management" },
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
    password: "ta123",
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
            role: data.user.user_metadata?.role || "student",
            token: data.session?.access_token || "supabase_token",
          };

          localStorage.setItem("sms_token", userObj.token);
          localStorage.setItem("sms_user", JSON.stringify(userObj));
          setUser(userObj);
          return userObj;
        }
      } catch (sbErr) {
        console.warn("Supabase Auth error, fallback to API/demo:", sbErr.message);
      }
    }

    // 2. Try Express API backend login
    try {
      const { data } = await api.post("/auth/login", { email: cleanEmail, password });
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

  const logout = () => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.signOut().catch(() => {});
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
