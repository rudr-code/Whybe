const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    // Optional link back to a User account (if the student also logs in)
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    name: { type: String, required: true, trim: true },
    rollNo: { type: String, required: true, unique: true, trim: true },
    class: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    contact: { type: String, trim: true },

    feeStatus: {
      type: String,
      enum: ["paid", "pending", "overdue"],
      default: "pending",
    },
    feeAmount: { type: Number, default: 0 },

    grade: { type: String, default: "" }, // e.g. "A", "B+", or numeric %
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);
