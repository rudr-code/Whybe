require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

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
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('*', cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

// Trigger DB connection attempt on request
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (e) {
    // Continue even if DB connection fails
  }
  next();
});

// Health checks
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "CampusSync backend is running" });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "CampusSync backend is running" });
});

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "CampusSync backend is running" });
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
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong", error: err.message });
});

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

module.exports = app;
