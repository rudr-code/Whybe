const Student = require("../models/Student");
const User = require("../models/User");
const Marks = require("../models/Marks");
const Attendance = require("../models/Attendance");

// GET /api/students
const getStudents = async (req, res) => {
  try {
    const { branch, section, search } = req.query;
    const filter = {};

    if (branch) filter.branch = branch;
    if (section) filter.section = section;
    if (search && search.trim()) {
      const q = search.trim();
      const regex = new RegExp(q, "i");
      filter.$or = [{ name: regex }, { rollNo: regex }, { email: regex }];
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 50);

    const total = await Student.countDocuments(filter);
    const students = await Student.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return res.json({
      students,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (err) {
    console.error("Error in getStudents:", err);
    return res.status(500).json({ message: err.message });
  }
};

// GET /api/students/:id
const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).lean();
    if (!student) return res.status(404).json({ message: "Student not found" });

    // Include marks and attendance summary
    const studentMarks = await Marks.find({ studentId: student._id }).lean();
    const studentAttendance = await Attendance.find({ studentId: student._id }).lean();
    const total = studentAttendance.length;
    const present = studentAttendance.filter(
      (a) => a.status === "present" || a.status === "compensated"
    ).length;
    const attendancePercent = total > 0 ? Math.round((present / total) * 100) : 0;

    return res.json({
      ...student,
      marks: studentMarks,
      attendanceSummary: { total, present, percent: attendancePercent },
    });
  } catch (err) {
    console.error("Error in getStudentById:", err);
    return res.status(500).json({ message: err.message });
  }
};

// POST /api/students
const createStudent = async (req, res) => {
  try {
    const { name, rollNo, branch, section, email, contact, dob, semester, gender } = req.body;
    if (!name || !rollNo) {
      return res.status(400).json({ message: "Name and Roll No are required" });
    }

    const existing = await Student.findOne({ rollNo });
    if (existing) {
      return res.status(400).json({ message: "Student with this roll number already exists" });
    }

    const student = await Student.create({
      name,
      rollNo,
      branch: branch || "CSE",
      section: section || "A",
      semester: semester || "3",
      gender: gender || "male",
      email: email || "",
      contact: contact || "",
      dob: dob || "",
      parentalEducation: "",
      lunchType: "standard",
      testPrepStatus: "none",
      feeStatus: "pending",
      feeAmount: 75000,
    });

    // Also create a user account for this student if email and DOB are provided
    if (email && dob) {
      const cleanEmail = email.toLowerCase().trim();
      const existingUser = await User.findOne({ email: cleanEmail });
      if (!existingUser) {
        await User.create({
          name,
          email: cleanEmail,
          password: dob,
          role: "student",
          dob,
          studentRef: student._id,
        });
      }
    }

    return res.status(201).json(student);
  } catch (err) {
    console.error("Error in createStudent:", err);
    return res.status(500).json({ message: err.message });
  }
};

// PUT /api/students/:id
const updateStudent = async (req, res) => {
  try {
    const updated = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).lean();
    if (!updated) return res.status(404).json({ message: "Student not found" });
    return res.json(updated);
  } catch (err) {
    console.error("Error in updateStudent:", err);
    return res.status(500).json({ message: err.message });
  }
};

// DELETE /api/students/:id
const deleteStudent = async (req, res) => {
  try {
    const removed = await Student.findByIdAndDelete(req.params.id);
    if (!removed) return res.status(404).json({ message: "Student not found" });
    // Clean up corresponding User if exists
    await User.findOneAndDelete({ studentRef: req.params.id });
    return res.json({ message: "Student deleted" });
  } catch (err) {
    console.error("Error in deleteStudent:", err);
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { getStudents, getStudentById, createStudent, updateStudent, deleteStudent };

