const AttendanceRequest = require("../models/AttendanceRequest");
const Student = require("../models/Student");
const Attendance = require("../models/Attendance");

// GET /api/attendance-requests?status=&studentId=
const getAttendanceRequests = async (req, res) => {
  try {
    const { status, studentId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (studentId) filter.studentId = studentId;

    const result = await AttendanceRequest.find(filter).sort({ createdAt: -1 }).lean();
    return res.json(result);
  } catch (err) {
    console.error("Error in getAttendanceRequests:", err);
    return res.status(500).json({ message: err.message });
  }
};

// POST /api/attendance-requests — Student creates a request
const createRequest = async (req, res) => {
  try {
    const { studentId, eventName, eventDate, reason } = req.body;
    if (!studentId || !eventName || !eventDate) {
      return res.status(400).json({ message: "studentId, eventName, and eventDate are required" });
    }

    const student = await Student.findById(studentId).lean();
    const request = await AttendanceRequest.create({
      studentId,
      studentName: student?.name || "Unknown",
      rollNo: student?.rollNo || "",
      eventName,
      eventDate,
      reason: reason || "college_function",
      status: "pending_ta",
      taReviewedBy: null,
      facultyApprovedBy: null,
    });

    return res.status(201).json(request);
  } catch (err) {
    console.error("Error in createRequest:", err);
    return res.status(500).json({ message: err.message });
  }
};

// PUT /api/attendance-requests/:id/ta-review — TA reviews and forwards to faculty
const taReview = async (req, res) => {
  try {
    const { action, taId } = req.body; // action: "forward" or "reject"
    const request = await AttendanceRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });
    if (request.status !== "pending_ta") {
      return res.status(400).json({ message: "Request is not pending TA review" });
    }

    request.status = action === "forward" ? "pending_faculty" : "rejected";
    request.taReviewedBy = taId || "user-ta-001";
    await request.save();

    return res.json(request);
  } catch (err) {
    console.error("Error in taReview:", err);
    return res.status(500).json({ message: err.message });
  }
};

// PUT /api/attendance-requests/:id/faculty-approve — Faculty final approval
const facultyApprove = async (req, res) => {
  try {
    const { action, facultyId } = req.body; // action: "approve" or "reject"
    const request = await AttendanceRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });
    if (request.status !== "pending_faculty") {
      return res.status(400).json({ message: "Request is not pending faculty approval" });
    }

    const effectiveFacultyId = facultyId || "user-faculty-001";

    if (action === "approve") {
      request.status = "approved";
      request.facultyApprovedBy = effectiveFacultyId;
      await request.save();

      // Mark attendance as compensated for that date in MongoDB
      const existingAtt = await Attendance.findOne({
        studentId: request.studentId,
        date: request.eventDate,
        status: "absent",
      });

      if (existingAtt) {
        existingAtt.status = "compensated";
        existingAtt.compensationReason = request.eventName;
        existingAtt.approvedBy = effectiveFacultyId;
        await existingAtt.save();
      } else {
        await Attendance.create({
          studentId: request.studentId,
          subjectId: null,
          date: request.eventDate,
          status: "compensated",
          compensationReason: request.eventName,
          approvedBy: effectiveFacultyId,
        });
      }
    } else {
      request.status = "rejected";
      request.facultyApprovedBy = effectiveFacultyId;
      await request.save();
    }

    return res.json(request);
  } catch (err) {
    console.error("Error in facultyApprove:", err);
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { getAttendanceRequests, createRequest, taReview, facultyApprove };

