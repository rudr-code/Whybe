const mongoose = require("mongoose");

const marksSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    studentId: { type: String, required: true, index: true },
    subjectId: { type: String, required: true, index: true },
    subjectCode: { type: String, default: "" },
    subjectName: { type: String, default: "" },
    midSem1: { type: Number, default: 0 },
    midSem2: { type: Number, default: 0 },
    endSem: { type: Number, default: 0 },
    internal: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    grade: { type: String, default: "F" },
    semester: { type: String, default: "3" },
  },
  { timestamps: true }
);

marksSchema.index({ studentId: 1, subjectId: 1 }, { unique: true });
marksSchema.index({ studentId: 1, semester: 1 });

module.exports = mongoose.model("Marks", marksSchema);
