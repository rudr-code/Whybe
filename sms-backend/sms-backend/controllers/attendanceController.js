const dataStore = require("../dataStore");

// GET /api/attendance/summary/all
const getSummaryAll = (req, res) => {
  const { branch, section } = req.query;
  let targetStudents = [...dataStore.students];
  if (branch) targetStudents = targetStudents.filter(s => s.branch === branch);
  if (section) targetStudents = targetStudents.filter(s => s.section === section);

  // Limit to first 100 for performance
  const limited = targetStudents.slice(0, 100);
  const summaries = limited.map(s => {
    const records = dataStore.findByField("attendance", "studentId", s._id);
    const total = records.length;
    const present = records.filter(a => a.status === "present" || a.status === "compensated").length;
    return {
      studentId: s._id, name: s.name, rollNo: s.rollNo, branch: s.branch, section: s.section,
      total, present, absent: total - present,
      attendancePercent: total > 0 ? Math.round((present / total) * 100) : 0,
    };
  });
  res.json(summaries);
};

// GET /api/attendance/student/:studentId
const getStudentAttendance = (req, res) => {
  const records = dataStore.findByField("attendance", "studentId", req.params.studentId);
  // Group by subject
  const bySubject = {};
  records.forEach(r => {
    if (!bySubject[r.subjectId]) {
      const subj = dataStore.findById("subjects", r.subjectId);
      bySubject[r.subjectId] = { subjectId: r.subjectId, subjectName: subj?.name || "Unknown", total: 0, present: 0, records: [] };
    }
    bySubject[r.subjectId].total++;
    if (r.status === "present" || r.status === "compensated") bySubject[r.subjectId].present++;
    bySubject[r.subjectId].records.push(r);
  });
  const subjects = Object.values(bySubject).map(s => ({
    ...s, percent: s.total > 0 ? Math.round((s.present / s.total) * 100) : 0,
    records: undefined,
  }));
  const total = records.length;
  const present = records.filter(r => r.status === "present" || r.status === "compensated").length;
  res.json({
    overall: { total, present, percent: total > 0 ? Math.round((present / total) * 100) : 0 },
    bySubject: subjects,
  });
};

// POST /api/attendance
const markAttendance = (req, res) => {
  const { studentId, subjectId, status, date } = req.body;
  if (!studentId || !status) return res.status(400).json({ message: "studentId and status are required" });
  const record = dataStore.insert("attendance", {
    studentId, subjectId: subjectId || null, date: date || new Date().toISOString().slice(0, 10),
    status, compensationReason: null, approvedBy: null,
  });
  res.status(201).json(record);
};

module.exports = { getSummaryAll, getStudentAttendance, markAttendance };
