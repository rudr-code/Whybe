const express = require("express");
const router = express.Router();
const {
  getAttendanceRequests,
  createRequest,
  taReview,
  facultyApprove,
} = require("../controllers/attendanceRequestController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);

router.get("/", getAttendanceRequests);
router.post("/", createRequest);
router.put("/:id/ta-review", authorize("admin", "ta"), taReview);
router.put("/:id/faculty-approve", authorize("admin", "faculty"), facultyApprove);

module.exports = router;
