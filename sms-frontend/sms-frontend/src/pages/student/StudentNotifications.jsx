import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";

export default function StudentNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState("notifications"); // "notifications" | "requests" | "message"
  const [loading, setLoading] = useState(true);

  // Compensation Form
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState(new Date().toISOString().slice(0, 10));
  const [reason, setReason] = useState("college_function");
  const [submittingReq, setSubmittingReq] = useState(false);
  const [reqMessage, setReqMessage] = useState("");

  // Direct Message Form
  const [msgRecipient, setMsgRecipient] = useState("ta"); // "ta" | "faculty"
  const [msgTitle, setMsgTitle] = useState("");
  const [msgContent, setMsgContent] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);
  const [msgFeedback, setMsgFeedback] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const sId = user?.studentRef || "student-0001";

      const [notifRes, reqRes] = await Promise.allSettled([
        api.get("/notifications", { params: { recipientId: sId, recipientType: "student" } }),
        api.get("/attendance-requests", { params: { studentId: sId } }),
      ]);

      if (notifRes.status === "fulfilled") setNotifications(notifRes.value.data);
      if (reqRes.status === "fulfilled") setRequests(reqRes.value.data);
    } catch (err) {
      console.error("Failed to load student notifications", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleMarkRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    } catch {
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    setSubmittingReq(true);
    setReqMessage("");
    try {
      const sId = user?.studentRef || "student-0001";
      const { data } = await api.post("/attendance-requests", {
        studentId: sId,
        eventName,
        eventDate,
        reason,
      });
      setRequests([data, ...requests]);
      setReqMessage("Attendance compensation request successfully forwarded to TA!");
      setEventName("");
    } catch (err) {
      setReqMessage("Failed to submit: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmittingReq(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    setSendingMsg(true);
    setMsgFeedback("");
    try {
      await api.post("/notifications", {
        senderId: user?._id || "student-id",
        senderRole: "student",
        senderName: user?.name || "Aarav Sharma",
        recipientType: msgRecipient,
        recipientId: msgRecipient === "ta" ? "user-ta-001" : "user-faculty-001",
        title: msgTitle,
        message: msgContent,
      });
      setMsgFeedback("Message successfully delivered to your " + msgRecipient.toUpperCase() + "!");
      setMsgTitle("");
      setMsgContent("");
    } catch (err) {
      setMsgFeedback("Failed to send message: " + (err.response?.data?.message || err.message));
    } finally {
      setSendingMsg(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald/15 text-emerald border border-emerald/30">Approved & Compensated</span>;
      case "pending_faculty":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 border border-amber-500/30">TA Reviewed &rarr; Awaiting Faculty Approval</span>;
      case "rejected":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-crimson/15 text-crimson border border-crimson/30">Rejected</span>;
      case "pending_ta":
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-platinum text-slate border border-platinum">Submitted to TA</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-ink">Communications & Compensation Desk</h1>
          <p className="text-xs text-slate mt-0.5">
            Campus announcements, event attendance compensation, and faculty messaging
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 p-1 bg-paper border border-platinum rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("notifications")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "notifications" ? "bg-jet text-white shadow-sm" : "text-slate hover:text-ink"
            }`}
          >
            Announcements ({notifications.filter((n) => !n.isRead).length})
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "requests" ? "bg-jet text-white shadow-sm" : "text-slate hover:text-ink"
            }`}
          >
            Compensation Requests ({requests.length})
          </button>
          <button
            onClick={() => setActiveTab("message")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "message" ? "bg-jet text-white shadow-sm" : "text-slate hover:text-ink"
            }`}
          >
            Message Faculty / TA
          </button>
        </div>
      </div>

      {/* Tab 1: Campus Announcements */}
      {activeTab === "notifications" && (
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="bg-white border border-platinum rounded-2xl p-10 text-center text-xs text-slate">
              No new circulars or announcements at this time.
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
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-paper border border-platinum text-slate">
                        From: {n.senderName} ({n.senderRole?.toUpperCase()})
                      </span>
                      {!n.isRead && (
                        <span className="text-[10px] font-bold text-emerald bg-emerald/10 px-2 py-0.5 rounded-full">
                          New Unread
                        </span>
                      )}
                    </div>
                    <h3 className="font-heading text-sm font-bold text-ink">{n.title}</h3>
                    <p className="text-xs text-slate mt-1.5 leading-relaxed">{n.message}</p>
                  </div>
                  <span className="text-[10px] text-slate/70 whitespace-nowrap font-mono">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Attendance Compensation Requests */}
      {activeTab === "requests" && (
        <div className="space-y-6">
          {/* New Request Card */}
          <div className="bg-white border border-platinum rounded-2xl p-6 shadow-sm">
            <h3 className="font-heading text-base font-bold text-ink mb-1">
              Submit New Attendance Compensation Claim
            </h3>
            <p className="text-xs text-slate mb-4">
              Missed lectures due to official events, hackathons, or club activities? Fill this form to request attendance compensation.
            </p>

            {reqMessage && (
              <div className="mb-4 p-3 rounded-xl bg-emerald/10 border border-emerald/30 text-emerald text-xs font-semibold">
                {reqMessage}
              </div>
            )}

            <form onSubmit={handleCreateRequest} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate mb-1">Event / Club Activity</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Smart India Hackathon"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  className="w-full bg-paper border border-platinum rounded-xl px-3 py-2 text-xs text-ink outline-none focus:border-emerald"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate mb-1">Date of Event</label>
                <input
                  type="date"
                  required
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full bg-paper border border-platinum rounded-xl px-3 py-2 text-xs text-ink outline-none focus:border-emerald"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate mb-1">Activity Category</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-paper border border-platinum rounded-xl px-3 py-2 text-xs text-ink outline-none focus:border-emerald"
                >
                  <option value="college_function">College Technical Function</option>
                  <option value="club_meeting">Student Club Activity</option>
                  <option value="sports">Inter-College Sports</option>
                  <option value="cultural">Cultural Festival</option>
                </select>
              </div>

              <div className="sm:col-span-3 flex justify-end">
                <button
                  type="submit"
                  disabled={submittingReq}
                  className="px-5 py-2.5 rounded-xl bg-emerald hover:bg-emerald-dark text-white text-xs font-bold shadow-md shadow-emerald/20 transition-all disabled:opacity-50"
                >
                  {submittingReq ? "Submitting..." : "Submit Claim for Verification"}
                </button>
              </div>
            </form>
          </div>

          {/* Existing Claims List */}
          <div className="bg-white border border-platinum rounded-2xl p-6 shadow-sm">
            <h3 className="font-heading text-base font-bold text-ink mb-3">Submitted Claims Status Tracker</h3>
            <div className="divide-y divide-platinum">
              {requests.length === 0 ? (
                <p className="py-6 text-center text-xs text-slate">No compensation claims submitted yet.</p>
              ) : (
                requests.map((r) => (
                  <div key={r._id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-xs text-ink">{r.eventName}</h4>
                        <span className="text-[10px] text-slate font-mono capitalize">
                          &bull; {r.reason?.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-xs text-slate">
                        Event Date: <span className="font-semibold text-ink">{r.eventDate}</span> &middot; Filed on {new Date(r.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>{getStatusBadge(r.status)}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Direct Message to Faculty / TA */}
      {activeTab === "message" && (
        <div className="bg-white border border-platinum rounded-2xl p-6 shadow-sm">
          <h3 className="font-heading text-base font-bold text-ink mb-1">Direct Help Desk Query</h3>
          <p className="text-xs text-slate mb-4">
            Send an inquiry regarding subject doubts, assignment submissions, or re-evaluation
          </p>

          {msgFeedback && (
            <div className="mb-4 p-3 rounded-xl bg-emerald/10 border border-emerald/30 text-emerald text-xs font-semibold">
              {msgFeedback}
            </div>
          )}

          <form onSubmit={handleSendMessage} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate mb-1">Send Message To</label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-xs text-ink font-medium cursor-pointer">
                  <input
                    type="radio"
                    name="recipient"
                    value="ta"
                    checked={msgRecipient === "ta"}
                    onChange={(e) => setMsgRecipient(e.target.value)}
                    className="accent-emerald"
                  />
                  <span>Teaching Assistant (Priya Desai)</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs text-ink font-medium cursor-pointer">
                  <input
                    type="radio"
                    name="recipient"
                    value="faculty"
                    checked={msgRecipient === "faculty"}
                    onChange={(e) => setMsgRecipient(e.target.value)}
                    className="accent-emerald"
                  />
                  <span>Course Faculty (Prof. Sunita Sharma)</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate mb-1">Query Subject / Topic</label>
              <input
                type="text"
                required
                placeholder="e.g. Query regarding Lab 3 C Program"
                value={msgTitle}
                onChange={(e) => setMsgTitle(e.target.value)}
                className="w-full bg-paper border border-platinum rounded-xl px-3 py-2 text-xs text-ink outline-none focus:border-emerald focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate mb-1">Detailed Inquiry</label>
              <textarea
                required
                rows={4}
                placeholder="Describe your question or difficulty clearly..."
                value={msgContent}
                onChange={(e) => setMsgContent(e.target.value)}
                className="w-full bg-paper border border-platinum rounded-xl px-3.5 py-2.5 text-xs text-ink outline-none focus:border-emerald focus:bg-white resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={sendingMsg}
              className="px-5 py-2.5 rounded-xl bg-emerald hover:bg-emerald-dark text-white text-xs font-bold shadow-md shadow-emerald/20 transition-all disabled:opacity-50"
            >
              {sendingMsg ? "Sending Message..." : "Dispatch Message to Staff"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
