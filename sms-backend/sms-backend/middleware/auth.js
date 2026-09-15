const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");
const connectDB = require("../config/db");

const JWT_SECRET = process.env.JWT_SECRET || "sms_jwt_secret_key_2026";

const DEMO_USERS_BY_ID = {
  "669000000000000000000001": {
    _id: "669000000000000000000001",
    name: "Admin User",
    email: "admin@sms.com",
    role: "admin",
  },
  "669000000000000000000002": {
    _id: "669000000000000000000002",
    name: "Faculty User",
    email: "faculty@sms.com",
    role: "faculty",
  },
};

// Verifies the JWT and attaches the user to req.user
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET);

      await connectDB();

      if (mongoose.connection.readyState === 1) {
        const user = await User.findById(decoded.id).select("-password");
        if (user) {
          req.user = user;
          return next();
        }
      }

      if (DEMO_USERS_BY_ID[decoded.id]) {
        req.user = DEMO_USERS_BY_ID[decoded.id];
        return next();
      }

      // Default fallback demo user
      req.user = {
        _id: decoded.id,
        name: "Admin User",
        email: "admin@sms.com",
        role: "admin",
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
