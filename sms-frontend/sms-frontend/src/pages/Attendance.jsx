import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Attendance() {
  const [students, setStudents] = useState([]);
  const [summary, setSummary] = useState([]);
  const [selected, setSelected] = useState("");
  const [status, setStatus] = useState("present");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const { user } = useAuth();

  const canMark = user?.role === "admin" || user?.role === "faculty" || user?.role === "ta";

  const load = async () => {
    setLoading(true);
    try {
      const [studentsRes, summaryRes] = await Promise.all([
        api.get("/students", { params: { limit: 100 } }),
        api.get("/attendance/summary/all"),
      ]);
      const list = studentsRes.data.students || studentsRes.data || [];
      setStudents(list);
      setSummary(summaryRes.data || []);
      if (list.length && !selected) setSelected(list[0]._id);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to load attendance data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleMark = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await api.post("/attendance", { studentId: selected, status, date });
      setMessage("Attendance record updated successfully!");
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to mark attendance");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-ink">Institutional Attendance Audit</h1>
        <p className="text-xs text-slate mt-0.5">
          Mark daily roll call and track aggregate classroom presence across departments
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Marking Form */}
        {canMark && (
          <div className="lg:col-span-1 bg-white border border-platinum rounded-2xl p-6 shadow-sm h-fit">
            <h2 className="font-heading text-base font-bold text-ink mb-1">Mark Roll Call</h2>
            <p className="text-xs text-slate mb-4">Record individual attendance manually</p>

            {message && (
              <div className="mb-4 p-3 rounded-xl bg-emerald/10 border border-emerald/30 text-emerald text-xs font-semibold">
                {message}
              </div>
            )}

            <form onSubmit={handleMark} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate mb-1">Select Student</label>
                <select
                  value={selected}
                  onChange={(e) => setSelected(e.target.value)}
                  className="w-full bg-paper border border-platinum rounded-xl px-3 py-2 text-xs text-ink outline-none focus:border-emerald"
                >
                  {students.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.rollNo})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate mb-1">Class Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-paper border border-platinum rounded-xl px-3 py-2 text-xs text-ink outline-none focus:border-emerald"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate mb-1">Attendance Status</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus("present")}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      status === "present"
                        ? "bg-emerald text-white border-emerald shadow-sm"
                        : "bg-paper border-platinum text-slate hover:text-ink"
                    }`}
                  >
                    Present
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus("absent")}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      status === "absent"
                        ? "bg-crimson text-white border-crimson shadow-sm"
                        : "bg-paper border-platinum text-slate hover:text-ink"
                    }`}
                  >
                    Absent
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-jet hover:bg-black text-white text-xs font-bold transition-colors shadow-md shadow-jet/10"
              >
                Save Attendance Record
              </button>
            </form>
          </div>
        )}

        {/* Summary Table */}
        <div className={canMark ? "lg:col-span-2" : "lg:col-span-3"}>
          <div className="bg-white border border-platinum rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-platinum bg-paper flex items-center justify-between">
              <h3 className="font-heading text-sm font-bold text-ink">Class Attendance Roster</h3>
              <span className="text-xs text-slate font-mono">{summary.length} records tracked</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-paper/60 border-b border-platinum text-slate uppercase text-[10px]">
                    <th className="py-3 px-4">Roll No</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-3">Branch & Sec</th>
                    <th className="py-3 px-3 text-center">Classes Held</th>
                    <th className="py-3 px-3 text-center">Attended</th>
                    <th className="py-3 px-4 text-center">Attendance %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-platinum">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="py-10 text-center text-slate">Loading attendance records...</td>
                    </tr>
                  ) : summary.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-10 text-center text-slate">No attendance recorded yet.</td>
                    </tr>
                  ) : (
                    summary.map((row) => {
                      const isSafe = row.attendancePercent >= 75;
                      return (
                        <tr key={row.studentId} className="hover:bg-paper/50 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-slate">{row.rollNo}</td>
                          <td className="py-3 px-4 font-bold text-ink">{row.name}</td>
                          <td className="py-3 px-3 font-semibold text-slate">
                            {row.branch} &bull; {row.section}
                          </td>
                          <td className="py-3 px-3 text-center font-mono text-slate">{row.total}</td>
                          <td className="py-3 px-3 text-center font-mono font-bold text-ink">{row.present}</td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-extrabold font-mono ${
                                isSafe
                                  ? "bg-emerald/15 text-emerald"
                                  : "bg-crimson/15 text-crimson"
                              }`}
                            >
                              {row.attendancePercent}%
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
