const mongoose = require("mongoose");

const timetableSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    branch: { type: String, required: true, trim: true },
    section: { type: String, required: true, trim: true },
    semester: { type: String, default: "3", trim: true },
    day: {
      type: String,
      required: true,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    },
    period: { type: Number, required: true },
    subjectId: { type: String, default: null },
    subjectCode: { type: String, default: "" },
    subjectName: { type: String, default: "" },
    room: { type: String, default: "" },
    facultyId: { type: String, default: null },
  },
  { timestamps: true }
);

timetableSchema.index({ branch: 1, section: 1, semester: 1, day: 1, period: 1 });

module.exports = mongoose.model("Timetable", timetableSchema);
