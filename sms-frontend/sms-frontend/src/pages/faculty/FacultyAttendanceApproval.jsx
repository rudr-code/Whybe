import { useState, useEffect } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

export default function FacultyAttendanceApproval() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/attendance-requests");
      setRequests(data);
    } catch (err) {
      console.error("Failed to load requests", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleDecision = async (id, action) => {
    try {
      await api.put(`/attendance-requests/${id}/faculty-approve`, {
        action,
        facultyId: user?._id || "user-faculty-001",
      });
      setFeedback(
        action === "approve"
          ? "Claim approved! The student's missed lecture has been officially recorded as Compensated."
          : "Claim rejected."
      );
      fetchRequests();
      setTimeout(() => setFeedback(""), 4000);
    } catch (err) {
      alert("Error processing approval: " + (err.response?.data?.message || err.message));
    }
  };

  const pendingList = requests.filter((r) => r.status === "pending_faculty");
  const processedList = requests.filter((r) => r.status === "approved" || r.status === "rejected");

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-ink">
          Attendance Compensation Final Approval Desk
        </h1>
        <p className="text-xs text-slate mt-0.5">
          Authorize attendance duty compensation for students validated by Teaching Assistants
        </p>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald/10 border border-emerald/30 text-emerald text-xs font-semibold">
          {feedback}
        </div>
      )}

      {/* Pending Queue */}
      <div className="bg-white border border-platinum rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-heading text-base font-bold text-ink">
              Action Required &bull; TA-Forwarded Queue
            </h2>
            <p className="text-xs text-slate">These claims have been verified by TA Priya Desai</p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/15 text-amber-700">
            {pendingList.length} Pending
          </span>
        </div>

        <div className="divide-y divide-platinum">
          {loading ? (
            <div className="py-8 text-center text-xs text-slate">Loading approval requests...</div>
          ) : pendingList.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate">
              No claims waiting for faculty approval right now.
            </div>
          ) : (
            pendingList.map((req) => (
              <div
                key={req._id}
                className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading text-sm font-bold text-ink">{req.studentName}</h3>
                    <span className="text-xs font-mono font-bold text-slate">({req.rollNo})</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700">
                      TA Verified
                    </span>
                  </div>
                  <p className="text-xs text-slate mt-1">
                    <span className="font-semibold text-ink">Event:</span> {req.eventName} &bull;{" "}
                    <span className="font-semibold text-ink">Date:</span> {req.eventDate} &bull;{" "}
                    <span className="capitalize">{req.reason?.replace("_", " ")}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleDecision(req._id, "reject")}
                    className="px-4 py-1.5 rounded-xl border border-crimson/30 text-crimson hover:bg-crimson/10 text-xs font-semibold transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleDecision(req._id, "approve")}
                    className="px-4 py-1.5 rounded-xl bg-emerald hover:bg-emerald-dark text-white text-xs font-bold shadow-md shadow-emerald/20 transition-all flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Approve & Compensate</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Historical Approvals */}
      <div className="bg-white border border-platinum rounded-2xl p-6 shadow-sm">
        <h3 className="font-heading text-base font-bold text-ink mb-3">Recently Processed Approvals</h3>
        <div className="divide-y divide-platinum">
          {processedList.length === 0 ? (
            <p className="py-4 text-center text-xs text-slate">No previous records.</p>
          ) : (
            processedList.map((req) => (
              <div key={req._id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-ink">{req.studentName}</span>
                  <span className="text-slate font-mono ml-1.5">({req.rollNo})</span>
                  <span className="text-slate ml-2">&bull; {req.eventName} ({req.eventDate})</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    req.status === "approved"
                      ? "bg-emerald/15 text-emerald"
                      : "bg-crimson/15 text-crimson"
                  }`}
                >
                  {req.status?.toUpperCase()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
