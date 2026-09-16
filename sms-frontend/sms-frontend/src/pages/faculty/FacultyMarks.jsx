import { useState, useEffect } from "react";
import api from "../../api/axios";

export default function FacultyMarks() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSubjects() {
      try {
        const { data } = await api.get("/subjects");
        setSubjects(data);
        if (data.length > 0) setSelectedSubjectId(data[0]._id);
      } catch (err) {
        console.error("Failed to load subjects", err);
      }
    }
    loadSubjects();
  }, []);

  const fetchMarks = async (isBackground = false) => {
    if (!selectedSubjectId) return;
    try {
      if (!isBackground) setLoading(true);
      const { data } = await api.get(`/marks/subject/${selectedSubjectId}`, {
        params: { limit: 50 },
      });
      setMarks(data.marks);
    } catch (err) {
      console.error("Failed to fetch marks", err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarks(false);

    // Dynamic short-interval polling (every 6 seconds)
    const interval = setInterval(() => {
      fetchMarks(true);
    }, 6000);

    const onFocus = () => {
      if (document.visibilityState === "visible") {
        fetchMarks(true);
      }
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [selectedSubjectId]);

  const selectedSubj = subjects.find((s) => s._id === selectedSubjectId);

  // Stats calculation
  const totalCount = marks.length;
  const avgTotal = totalCount > 0
    ? Math.round(marks.reduce((acc, m) => acc + (m.total || 0), 0) / totalCount)
    : 0;
  const passCount = marks.filter((m) => m.grade !== "F").length;
  const passRate = totalCount > 0 ? Math.round((passCount / totalCount) * 100) : 100;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-ink">Course Marks & Grade Audit</h1>
          <p className="text-xs text-slate mt-0.5">
            Audit evaluation curves, test performance, and final letter grades
          </p>
        </div>

        {/* Subject Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-ink">Subject:</label>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="bg-paper border border-platinum rounded-xl px-3 py-2 text-xs text-ink font-semibold outline-none focus:border-emerald"
          >
            {subjects.map((s) => (
              <option key={s._id} value={s._id}>
                {s.code} &mdash; {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-platinum rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate block">Class Average</span>
          <div className="font-heading text-2xl font-bold text-ink mt-1">{avgTotal} / 100</div>
          <span className="text-xs text-slate mt-1 block">Course: {selectedSubj?.name}</span>
        </div>

        <div className="bg-white border border-platinum rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate block">Pass Clearance Rate</span>
          <div className="font-heading text-2xl font-bold text-emerald mt-1">{passRate}%</div>
          <span className="text-xs text-slate mt-1 block">{passCount} passed of {totalCount} evaluated</span>
        </div>

        <div className="bg-white border border-platinum rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate block">Credit Weightage</span>
          <div className="font-heading text-2xl font-bold text-ink mt-1">{selectedSubj?.credits || 4} Credits</div>
          <span className="text-xs text-slate mt-1 block">Core Curriculum Course</span>
        </div>
      </div>

      {/* Marks Table */}
      <div className="bg-white border border-platinum rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-platinum bg-paper flex items-center justify-between">
          <h3 className="font-heading text-sm font-bold text-ink">Student Score Roster</h3>
          <span className="text-xs text-slate font-mono">Showing {marks.length} students</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-paper/60 border-b border-platinum text-slate uppercase text-[10px]">
                <th className="py-3 px-4">Roll No</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-3 text-center">Mid-1 (25)</th>
                <th className="py-3 px-3 text-center">Mid-2 (25)</th>
                <th className="py-3 px-3 text-center">End-Sem (40)</th>
                <th className="py-3 px-3 text-center">Internal (10)</th>
                <th className="py-3 px-3 text-center font-bold text-ink">Total (100)</th>
                <th className="py-3 px-4 text-center">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-platinum">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-10 text-center text-slate">Loading course marks...</td>
                </tr>
              ) : marks.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-10 text-center text-slate">No marks records found for this subject.</td>
                </tr>
              ) : (
                marks.map((m) => (
                  <tr key={m._id} className="hover:bg-paper/50">
                    <td className="py-3 px-4 font-mono font-bold text-slate">{m.rollNo}</td>
                    <td className="py-3 px-4 font-bold text-ink">{m.studentName}</td>
                    <td className="py-3 px-3 text-center font-mono">{m.midSem1}</td>
                    <td className="py-3 px-3 text-center font-mono">{m.midSem2}</td>
                    <td className="py-3 px-3 text-center font-mono">{m.endSem}</td>
                    <td className="py-3 px-3 text-center font-mono">{m.internal}</td>
                    <td className="py-3 px-3 text-center font-mono font-extrabold text-ink">{m.total}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-bold font-mono ${
                          m.grade === "A+" || m.grade === "A"
                            ? "bg-emerald/15 text-emerald"
                            : m.grade === "F"
                            ? "bg-crimson/15 text-crimson"
                            : "bg-platinum text-ink"
                        }`}
                      >
                        {m.grade}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
