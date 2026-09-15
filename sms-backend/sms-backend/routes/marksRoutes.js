const express = require("express");
const router = express.Router();
const {
  getMarks,
  getStudentMarks,
  getSubjectMarks,
  upsertMarks,
  updateMarks,
} = require("../controllers/marksController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);

router.get("/", getMarks);
router.get("/student/:studentId", getStudentMarks);
router.get("/subject/:subjectId", getSubjectMarks);
router.post("/", authorize("admin", "faculty", "ta", "exam_cell"), upsertMarks);
router.put("/:id", authorize("admin", "faculty", "ta", "exam_cell"), updateMarks);

module.exports = router;
