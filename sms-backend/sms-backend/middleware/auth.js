const jwt = require("jsonwebtoken");
const User = require("../models/User");
const connectDB = require("../config/db");

const JWT_SECRET = process.env.JWT_SECRET || "campussync_jwt_secret_2026";

// Verifies the JWT and attaches the MongoDB user to req.user
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET);

      await connectDB();
      const user = await User.findById(decoded.id).select("-password").lean();

      if (!user) {
        return res.status(401).json({ message: "Not authorized, user not found" });
      }

      req.user = user;
      return next();
    } catch (err) {
      console.error("Auth middleware verification error:", err.message);
      return res.status(401).json({ message: "Not authorized, token invalid or expired" });
    }
  }

  return res.status(401).json({ message: "Not authorized, no token provided" });
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

