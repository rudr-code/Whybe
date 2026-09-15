const Attendance = require("../models/Attendance");
const Student = require("../models/Student");

// @route POST /api/attendance
// @desc  Mark attendance for a student on a given date
const markAttendance = async (req, res) => {
  try {
    const { studentId, date, status } = req.body;

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const record = await Attendance.create({
      studentId,
      date: date || Date.now(),
      status,
    });

    res.status(201).json(record);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @route GET /api/attendance/:studentId
// @desc  Full attendance history for one student
const getStudentAttendance = async (req, res) => {
  try {
    const records = await Attendance.find({ studentId: req.params.studentId }).sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/attendance/summary/all
// @desc  Attendance % per student — powers the dashboard chart
const getAttendanceSummary = async (req, res) => {
  try {
    const summary = await Attendance.aggregate([
      {
        $group: {
          _id: "$studentId",
          total: { $sum: 1 },
          present: {
            $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] },
          },
        },
      },
      {
        $lookup: {
          from: "students",
          localField: "_id",
          foreignField: "_id",
          as: "student",
        },
      },
      { $unwind: "$student" },
      {
        $project: {
          _id: 0,
          studentId: "$_id",
          name: "$student.name",
          rollNo: "$student.rollNo",
          total: 1,
          present: 1,
          attendancePercent: {
            $round: [{ $multiply: [{ $divide: ["$present", "$total"] }, 100] }, 1],
          },
        },
      },
    ]);

    res.json(summary);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { markAttendance, getStudentAttendance, getAttendanceSummary };
