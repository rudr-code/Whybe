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
const getStudentById = async (req, res) => {
  const student = dataStore.findById("students", req.params.id);
  if (!student) return res.status(404).json({ message: "Student not found" });

  let studentMarks = [];
  if (process.env.MARKS_DATA_SOURCE === "supabase") {
    const { supabaseAdmin, isSupabaseConfigured } = require("../config/supabase");
    if (!isSupabaseConfigured || !supabaseAdmin) {
      console.error("MARKS_DATA_SOURCE is 'supabase' but Supabase client is not configured");
      return res.status(500).json({ message: "Supabase data source configuration error" });
    }

    try {
      const { resolveId } = require("./marksController");
      const crit = resolveId(student._id);

      const { data: studentRow, error: sErr } = await supabaseAdmin
        .from("students")
        .select("id")
        .eq(crit.column, crit.value)
        .maybeSingle();

      if (sErr) {
        console.error("Error resolving student in Supabase:", sErr);
        return res.status(500).json({ message: "Database error resolving student" });
      }

      if (studentRow) {
        const { data: marksData, error: mErr } = await supabaseAdmin
          .from("marks")
          .select("*, subjects!inner(id, legacy_id, code, name)")
          .eq("student_id", studentRow.id)
          .order("created_at", { ascending: true });

        if (mErr) {
          console.error("Error fetching marks from Supabase:", mErr);
          return res.status(500).json({ message: "Failed to fetch marks from database" });
        }

        studentMarks = (marksData || []).map(row => ({
          _id: row.legacy_id || row.id,
          id: row.id,
          studentId: student._id,
          subjectId: row.subjects?.legacy_id || row.subject_id,
          subjectCode: row.subjects?.code || "",
          subjectName: row.subjects?.name || "",
          midSem1: Number(row.mid_sem_1 ?? 0),
          midSem2: Number(row.mid_sem_2 ?? 0),
          endSem: Number(row.end_sem ?? 0),
          internal: Number(row.internal ?? 0),
          total: Number(row.total ?? 0),
          grade: row.grade || "F",
          semester: row.semester || "3",
        }));
      }
    } catch (err) {
      console.error("Unexpected error querying Supabase marks:", err);
      return res.status(500).json({ message: "Unexpected database query error" });
    }
  } else {
    studentMarks = dataStore.findByField("marks", "studentId", student._id);
  }

  // Include marks and attendance summary
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
