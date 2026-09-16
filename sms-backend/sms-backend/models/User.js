const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "faculty", "ta", "student", "exam_cell"],
      default: "student",
    },
    dob: { type: String, default: "" },
    studentRef: { type: String, default: null },
  },
  { timestamps: true }
);

// Hash password before saving if not already hashed
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  if (this.password && (this.password.startsWith("$2a$") || this.password.startsWith("$2b$"))) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method to compare passwords on login
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (this.password === enteredPassword) return true;
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (e) {
    return false;
  }
};

module.exports = mongoose.model("User", userSchema);

