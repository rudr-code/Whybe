import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const Attendance = () => {
  const [students, setStudents] = useState([]);
  const [summary, setSummary] = useState([]);
  const [selected, setSelected] = useState("");
  const [status, setStatus] = useState("present");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const { user } = useAuth();

  const canMark = user?.role === "admin" || user?.role === "faculty";

  const load = async () => {
    setLoading(true);
    try {
      const [studentsRes, summaryRes] = await Promise.all([
        api.get("/students"),
        api.get("/attendance/summary/all"),
      ]);
      setStudents(studentsRes.data);
      setSummary(summaryRes.data);
      if (studentsRes.data.length && !selected) setSelected(studentsRes.data[0]._id);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to load attendance data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleMark = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await api.post("/attendance", { studentId: selected, status, date });
      setMessage("Attendance marked.");
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to mark attendance");
    }
  };

  const pctColor = (pct) =>
    pct >= 85 ? "text-ok" : pct >= 70 ? "text-warn" : "text-bad";

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="font-serif text-3xl text-ink mb-1">Attendance</h1>
      <p className="text-sm text-slate mb-8">Mark daily attendance and track percentage per student</p>

      <div className="grid grid-cols-3 gap-6">
        {canMark && (
          <div className="col-span-1 bg-white border border-black/5 rounded-lg p-6 h-fit">
            <h2 className="text-sm font-semibold text-ink mb-4">Mark attendance</h2>
            <form onSubmit={handleMark} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate mb-1">Student</label>
                <select
                  value={selected}
                  onChange={(e) => setSelected(e.target.value)}
                  className="w-full border border-black/10 rounded-md px-3 py-2 text-sm focus:border-indigo outline-none"
                >
                  {students.map((s) => (
                    <option key={s._id} value={s._id}>{s.name} ({s.rollNo})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border border-black/10 rounded-md px-3 py-2 text-sm focus:border-indigo outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate mb-1">Status</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus("present")}
                    className={`flex-1 text-sm py-2 rounded-md font-medium border ${
                      status === "present" ? "bg-ok/10 border-ok text-ok" : "border-black/10 text-slate"
                    }`}
                  >
                    Present
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus("absent")}
                    className={`flex-1 text-sm py-2 rounded-md font-medium border ${
                      status === "absent" ? "bg-bad/10 border-bad text-bad" : "border-black/10 text-slate"
                    }`}
                  >
                    Absent
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo hover:bg-indigo-light text-white text-sm font-medium py-2.5 rounded-md mt-2"
              >
                Save attendance
              </button>

              {message && <p className="text-xs text-slate pt-1">{message}</p>}
            </form>
          </div>
        )}

        <div className={canMark ? "col-span-2" : "col-span-3"}>
          <div className="bg-white border border-black/5 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/5 text-left text-xs text-slate">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Roll no.</th>
                  <th className="px-5 py-3 font-medium">Days recorded</th>
                  <th className="px-5 py-3 font-medium">Attendance %</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="px-5 py-8 text-center text-slate">Loading...</td></tr>
                ) : summary.length === 0 ? (
                  <tr><td colSpan={4} className="px-5 py-8 text-center text-slate">No attendance records yet</td></tr>
                ) : (
                  summary
                    .slice()
                    .sort((a, b) => a.rollNo.localeCompare(b.rollNo))
                    .map((row) => (
                      <tr key={row.studentId} className="border-b border-black/5 last:border-0">
                        <td className="px-5 py-3 font-medium text-ink">{row.name}</td>
                        <td className="px-5 py-3 text-slate">{row.rollNo}</td>
                        <td className="px-5 py-3 text-slate">{row.total}</td>
                        <td className={`px-5 py-3 font-semibold ${pctColor(row.attendancePercent)}`}>
                          {row.attendancePercent}%
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
