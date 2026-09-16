const dataStore = require("../dataStore");

// GET /api/students
const getStudents = (req, res) => {
  const { branch, section, search } = req.query;
  let result = [...dataStore.students];
  if (branch) result = result.filter(s => s.branch === branch);
  if (section) result = result.filter(s => s.section === section);
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(s =>
      s.name.toLowerCase().includes(q) || s.rollNo.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
    );
  }
  // Paginate: default 50 per page
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const start = (page - 1) * limit;
  const paginated = result.slice(start, start + limit);
  res.json({ students: paginated, total: result.length, page, totalPages: Math.ceil(result.length / limit) });
};

// GET /api/students/:id
const getStudentById = (req, res) => {
  const student = dataStore.findById("students", req.params.id);
  if (!student) return res.status(404).json({ message: "Student not found" });
  // Include marks and attendance summary
  const studentMarks = dataStore.findByField("marks", "studentId", student._id);
  const studentAttendance = dataStore.findByField("attendance", "studentId", student._id);
  const total = studentAttendance.length;
  const present = studentAttendance.filter(a => a.status === "present" || a.status === "compensated").length;
  const attendancePercent = total > 0 ? Math.round((present / total) * 100) : 0;
  res.json({ ...student, marks: studentMarks, attendanceSummary: { total, present, percent: attendancePercent } });
};

// POST /api/students
const createStudent = (req, res) => {
  const { name, rollNo, branch, section, email, contact, dob, semester, gender } = req.body;
  if (!name || !rollNo) return res.status(400).json({ message: "Name and Roll No are required" });
  const existing = dataStore.findOne("students", { rollNo });
  if (existing) return res.status(400).json({ message: "Student with this roll number already exists" });
  const student = dataStore.insert("students", {
    name, rollNo, branch: branch || "CSE", section: section || "A",
    semester: semester || "3", gender: gender || "male",
    email: email || "", contact: contact || "", dob: dob || "",
    parentalEducation: "", lunchType: "standard", testPrepStatus: "none",
    feeStatus: "pending", feeAmount: 75000,
  });
  // Also create a user account for this student
  if (email && dob) {
    dataStore.insert("users", {
      name, email: email.toLowerCase(), password: dob, role: "student", dob, studentRef: student._id,
    });
  }
  res.status(201).json(student);
};

// PUT /api/students/:id
const updateStudent = (req, res) => {
  const updated = dataStore.update("students", req.params.id, req.body);
  if (!updated) return res.status(404).json({ message: "Student not found" });
  res.json(updated);
};

// DELETE /api/students/:id
const deleteStudent = (req, res) => {
  const removed = dataStore.remove("students", req.params.id);
  if (!removed) return res.status(404).json({ message: "Student not found" });
  res.json({ message: "Student deleted" });
};

module.exports = { getStudents, getStudentById, createStudent, updateStudent, deleteStudent };
