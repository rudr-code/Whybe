const express = require("express");
const router = express.Router();
const {
  markAttendance,
  getStudentAttendance,
  getSummaryAll,
} = require("../controllers/attendanceController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);

router.post("/", authorize("admin", "faculty", "ta"), markAttendance);
router.get("/summary/all", getSummaryAll); // powers the dashboard chart
router.get("/:studentId", getStudentAttendance);

module.exports = router;
