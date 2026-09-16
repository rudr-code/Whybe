import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";

export default function StudentAttendance() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);

  // Compensation request state
  const [showModal, setShowModal] = useState(false);
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState(new Date().toISOString().slice(0, 10));
  const [reason, setReason] = useState("college_function");
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState("");

  const fetchAttendance = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      const sId = user?.studentRef || "student-0001";
      const { data } = await api.get(`/attendance/${sId}`);
      setAttendance(data);
    } catch (err) {
      console.error("Failed to load attendance", err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance(false);

    // Dynamic short-interval polling (every 8 seconds)
    const interval = setInterval(() => {
      fetchAttendance(true);
    }, 8000);

    const onFocus = () => {
      if (document.visibilityState === "visible") {
        fetchAttendance(true);
      }
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [user]);

  const handleCompensationSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitSuccess("");
    try {
      const sId = user?.studentRef || "student-0001";
      await api.post("/attendance-requests", {
        studentId: sId,
        eventName,
        eventDate,
        reason,
      });
      setSubmitSuccess("Your attendance compensation request has been sent to your Teaching Assistant for review!");
      setEventName("");
      setTimeout(() => {
        setShowModal(false);
        setSubmitSuccess("");
      }, 2500);
    } catch (err) {
      alert("Failed to submit request: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const overallPercent = attendance?.overall?.percent ?? 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-ink">My Course Attendance</h1>
          <p className="text-xs text-slate mt-0.5">
            Real-time biometric & classroom roll records for Semester 3
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald hover:bg-emerald-dark shadow-md shadow-emerald/20 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Request Attendance Compensation
        </button>
      </div>

      {/* Overview Stat Banner */}
      <div className="bg-white border border-platinum rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center font-bold text-2xl font-heading shadow-inner ${
            overallPercent >= 75 ? "bg-emerald/10 text-emerald border border-emerald/20" : "bg-crimson/10 text-crimson border border-crimson/20"
          }`}>
            <span>{overallPercent}%</span>
            <span className="text-[10px] uppercase font-semibold text-slate">Overall</span>
          </div>

          <div>
            <h3 className="font-heading text-lg font-bold text-ink">
              {overallPercent >= 75 ? "Status: Eligible for Examinations" : "Status: Low Attendance Warning"}
            </h3>
            <p className="text-xs text-slate mt-1">
              Total Classes Held: <span className="font-bold text-ink">{attendance?.overall?.total || 0}</span> &middot; Attended: <span className="font-bold text-emerald">{attendance?.overall?.present || 0}</span>
            </p>
          </div>
        </div>

        <div className="bg-paper border border-platinum rounded-xl p-4 text-xs text-slate max-w-sm">
          <span className="font-bold text-ink block mb-1">Attendance Compensation Rules:</span>
          Participated in Hackathons, Sports, or Cultural events? Submit a proof request to your TA to have missed classes marked as <span className="font-semibold text-emerald">Compensated</span>.
        </div>
      </div>

      {/* Subject-Wise Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {attendance?.bySubject?.map((s) => {
          const isSafe = s.percent >= 75;
          return (
            <div key={s.subjectId} className="bg-white border border-platinum rounded-2xl p-5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-heading text-sm font-bold text-ink">{s.subjectName}</h4>
                  <span className={`px-2 py-0.5 rounded-md text-xs font-bold font-mono ${
                    isSafe ? "bg-emerald/10 text-emerald" : "bg-crimson/10 text-crimson"
                  }`}>
                    {s.percent}%
                  </span>
                </div>
                <p className="text-xs text-slate mb-4">
                  {s.present} of {s.total} sessions attended
                </p>

                {/* Progress Bar */}
                <div className="w-full bg-paper rounded-full h-2.5 border border-platinum overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${isSafe ? "bg-emerald" : "bg-crimson"}`}
                    style={{ width: `${Math.min(100, s.percent)}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-platinum/60 flex items-center justify-between text-[11px]">
                <span className="text-slate">Req: 75%</span>
                <span className={`font-semibold ${isSafe ? "text-emerald" : "text-crimson"}`}>
                  {isSafe ? "On Track" : `${Math.ceil((0.75 * s.total - s.present) / 0.25)} more needed`}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for Attendance Compensation Request */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-platinum rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-platinum mb-4">
              <h3 className="font-heading text-base font-bold text-ink">Request Attendance Compensation</h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-7 h-7 rounded-full border border-platinum flex items-center justify-center text-slate hover:text-ink hover:bg-paper"
              >
                &times;
              </button>
            </div>

            {submitSuccess ? (
              <div className="p-4 bg-emerald/10 border border-emerald/30 text-emerald rounded-xl text-xs font-semibold text-center">
                {submitSuccess}
              </div>
            ) : (
              <form onSubmit={handleCompensationSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">Event / Club Activity Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Smart India Hackathon / IEEE Tech Fest"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    className="w-full bg-paper border border-platinum rounded-xl px-3.5 py-2.5 text-xs text-ink outline-none focus:border-emerald focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">Date of Event</label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full bg-paper border border-platinum rounded-xl px-3.5 py-2.5 text-xs text-ink outline-none focus:border-emerald focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">Activity Category</label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full bg-paper border border-platinum rounded-xl px-3 py-2 text-xs text-ink outline-none focus:border-emerald"
                  >
                    <option value="college_function">College Technical Function / Workshop</option>
                    <option value="club_meeting">Student Club / Society Event</option>
                    <option value="sports">Inter-College Sports Tournament</option>
                    <option value="cultural">Cultural Festival / Youth Fest</option>
                  </select>
                </div>

                <div className="p-3 bg-paper rounded-xl text-[11px] text-slate border border-platinum">
                  Flow: Student &rarr; TA Verification &rarr; Faculty Approval &rarr; Auto-marked as Compensated.
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-platinum">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate hover:text-ink hover:bg-paper"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald hover:bg-emerald-dark shadow-md shadow-emerald/20 transition-all disabled:opacity-50"
                  >
                    {submitting ? "Submitting..." : "Submit to TA"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
