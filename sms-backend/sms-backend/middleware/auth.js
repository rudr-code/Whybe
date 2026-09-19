const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");
const connectDB = require("../config/db");

const JWT_SECRET = process.env.JWT_SECRET || "campussync_jwt_secret_2026";
const dataStore = require("../dataStore");

const DEMO_USERS_BY_ID = {
  "user-admin-001": { _id: "user-admin-001", name: "Dr. Rajesh Kumar", email: "admin@campussync.edu", role: "admin" },
  "user-faculty-001": { _id: "user-faculty-001", name: "Prof. Sunita Sharma", email: "prof.sharma@campussync.edu", role: "faculty" },
  "user-faculty-002": { _id: "user-faculty-002", name: "Prof. Vikram Mehta", email: "prof.mehta@campussync.edu", role: "faculty" },
  "user-ta-001": { _id: "user-ta-001", name: "Priya Desai", email: "ta.priya@campussync.edu", role: "ta" },
  "user-examcell-001": { _id: "user-examcell-001", name: "Exam Controller Office", email: "examcell@campussync.edu", role: "exam_cell" },
};

// Verifies the JWT and attaches the user to req.user
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];

    // 1. Try Supabase Auth verification first if configured
    try {
      const { supabaseAdmin, isSupabaseConfigured } = require("../config/supabase");
      if (isSupabaseConfigured && supabaseAdmin) {
        const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(token);
        if (!authError && authData?.user) {
          // Query authoritative role from public.profiles
          const { data: profile } = await supabaseAdmin
            .from("profiles")
            .select("id, legacy_id, name, email, role")
            .eq("id", authData.user.id)
            .maybeSingle();

          if (profile) {
            // If student, resolve studentRef
            let studentRef = null;
            if (profile.role === "student") {
              const { data: studentRecord } = await supabaseAdmin
                .from("students")
                .select("legacy_id, id")
                .eq("profile_id", profile.id)
                .maybeSingle();
              studentRef = studentRecord?.legacy_id || studentRecord?.id;
            }

            req.user = {
              _id: profile.legacy_id || profile.id,
              id: profile.id,
              name: profile.name,
              email: profile.email,
              role: profile.role,
              studentRef,
            };
            return next();
          }
        }
      }
    } catch {
      // Continue to legacy verification
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);

      // 2. Check in-memory dataStore first
      const storeUser = dataStore.findById("users", decoded.id);
      if (storeUser) {
        const { password, ...safeUser } = storeUser;
        req.user = safeUser;
        return next();
      }

      // 2. Try DB if connected
      try {
        await connectDB();
        if (mongoose.connection.readyState === 1) {
          const user = await User.findById(decoded.id).select("-password");
          if (user) {
            req.user = user;
            return next();
          }
        }
      } catch (dbErr) {
        // Continue to fallbacks
      }

      // 3. Check demo users map
      if (DEMO_USERS_BY_ID[decoded.id]) {
        req.user = DEMO_USERS_BY_ID[decoded.id];
        return next();
      }

      // 4. Default fallback with decoded role
      req.user = {
        _id: decoded.id,
        name: "Campus User",
        email: "user@campussync.edu",
        role: decoded.role || "student",
      };
      return next();
    } catch (err) {
      return res.status(401).json({ message: "Not authorized, token invalid" });
    }
  }

  return res.status(401).json({ message: "Not authorized, no token" });
};

// Restricts a route to specific roles, e.g. authorize("admin", "faculty")
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Role '${req.user?.role}' is not permitted to do this` });
    }
    next();
  };
};

module.exports = { protect, authorize };
