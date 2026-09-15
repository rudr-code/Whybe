const express = require("express");
const router = express.Router();
const {
  getNotifications,
  getUnreadCount,
  sendNotification,
  markAsRead,
  markAllAsRead,
} = require("../controllers/notificationController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.get("/", getNotifications);
router.get("/unread-count", getUnreadCount);
router.post("/", sendNotification);
router.put("/:id/read", markAsRead);
router.put("/read-all", markAllAsRead);

module.exports = router;
