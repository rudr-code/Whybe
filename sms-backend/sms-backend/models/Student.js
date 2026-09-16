const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    userId: { type: String, default: null },
    name: { type: String, required: true, trim: true },
    rollNo: { type: String, required: true, unique: true, trim: true },
    branch: { type: String, default: "CSE", trim: true },
    section: { type: String, default: "A", trim: true },
    semester: { type: String, default: "3", trim: true },
    gender: { type: String, default: "male" },
    email: { type: String, trim: true, lowercase: true },
    contact: { type: String, trim: true, default: "" },
    dob: { type: String, default: "" },
    parentalEducation: { type: String, default: "" },
    lunchType: { type: String, default: "standard" },
    testPrepStatus: { type: String, default: "none" },
    feeStatus: {
      type: String,
      enum: ["paid", "pending", "overdue"],
      default: "pending",
    },
    feeAmount: { type: Number, default: 75000 },
    grade: { type: String, default: "" },
  },
  { timestamps: true }
);

studentSchema.index({ branch: 1, section: 1 });
studentSchema.index({ name: "text", rollNo: "text", email: "text" });

module.exports = mongoose.model("Student", studentSchema);

