const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    studentId: { type: String, required: true, index: true },
    subjectId: { type: String, default: null, index: true },
    date: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ["present", "absent", "compensated"],
      required: true,
    },
    compensationReason: { type: String, default: null },
    approvedBy: { type: String, default: null },
  },
  { timestamps: true }
);

attendanceSchema.index({ studentId: 1, date: 1, subjectId: 1 });

module.exports = mongoose.model("Attendance", attendanceSchema);

