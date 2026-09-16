const Marks = require("../models/Marks");
const Student = require("../models/Student");
const Subject = require("../models/Subject");

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

// GET /api/marks?studentId=&subjectId=&semester=
const getMarks = async (req, res) => {
  try {
    const { studentId, subjectId, semester } = req.query;
    const filter = {};
    if (studentId) filter.studentId = studentId;
    if (subjectId) filter.subjectId = subjectId;
    if (semester) filter.semester = semester;
    const result = await Marks.find(filter).lean();
    return res.json(result);
  } catch (err) {
    console.error("Error in getMarks:", err);
    return res.status(500).json({ message: err.message });
  }
};

// GET /api/marks/student/:studentId
const getStudentMarks = async (req, res) => {
  try {
    const result = await Marks.find({ studentId: req.params.studentId }).lean();
    return res.json(result);
  } catch (err) {
    console.error("Error in getStudentMarks:", err);
    return res.status(500).json({ message: err.message });
  }
};

// GET /api/marks/subject/:subjectId — all students' marks for a subject
const getSubjectMarks = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const query = { subjectId: req.params.subjectId };

    const total = await Marks.countDocuments(query);
    const marksList = await Marks.find(query)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();

    // Enrich with student information
    const studentIds = marksList.map((m) => m.studentId);
    const students = await Student.find({ _id: { $in: studentIds } }).lean();
    const studentMap = new Map(students.map((s) => [s._id, s]));

    const enriched = marksList.map((m) => {
      const student = studentMap.get(m.studentId);
      return {
        ...m,
        studentName: student?.name || "Student",
        rollNo: student?.rollNo || "",
        branch: student?.branch || "",
        section: student?.section || "",
      };
    });

    return res.json({
      marks: enriched,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    console.error("Error in getSubjectMarks:", err);
    return res.status(500).json({ message: err.message });
  }
};

// POST /api/marks — create or update marks
const upsertMarks = async (req, res) => {
  try {
    const { studentId, subjectId, midSem1, midSem2, endSem, internal, semester } = req.body;
    if (!studentId || !subjectId) {
      return res.status(400).json({ message: "studentId and subjectId are required" });
    }

    const existing = await Marks.findOne({ studentId, subjectId });
    const subj = await Subject.findById(subjectId).lean();

    const m1 = midSem1 !== undefined ? Number(midSem1) : existing ? existing.midSem1 : 0;
    const m2 = midSem2 !== undefined ? Number(midSem2) : existing ? existing.midSem2 : 0;
    const end = endSem !== undefined ? Number(endSem) : existing ? existing.endSem : 0;
    const intern = internal !== undefined ? Number(internal) : existing ? existing.internal : 0;
    const total = m1 + m2 + end + intern;
    const grade = calcGrade(total);

    const markData = {
      studentId,
      subjectId,
      subjectCode: subj?.code || existing?.subjectCode || "",
      subjectName: subj?.name || existing?.subjectName || "",
      midSem1: m1,
      midSem2: m2,
      endSem: end,
      internal: intern,
      total,
      grade,
      semester: semester || existing?.semester || "3",
    };

    const mark = await Marks.findOneAndUpdate(
      { studentId, subjectId },
      { $set: markData },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json(mark);
  } catch (err) {
    console.error("Error in upsertMarks:", err);
    return res.status(500).json({ message: err.message });
  }
};

// PUT /api/marks/:id — update specific marks record
const updateMarks = async (req, res) => {
  try {
    const existing = await Marks.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Marks record not found" });

    const midSem1 = req.body.midSem1 !== undefined ? Number(req.body.midSem1) : existing.midSem1;
    const midSem2 = req.body.midSem2 !== undefined ? Number(req.body.midSem2) : existing.midSem2;
    const endSem = req.body.endSem !== undefined ? Number(req.body.endSem) : existing.endSem;
    const internal = req.body.internal !== undefined ? Number(req.body.internal) : existing.internal;
    const total = midSem1 + midSem2 + endSem + internal;
    const grade = calcGrade(total);

    const updated = await Marks.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        midSem1,
        midSem2,
        endSem,
        internal,
        total,
        grade,
      },
      { new: true }
    );

    return res.json(updated);
  } catch (err) {
    console.error("Error in updateMarks:", err);
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { getMarks, getStudentMarks, getSubjectMarks, upsertMarks, updateMarks };

