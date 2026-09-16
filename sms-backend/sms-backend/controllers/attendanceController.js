const Attendance = require("../models/Attendance");
const Student = require("../models/Student");
const Subject = require("../models/Subject");

// GET /api/attendance/summary/all
const getSummaryAll = async (req, res) => {
  try {
    const { branch, section } = req.query;
    const filter = {};
    if (branch) filter.branch = branch;
    if (section) filter.section = section;

    const students = await Student.find(filter).limit(100).lean();
    const studentIds = students.map((s) => s._id);

    const records = await Attendance.find({ studentId: { $in: studentIds } }).lean();

    const attendanceByStudent = new Map();
    for (const r of records) {
      if (!attendanceByStudent.has(r.studentId)) {
        attendanceByStudent.set(r.studentId, { total: 0, present: 0 });
      }
      const st = attendanceByStudent.get(r.studentId);
      st.total++;
      if (r.status === "present" || r.status === "compensated") {
        st.present++;
      }
    }

    const summaries = students.map((s) => {
      const stats = attendanceByStudent.get(s._id) || { total: 0, present: 0 };
      const total = stats.total;
      const present = stats.present;
      return {
        studentId: s._id,
        name: s.name,
        rollNo: s.rollNo,
        branch: s.branch,
        section: s.section,
        total,
        present,
        absent: total - present,
        attendancePercent: total > 0 ? Math.round((present / total) * 100) : 0,
      };
    });

    return res.json(summaries);
  } catch (err) {
    console.error("Error in getSummaryAll:", err);
    return res.status(500).json({ message: err.message });
  }
};

// GET /api/attendance/student/:studentId
const getStudentAttendance = async (req, res) => {
  try {
    const records = await Attendance.find({ studentId: req.params.studentId }).lean();
    const subjects = await Subject.find().lean();
    const subjectMap = new Map(subjects.map((s) => [s._id, s.name]));

    const bySubject = {};
    records.forEach((r) => {
      const sId = r.subjectId || "general";
      if (!bySubject[sId]) {
        bySubject[sId] = {
          subjectId: sId,
          subjectName: subjectMap.get(sId) || "General Course",
          total: 0,
          present: 0,
        };
      }
      bySubject[sId].total++;
      if (r.status === "present" || r.status === "compensated") {
        bySubject[sId].present++;
      }
    });

    const subjectList = Object.values(bySubject).map((s) => ({
      ...s,
      percent: s.total > 0 ? Math.round((s.present / s.total) * 100) : 0,
    }));

    const total = records.length;
    const present = records.filter((r) => r.status === "present" || r.status === "compensated").length;

    return res.json({
      overall: {
        total,
        present,
        percent: total > 0 ? Math.round((present / total) * 100) : 0,
      },
      bySubject: subjectList,
    });
  } catch (err) {
    console.error("Error in getStudentAttendance:", err);
    return res.status(500).json({ message: err.message });
  }
};

// POST /api/attendance
const markAttendance = async (req, res) => {
  try {
    const { studentId, subjectId, status, date } = req.body;
    if (!studentId || !status) {
      return res.status(400).json({ message: "studentId and status are required" });
    }

    const record = await Attendance.create({
      studentId,
      subjectId: subjectId || null,
      date: date || new Date().toISOString().slice(0, 10),
      status,
      compensationReason: null,
      approvedBy: null,
    });

    return res.status(201).json(record);
  } catch (err) {
    console.error("Error in markAttendance:", err);
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { getSummaryAll, getStudentAttendance, markAttendance };

