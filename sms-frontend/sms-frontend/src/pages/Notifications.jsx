import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import SendNotificationModal from "../components/SendNotificationModal";

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/notifications", {
        params: { recipientId: user?._id, recipientType: user?.role },
      });
      setNotifications(data);
    } catch (err) {
      console.error("Failed to load notifications", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const handleMarkRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    } catch {
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put("/notifications/read-all", {
        recipientId: user?._id,
        recipientType: user?.role,
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-ink">Campus Announcements & Circulars</h1>
          <p className="text-xs text-slate mt-0.5">
            Official communications, academic schedules, and institutional notices
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleMarkAllRead}
            className="px-3.5 py-2 rounded-xl border border-platinum bg-paper hover:bg-white text-xs font-semibold text-slate hover:text-ink transition-colors"
          >
            Mark All as Read
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald hover:bg-emerald-dark text-white text-xs font-bold shadow-md shadow-emerald/20 transition-all flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Broadcast Notice</span>
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate bg-white border border-platinum rounded-2xl">
            Loading announcements...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate bg-white border border-platinum rounded-2xl">
            No announcements available.
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => !n.isRead && handleMarkRead(n._id)}
              className={`bg-white border border-platinum rounded-2xl p-5 shadow-sm transition-all hover:shadow-md cursor-pointer ${
                !n.isRead ? "border-l-4 border-l-emerald bg-emerald/5" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-paper border border-platinum text-slate">
                      Sender: {n.senderName} ({n.senderRole?.toUpperCase()})
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-paper border border-platinum text-slate">
                      Audience: {n.recipientType?.toUpperCase()}
                    </span>
                    {!n.isRead && (
                      <span className="text-[10px] font-bold text-emerald bg-emerald/10 px-2 py-0.5 rounded-full">
                        Unread
                      </span>
                    )}
                  </div>
                  <h3 className="font-heading text-sm font-bold text-ink">{n.title}</h3>
                  <p className="text-xs text-slate mt-1 leading-relaxed">{n.message}</p>
                </div>
                <span className="text-[10px] text-slate/70 whitespace-nowrap font-mono shrink-0">
                  {new Date(n.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Broadcast Modal */}
      <SendNotificationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSent={fetchNotifications}
      />
    </div>
  );
}
