const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    senderId: { type: String, default: "unknown" },
    senderRole: { type: String, default: "admin" },
    senderName: { type: String, default: "System" },
    recipientType: {
      type: String,
      enum: ["all", "student", "faculty", "ta", "exam_cell", "admin"],
      default: "all",
    },
    recipientId: { type: String, default: null, index: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

notificationSchema.index({ recipientType: 1, recipientId: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
