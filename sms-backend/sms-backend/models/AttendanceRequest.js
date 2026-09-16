const mongoose = require("mongoose");

const attendanceRequestSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    studentId: { type: String, required: true, index: true },
    studentName: { type: String, default: "" },
    rollNo: { type: String, default: "" },
    eventName: { type: String, required: true, trim: true },
    eventDate: { type: String, required: true },
    reason: { type: String, default: "college_function" },
    status: {
      type: String,
      enum: ["pending_ta", "pending_faculty", "approved", "rejected"],
      default: "pending_ta",
      index: true,
    },
    taReviewedBy: { type: String, default: null },
    facultyApprovedBy: { type: String, default: null },
  },
  { timestamps: true }
);

attendanceRequestSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("AttendanceRequest", attendanceRequestSchema);
