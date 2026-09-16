const mongoose = require("mongoose");

const messMenuSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    day: {
      type: String,
      required: true,
      unique: true,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    },
    breakfast: { type: String, default: "" },
    lunch: { type: String, default: "" },
    snacks: { type: String, default: "" },
    dinner: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MessMenu", messMenuSchema);
