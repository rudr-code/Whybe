const express = require("express");
const router = express.Router();
const {
  markAttendance,
  getStudentAttendance,
  getAttendanceSummary,
} = require("../controllers/attendanceController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);

router.post("/", authorize("admin", "faculty"), markAttendance);
router.get("/summary/all", getAttendanceSummary); // powers the dashboard chart
router.get("/:studentId", getStudentAttendance);

module.exports = router;
