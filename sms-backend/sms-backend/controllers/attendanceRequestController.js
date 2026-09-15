const dataStore = require("../dataStore");

// GET /api/attendance-requests?status=&studentId=
const getAttendanceRequests = (req, res) => {
  const { status, studentId } = req.query;
  let result = [...dataStore.attendanceRequests];
  if (status) result = result.filter(r => r.status === status);
  if (studentId) result = result.filter(r => r.studentId === studentId);
  result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(result);
};

// POST /api/attendance-requests — Student creates a request
const createRequest = (req, res) => {
  const { studentId, eventName, eventDate, reason } = req.body;
  if (!studentId || !eventName || !eventDate) {
    return res.status(400).json({ message: "studentId, eventName, and eventDate are required" });
  }
  const student = dataStore.findById("students", studentId);
  const request = dataStore.insert("attendanceRequests", {
    studentId, studentName: student?.name || "Unknown", rollNo: student?.rollNo || "",
    eventName, eventDate, reason: reason || "college_function",
    status: "pending_ta", taReviewedBy: null, facultyApprovedBy: null,
    createdAt: new Date().toISOString(),
  });
  res.status(201).json(request);
};

// PUT /api/attendance-requests/:id/ta-review — TA reviews and forwards to faculty
const taReview = (req, res) => {
  const { action, taId } = req.body; // action: "forward" or "reject"
  const request = dataStore.findById("attendanceRequests", req.params.id);
  if (!request) return res.status(404).json({ message: "Request not found" });
  if (request.status !== "pending_ta") return res.status(400).json({ message: "Request is not pending TA review" });

  if (action === "forward") {
    dataStore.update("attendanceRequests", req.params.id, {
      status: "pending_faculty", taReviewedBy: taId || "user-ta-001",
    });
  } else {
    dataStore.update("attendanceRequests", req.params.id, {
      status: "rejected", taReviewedBy: taId || "user-ta-001",
    });
  }
  res.json(dataStore.findById("attendanceRequests", req.params.id));
};

// PUT /api/attendance-requests/:id/faculty-approve — Faculty final approval
const facultyApprove = (req, res) => {
  const { action, facultyId } = req.body; // action: "approve" or "reject"
  const request = dataStore.findById("attendanceRequests", req.params.id);
  if (!request) return res.status(404).json({ message: "Request not found" });
  if (request.status !== "pending_faculty") return res.status(400).json({ message: "Request is not pending faculty approval" });

  if (action === "approve") {
    dataStore.update("attendanceRequests", req.params.id, {
      status: "approved", facultyApprovedBy: facultyId || "user-faculty-001",
    });
    // Mark attendance as compensated for that date
    const existingAtt = dataStore.attendance.find(a =>
      a.studentId === request.studentId && a.date === request.eventDate && a.status === "absent"
    );
    if (existingAtt) {
      dataStore.update("attendance", existingAtt._id, {
        status: "compensated", compensationReason: request.eventName, approvedBy: facultyId,
      });
    } else {
      dataStore.insert("attendance", {
        studentId: request.studentId, subjectId: null, date: request.eventDate,
        status: "compensated", compensationReason: request.eventName, approvedBy: facultyId,
      });
    }
  } else {
    dataStore.update("attendanceRequests", req.params.id, {
      status: "rejected", facultyApprovedBy: facultyId || "user-faculty-001",
    });
  }
  res.json(dataStore.findById("attendanceRequests", req.params.id));
};

module.exports = { getAttendanceRequests, createRequest, taReview, facultyApprove };
