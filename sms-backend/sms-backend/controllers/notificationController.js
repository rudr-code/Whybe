const dataStore = require("../dataStore");

// GET /api/notifications?recipientId=&recipientType=&unreadOnly=
const getNotifications = (req, res) => {
  const { recipientId, recipientType, unreadOnly } = req.query;
  let result = [...dataStore.notifications];

  // Filter: recipient-specific OR broadcast
  if (recipientId) {
    result = result.filter(n =>
      n.recipientId === recipientId || n.recipientType === "all" ||
      (recipientType && n.recipientType === recipientType)
    );
  }
  if (unreadOnly === "true") result = result.filter(n => !n.isRead);

  // Sort newest first
  result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(result);
};

// GET /api/notifications/unread-count?recipientId=&recipientType=
const getUnreadCount = (req, res) => {
  const { recipientId, recipientType } = req.query;
  let result = dataStore.notifications.filter(n => !n.isRead);
  if (recipientId) {
    result = result.filter(n =>
      n.recipientId === recipientId || n.recipientType === "all" ||
      (recipientType && n.recipientType === recipientType)
    );
  }
  res.json({ count: result.length });
};

// POST /api/notifications
const sendNotification = (req, res) => {
  const { senderId, senderRole, senderName, recipientType, recipientId, title, message } = req.body;
  if (!title || !message) return res.status(400).json({ message: "Title and message are required" });
  const notif = dataStore.insert("notifications", {
    senderId: senderId || "unknown", senderRole: senderRole || "admin",
    senderName: senderName || "System", recipientType: recipientType || "all",
    recipientId: recipientId || null, title, message, isRead: false,
    createdAt: new Date().toISOString(),
  });
  res.status(201).json(notif);
};

// PUT /api/notifications/:id/read
const markAsRead = (req, res) => {
  const updated = dataStore.update("notifications", req.params.id, { isRead: true });
  if (!updated) return res.status(404).json({ message: "Notification not found" });
  res.json(updated);
};

// PUT /api/notifications/read-all
const markAllAsRead = (req, res) => {
  const { recipientId, recipientType } = req.body;
  let count = 0;
  dataStore.notifications.forEach(n => {
    if (n.isRead) return;
    const matches = n.recipientId === recipientId || n.recipientType === "all" ||
      (recipientType && n.recipientType === recipientType);
    if (matches) { n.isRead = true; count++; }
  });
  res.json({ message: `Marked ${count} notifications as read` });
};

module.exports = { getNotifications, getUnreadCount, sendNotification, markAsRead, markAllAsRead };
