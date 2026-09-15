const express = require("express");
const router = express.Router();
const {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} = require("../controllers/studentController");
const { protect, authorize } = require("../middleware/auth");

// All routes below require a valid token
router.use(protect);

// Everyone logged in can view the list / a single record
router.get("/", getStudents);
router.get("/:id", getStudentById);

// Only admin/faculty can create, edit, or delete records
router.post("/", authorize("admin", "faculty"), createStudent);
router.put("/:id", authorize("admin", "faculty"), updateStudent);
router.delete("/:id", authorize("admin"), deleteStudent);

module.exports = router;
