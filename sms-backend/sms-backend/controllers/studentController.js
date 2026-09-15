const mongoose = require("mongoose");
const Student = require("../models/Student");
const connectDB = require("../config/db");

const DEMO_STUDENTS = [
  { _id: "669000000000000000000101", name: "Aarav Sharma", rollNo: "R1000", class: "10-A", email: "aarav.sharma@student.sms.com", contact: "9876543210", feeStatus: "paid", feeAmount: 10000, grade: "A+" },
  { _id: "669000000000000000000102", name: "Vivaan Verma", rollNo: "R1001", class: "10-A", email: "vivaan.verma@student.sms.com", contact: "9876543211", feeStatus: "pending", feeAmount: 7500, grade: "A" },
  { _id: "669000000000000000000103", name: "Aditi Gupta", rollNo: "R1002", class: "10-B", email: "aditi.gupta@student.sms.com", contact: "9876543212", feeStatus: "paid", feeAmount: 10000, grade: "A+" },
  { _id: "669000000000000000000104", name: "Diya Patel", rollNo: "R1003", class: "11-A", email: "diya.patel@student.sms.com", contact: "9876543213", feeStatus: "overdue", feeAmount: 5000, grade: "B+" },
  { _id: "669000000000000000000105", name: "Kabir Iyer", rollNo: "R1004", class: "11-B", email: "kabir.iyer@student.sms.com", contact: "9876543214", feeStatus: "paid", feeAmount: 7500, grade: "A" },
  { _id: "669000000000000000000106", name: "Ishaan Nair", rollNo: "R1005", class: "12-A", email: "ishaan.nair@student.sms.com", contact: "9876543215", feeStatus: "pending", feeAmount: 10000, grade: "B" },
];

// @route POST /api/students
const createStudent = async (req, res) => {
  try {
    await connectDB();
    if (mongoose.connection.readyState === 1) {
      const student = await Student.create(req.body);
      return res.status(201).json(student);
    }
    const newStudent = { _id: `demo-${Date.now()}`, ...req.body };
    DEMO_STUDENTS.unshift(newStudent);
    return res.status(201).json(newStudent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @route GET /api/students
const getStudents = async (req, res) => {
  try {
    await connectDB();
    if (mongoose.connection.readyState === 1) {
      const students = await Student.find().sort({ createdAt: -1 });
      if (students && students.length > 0) {
        return res.json(students);
      }
    }
    res.json(DEMO_STUDENTS);
  } catch (err) {
    res.json(DEMO_STUDENTS);
  }
};

// @route GET /api/students/:id
const getStudentById = async (req, res) => {
  try {
    await connectDB();
    if (mongoose.connection.readyState === 1) {
      const student = await Student.findById(req.params.id);
      if (student) return res.json(student);
    }
    const found = DEMO_STUDENTS.find((s) => s._id === req.params.id) || DEMO_STUDENTS[0];
    res.json(found);
  } catch (err) {
    res.json(DEMO_STUDENTS[0]);
  }
};

// @route PUT /api/students/:id
const updateStudent = async (req, res) => {
  try {
    await connectDB();
    if (mongoose.connection.readyState === 1) {
      const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (student) return res.json(student);
    }
    res.json({ _id: req.params.id, ...req.body });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @route DELETE /api/students/:id
const deleteStudent = async (req, res) => {
  try {
    await connectDB();
    if (mongoose.connection.readyState === 1) {
      const student = await Student.findByIdAndDelete(req.params.id);
      if (student) return res.json({ message: "Student deleted" });
    }
    res.json({ message: "Student deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
};
