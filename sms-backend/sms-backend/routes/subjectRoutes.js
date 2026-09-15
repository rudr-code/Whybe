const express = require("express");
const router = express.Router();
const {
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
} = require("../controllers/subjectController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);

router.get("/", getSubjects);
router.get("/:id", getSubjectById);
router.post("/", authorize("admin", "exam_cell"), createSubject);
router.put("/:id", authorize("admin", "exam_cell"), updateSubject);
router.delete("/:id", authorize("admin", "exam_cell"), deleteSubject);

module.exports = router;
