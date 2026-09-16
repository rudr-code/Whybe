const Notification = require("../models/Notification");

// GET /api/notifications?recipientId=&recipientType=&unreadOnly=
const getNotifications = async (req, res) => {
  try {
    const { recipientId, recipientType, unreadOnly } = req.query;
    const filter = {};

    if (recipientId) {
      const orList = [
        { recipientId },
        { recipientType: "all" },
      ];
      if (recipientType) {
        orList.push({ recipientType });
      }
      filter.$or = orList;
    }

    if (unreadOnly === "true") {
      filter.isRead = false;
    }

    const result = await Notification.find(filter).sort({ createdAt: -1 }).lean();
    return res.json(result);
  } catch (err) {
    console.error("Error in getNotifications:", err);
    return res.status(500).json({ message: err.message });
  }
};

// GET /api/notifications/unread-count?recipientId=&recipientType=
const getUnreadCount = async (req, res) => {
  try {
    const { recipientId, recipientType } = req.query;
    const filter = { isRead: false };

    if (recipientId) {
      const orList = [
        { recipientId },
        { recipientType: "all" },
      ];
      if (recipientType) {
        orList.push({ recipientType });
      }
      filter.$or = orList;
    }

    const count = await Notification.countDocuments(filter);
    return res.json({ count });
  } catch (err) {
    console.error("Error in getUnreadCount:", err);
    return res.status(500).json({ message: err.message });
  }
};

// POST /api/notifications
const sendNotification = async (req, res) => {
  try {
    const { senderId, senderRole, senderName, recipientType, recipientId, title, message } = req.body;
    if (!title || !message) {
      return res.status(400).json({ message: "Title and message are required" });
    }

    const notif = await Notification.create({
      senderId: senderId || "unknown",
      senderRole: senderRole || "admin",
      senderName: senderName || "System",
      recipientType: recipientType || "all",
      recipientId: recipientId || null,
      title,
      message,
      isRead: false,
    });

    return res.status(201).json(notif);
  } catch (err) {
    console.error("Error in sendNotification:", err);
    return res.status(500).json({ message: err.message });
  }
};

// PUT /api/notifications/:id/read
const markAsRead = async (req, res) => {
  try {
    const updated = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    ).lean();
    if (!updated) return res.status(404).json({ message: "Notification not found" });
    return res.json(updated);
  } catch (err) {
    console.error("Error in markAsRead:", err);
    return res.status(500).json({ message: err.message });
  }
};

// PUT /api/notifications/read-all
const markAllAsRead = async (req, res) => {
  try {
    const { recipientId, recipientType } = req.body;
    const filter = { isRead: false };

    if (recipientId) {
      const orList = [
        { recipientId },
        { recipientType: "all" },
      ];
      if (recipientType) {
        orList.push({ recipientType });
      }
      filter.$or = orList;
    }

    const updateRes = await Notification.updateMany(filter, { isRead: true });
    return res.json({ message: `Marked ${updateRes.modifiedCount} notifications as read` });
  } catch (err) {
    console.error("Error in markAllAsRead:", err);
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { getNotifications, getUnreadCount, sendNotification, markAsRead, markAllAsRead };

