const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    credits: { type: Number, default: 3 },
    branch: { type: String, default: "ALL", trim: true },
    semester: { type: String, default: "3", trim: true },
    facultyId: { type: String, default: null },
  },
  { timestamps: true }
);

subjectSchema.index({ branch: 1, semester: 1 });

module.exports = mongoose.model("Subject", subjectSchema);
