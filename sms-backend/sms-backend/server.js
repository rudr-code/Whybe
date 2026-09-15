require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");

const app = express();

// Middleware
app.use(cors());
app.options("*", cors());
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
  res.json({ status: "ok", message: "SMS backend is running" });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "SMS backend is running" });
});

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "SMS backend is running" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", authRoutes);

app.use("/api/students", studentRoutes);
app.use("/api/attendance", attendanceRoutes);

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
