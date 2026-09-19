const jwt = require("jsonwebtoken");
const dataStore = require("../dataStore");

const JWT_SECRET = process.env.JWT_SECRET || "campussync_jwt_secret_2026";
const generateToken = (id, role) => jwt.sign({ id, role }, JWT_SECRET, { expiresIn: "7d" });

// @route POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    const cleanEmail = email.toLowerCase().trim();
    const user = dataStore.findOne("users", { email: cleanEmail });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // For students: password is DOB (YYYY-MM-DD)
    // For staff: password is plaintext match
    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Lazy provisioning in Supabase if missing
    try {
      const { supabaseAdmin, isSupabaseConfigured } = require("../config/supabase");
      if (isSupabaseConfigured && supabaseAdmin) {
        const { data: existingProfile, error: pCheckErr } = await supabaseAdmin
          .from("profiles")
          .select("id, email")
          .eq("email", cleanEmail)
          .maybeSingle();

        if (pCheckErr) {
          console.error("Supabase profile check error during login:", pCheckErr.message);
        }

        let authUserId = existingProfile?.id;

        if (!existingProfile) {
          const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
            email: cleanEmail,
            password: password,
            email_confirm: true,
            user_metadata: { name: user.name }, // role removed from user_metadata
          });

          if (authErr) {
            if (authErr.message?.toLowerCase().includes("already registered") || authErr.message?.toLowerCase().includes("already exists")) {
              // Idempotent recovery: locate auth user ID via paginated listUsers
              let page = 1;
              const perPage = 1000;
              while (true) {
                const { data: listData, error: listErr } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
                if (listErr) {
                  console.error("Supabase admin listUsers error:", listErr.message);
                  break;
                }
                const users = listData?.users || [];
                const found = users.find(u => u.email?.toLowerCase().trim() === cleanEmail);
                if (found) {
                  authUserId = found.id;
                  break;
                }
                if (users.length < perPage) break;
                page++;
              }
            } else {
              console.error("Supabase admin createUser error:", authErr.message);
            }
          } else {
            authUserId = authData?.user?.id;
          }
        }

        if (authUserId) {
          const { error: upsertErr } = await supabaseAdmin.from("profiles").upsert({
            id: authUserId,
            legacy_id: user._id,
            name: user.name,
            email: cleanEmail,
            role: user.role, // role stored strictly in public.profiles
          });

          if (upsertErr) {
            console.error("Supabase profile upsert error:", upsertErr.message);
          }

          if (user.role === "student" && user.studentRef) {
            const { error: linkErr } = await supabaseAdmin
              .from("students")
              .update({ profile_id: authUserId })
              .eq("legacy_id", user.studentRef)
              .is("profile_id", null);

            if (linkErr) {
              console.error("Error linking student profile_id in Supabase:", linkErr.message);
            }
          }
        }
      }
    } catch (sbErr) {
      console.error("Supabase lazy provisioning exception during login:", sbErr);
    }

    const response = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    };

    // If student, include studentRef
    if (user.role === "student" && user.studentRef) {
      response.studentRef = user.studentRef;
    }

    return res.json(response);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }
    const existing = dataStore.findOne("users", { email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ message: "User with this email already exists" });
    }
    const user = dataStore.insert("users", {
      name, email: email.toLowerCase().trim(), password, role: role || "student", dob: password,
    });
    return res.status(201).json({
      _id: user._id, name: user.name, email: user.email, role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/auth/me
const getMe = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Not authenticated" });
  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = dataStore.findById("users", decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const { password, ...safeUser } = user;
    return res.json(safeUser);
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = { register, login, getMe };
