const express = require("express");
const router = express.Router();
const {
  getTimetable,
  updateTimetableEntry,
  createTimetableEntry,
  deleteTimetableEntry,
} = require("../controllers/timetableController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);

router.get("/", getTimetable);
router.post("/", authorize("admin", "ta"), createTimetableEntry);
router.put("/:id", authorize("admin", "ta"), updateTimetableEntry);
router.delete("/:id", authorize("admin", "ta"), deleteTimetableEntry);

module.exports = router;
