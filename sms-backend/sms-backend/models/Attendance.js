const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    date: { type: Date, required: true, default: Date.now },
    status: {
      type: String,
      enum: ["present", "absent"],
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent marking attendance twice for the same student on the same day
attendanceSchema.index({ studentId: 1, date: 1 }, { unique: false });

module.exports = mongoose.model("Attendance", attendanceSchema);
