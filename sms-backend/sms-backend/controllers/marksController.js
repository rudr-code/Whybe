const dataStore = require("../dataStore");

// GET /api/marks?studentId=&subjectId=&semester=
const getMarks = (req, res) => {
  const { studentId, subjectId, semester } = req.query;
  let result = [...dataStore.marks];
  if (studentId) result = result.filter(m => m.studentId === studentId);
  if (subjectId) result = result.filter(m => m.subjectId === subjectId);
  if (semester) result = result.filter(m => m.semester === semester);
  res.json(result);
};

// GET /api/marks/student/:studentId
const getStudentMarks = (req, res) => {
  const result = dataStore.findByField("marks", "studentId", req.params.studentId);
  res.json(result);
};

// GET /api/marks/subject/:subjectId — all students' marks for a subject
const getSubjectMarks = (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const all = dataStore.findByField("marks", "subjectId", req.params.subjectId);
  // Enrich with student info
  const enriched = all.map(m => {
    const student = dataStore.findById("students", m.studentId);
    return { ...m, studentName: student?.name, rollNo: student?.rollNo, branch: student?.branch, section: student?.section };
  });
  const start = (parseInt(page) - 1) * parseInt(limit);
  const paginated = enriched.slice(start, start + parseInt(limit));
  res.json({ marks: paginated, total: enriched.length, page: parseInt(page), totalPages: Math.ceil(enriched.length / parseInt(limit)) });
};

// POST /api/marks — create or update marks
const upsertMarks = (req, res) => {
  const { studentId, subjectId, midSem1, midSem2, endSem, internal, semester } = req.body;
  if (!studentId || !subjectId) return res.status(400).json({ message: "studentId and subjectId are required" });

  const existing = dataStore.marks.find(m => m.studentId === studentId && m.subjectId === subjectId);
  const subj = dataStore.findById("subjects", subjectId);
  const total = (midSem1 || 0) + (midSem2 || 0) + (endSem || 0) + (internal || 0);
  const grade = calcGrade(total);

  if (existing) {
    const updated = dataStore.update("marks", existing._id, {
      midSem1: midSem1 ?? existing.midSem1, midSem2: midSem2 ?? existing.midSem2,
      endSem: endSem ?? existing.endSem, internal: internal ?? existing.internal,
      total, grade, semester: semester || existing.semester,
    });
    return res.json(updated);
  }

  const mark = dataStore.insert("marks", {
    studentId, subjectId, subjectCode: subj?.code || "", subjectName: subj?.name || "",
    midSem1: midSem1 || 0, midSem2: midSem2 || 0, endSem: endSem || 0, internal: internal || 0,
    total, grade, semester: semester || "3",
  });
  res.status(201).json(mark);
};

// PUT /api/marks/:id — update specific marks record
const updateMarks = (req, res) => {
  const existing = dataStore.findById("marks", req.params.id);
  if (!existing) return res.status(404).json({ message: "Marks record not found" });

  const midSem1 = req.body.midSem1 ?? existing.midSem1;
  const midSem2 = req.body.midSem2 ?? existing.midSem2;
  const endSem = req.body.endSem ?? existing.endSem;
  const internal = req.body.internal ?? existing.internal;
  const total = midSem1 + midSem2 + endSem + internal;

  const updated = dataStore.update("marks", req.params.id, {
    ...req.body, midSem1, midSem2, endSem, internal, total, grade: calcGrade(total),
  });
  res.json(updated);
};

function calcGrade(total) {
  if (total >= 90) return "A+";
  if (total >= 80) return "A";
  if (total >= 70) return "B+";
  if (total >= 60) return "B";
  if (total >= 50) return "C+";
  if (total >= 40) return "C";
  if (total >= 30) return "D";
  return "F";
}

module.exports = { getMarks, getStudentMarks, getSubjectMarks, upsertMarks, updateMarks };
