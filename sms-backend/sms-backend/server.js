require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const { seedDatabase } = require("./utils/seedData");

const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const marksRoutes = require("./routes/marksRoutes");
const subjectRoutes = require("./routes/subjectRoutes");
const timetableRoutes = require("./routes/timetableRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const attendanceRequestRoutes = require("./routes/attendanceRequestRoutes");
const messMenuRoutes = require("./routes/messMenuRoutes");

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Pragma'],
}));
app.options('*', cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: "5mb" }));

// Prevent caching on all dynamic API endpoints
app.use((req, res, next) => {
  res.set({
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    "Pragma": "no-cache",
    "Expires": "0",
    "Surrogate-Control": "no-store",
  });
  next();
});

let seedingPromise = null;

// Connect DB on each request (production-safe serverless cached connection)
app.use(async (req, res, next) => {
  // Allow simple ping without DB requirement
  const path = req.path || req.url || "";
  if (path === "/health" || path === "/api/health" || path === "/") {
    return next();
  }

  try {
    await connectDB();

    // One-time automatic baseline seed if database is empty
    if (!seedingPromise && mongoose.connection.readyState === 1) {
      seedingPromise = seedDatabase(false).catch((err) => {
        console.error("Auto-seed error:", err.message);
      });
    }
    next();
  } catch (err) {
    console.error("Database connection failure:", err.message);
    return res.status(503).json({
      message: "Database unavailable. Please verify MONGO_URI / MONGODB_URI configuration.",
      error: err.message,
    });
  }
});

// Health checks
app.get(["/api/health", "/health", "/"], async (req, res) => {
  let dbStatus = "disconnected";
  try {
    if (process.env.MONGODB_URI || process.env.MONGO_URI) {
      await connectDB();
      dbStatus = mongoose.connection.readyState === 1 ? "connected" : "connecting";
    }
  } catch (e) {
    dbStatus = "error: " + e.message;
  }

  res.json({
    status: "ok",
    message: "Whybe CampusSync backend is running",
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", authRoutes);

app.use("/api/students", studentRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/marks", marksRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/attendance-requests", attendanceRequestRoutes);
app.use("/api/mess-menu", messMenuRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found", path: req.url });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack || err);
  res.status(500).json({ message: "Internal server error", error: err.message });
});

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

module.exports = app;

