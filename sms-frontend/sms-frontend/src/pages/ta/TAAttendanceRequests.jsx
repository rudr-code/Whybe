import { useState, useEffect } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

export default function TAAttendanceRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("all"); // "all" | "pending_ta" | "pending_faculty" | "approved"
  const [loading, setLoading] = useState(true);
  const [actionFeedback, setActionFeedback] = useState("");

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

  const handleReview = async (id, action) => {
    try {
      await api.put(`/attendance-requests/${id}/ta-review`, {
        action,
        taId: user?._id || "user-ta-001",
      });
      setActionFeedback(
        action === "forward"
          ? "Request verified and successfully forwarded to Faculty for final attendance compensation approval!"
          : "Request rejected."
      );
      fetchRequests();
      setTimeout(() => setActionFeedback(""), 4000);
    } catch (err) {
      alert("Error reviewing request: " + (err.response?.data?.message || err.message));
    }
  };

  const filtered = requests.filter((r) => {
    if (filter === "all") return true;
    return r.status === filter;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald/15 text-emerald border border-emerald/30">Approved & Compensated</span>;
      case "pending_faculty":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 border border-amber-500/30">Forwarded to Faculty</span>;
      case "rejected":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-crimson/15 text-crimson border border-crimson/30">Rejected</span>;
      case "pending_ta":
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-platinum text-slate border border-platinum">Awaiting TA Verification</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-ink">Attendance Compensation Verification Desk</h1>
          <p className="text-xs text-slate mt-0.5">
            Validate student claims for official college functions, hackathons, and society events
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-paper border border-platinum rounded-xl self-start sm:self-auto">
          {[
            { id: "all", label: "All Claims" },
            { id: "pending_ta", label: "Pending TA Review" },
            { id: "pending_faculty", label: "With Faculty" },
            { id: "approved", label: "Approved" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === tab.id ? "bg-jet text-white shadow-sm" : "text-slate hover:text-ink"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {actionFeedback && (
        <div className="p-3.5 rounded-xl bg-emerald/10 border border-emerald/30 text-emerald text-xs font-semibold">
          {actionFeedback}
        </div>
      )}

      {/* Requests List */}
      <div className="bg-white border border-platinum rounded-2xl shadow-sm overflow-hidden">
        <div className="divide-y divide-platinum">
          {loading ? (
            <div className="p-10 text-center text-xs text-slate">Loading requests...</div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-xs text-slate">No requests found under this filter.</div>
          ) : (
            filtered.map((req) => {
              const isPendingMe = req.status === "pending_ta";
              return (
                <div
                  key={req._id}
                  className={`p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                    isPendingMe ? "bg-paper/40" : "hover:bg-paper/20"
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1.5">
                      <h3 className="font-heading text-sm font-bold text-ink">
                        {req.studentName || "Student"}
                      </h3>
                      <span className="font-mono text-xs text-slate font-bold">
                        ({req.rollNo || "ROLL"})
                      </span>
                      {getStatusBadge(req.status)}
                    </div>

                    <div className="text-xs text-slate space-y-0.5">
                      <p>
                        <span className="font-semibold text-ink">Event:</span> {req.eventName} &bull;{" "}
                        <span className="font-semibold text-ink">Category:</span>{" "}
                        <span className="capitalize">{req.reason?.replace("_", " ")}</span>
                      </p>
                      <p>
                        <span className="font-semibold text-ink">Event Date:</span> {req.eventDate} &bull; Filed on{" "}
                        {new Date(req.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Actions for TA */}
                  {isPendingMe ? (
                    <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                      <button
                        onClick={() => handleReview(req._id, "reject")}
                        className="px-3.5 py-1.5 rounded-xl border border-crimson/30 text-crimson hover:bg-crimson/10 text-xs font-semibold transition-colors"
                      >
                        Reject Claim
                      </button>
                      <button
                        onClick={() => handleReview(req._id, "forward")}
                        className="px-4 py-1.5 rounded-xl bg-emerald hover:bg-emerald-dark text-white text-xs font-bold shadow-sm shadow-emerald/20 transition-all flex items-center gap-1.5"
                      >
                        <span>Verify & Forward</span>
                        <span>&rarr;</span>
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-slate font-medium self-start md:self-auto">
                      {req.status === "pending_faculty" && "Forwarded to Faculty"}
                      {req.status === "approved" && "Final Approved by Faculty"}
                      {req.status === "rejected" && "Claim Closed"}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
