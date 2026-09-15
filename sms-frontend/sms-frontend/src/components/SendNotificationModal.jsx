import { useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function SendNotificationModal({ isOpen, onClose, onSent }) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [recipientType, setRecipientType] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/notifications", {
        senderId: user?._id || "sender",
        senderRole: user?.role || "admin",
        senderName: user?.name || "Campus Admin",
        recipientType,
        recipientId: null,
        title,
        message,
      });
      setTitle("");
      setMessage("");
      if (onSent) onSent();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to dispatch notification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white border border-platinum rounded-2xl p-6 w-full max-w-lg shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-platinum">
          <div>
            <h3 className="font-heading text-lg font-bold text-ink">Send Announcement / Notification</h3>
            <p className="text-xs text-slate mt-0.5">Broadcast an alert to students, faculty, or all campus</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-platinum flex items-center justify-center text-slate hover:text-ink hover:bg-paper"
          >
            &times;
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-crimson/10 border border-crimson/30 rounded-xl text-xs text-crimson font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ink mb-1">Target Audience</label>
            <select
              value={recipientType}
              onChange={(e) => setRecipientType(e.target.value)}
              className="w-full bg-paper border border-platinum rounded-xl px-3 py-2 text-xs text-ink outline-none focus:border-emerald"
            >
              <option value="all">Everyone (Broadcast to All)</option>
              <option value="student">All Students Only</option>
              <option value="faculty">Faculty Members Only</option>
              <option value="ta">Teaching Assistants (TAs)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">Notification Title</label>
            <input
              type="text"
              required
              placeholder="e.g., End-Term Exam Schedule Published"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-paper border border-platinum rounded-xl px-3.5 py-2.5 text-xs text-ink outline-none focus:border-emerald focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">Message Content</label>
            <textarea
              required
              rows={4}
              placeholder="Write the detailed message, instructions, or event guidelines..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-paper border border-platinum rounded-xl px-3.5 py-2.5 text-xs text-ink outline-none focus:border-emerald focus:bg-white resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-platinum">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate hover:text-ink hover:bg-paper"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald hover:bg-emerald-dark shadow-md shadow-emerald/20 transition-all disabled:opacity-50"
            >
              {loading ? "Sending..." : "Dispatch Notification"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
