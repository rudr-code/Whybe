import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";

export default function StudentMarks() {
  const { user } = useAuth();
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchMarks(isBackground = false) {
      try {
        if (!isBackground) setLoading(true);
        const sId = user?.studentRef || "student-0001";
        const { data } = await api.get(`/marks/student/${sId}`);
        if (isMounted) setMarks(data);
      } catch (err) {
        console.error("Failed to load student marks", err);
      } finally {
        if (isMounted && !isBackground) setLoading(false);
      }
    }

    fetchMarks(false);

    // Dynamic short-interval polling (every 6 seconds)
    const interval = setInterval(() => {
      fetchMarks(true);
    }, 6000);

    // Revalidate immediately on tab focus or visibility change
    const onFocus = () => {
      if (document.visibilityState === "visible") {
        fetchMarks(true);
      }
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [user]);

  const avgTotal = marks.length > 0
    ? Math.round(marks.reduce((acc, m) => acc + (m.total || 0), 0) / marks.length)
    : 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-ink">Grades & Examination Marksheet</h1>
          <p className="text-xs text-slate mt-0.5">
            Official evaluation record for Academic Year 2025–2026 &middot; Semester 3
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white border border-platinum px-4 py-2 rounded-xl text-right">
            <span className="text-[10px] uppercase font-bold text-slate block">Average Score</span>
            <span className="font-heading text-lg font-extrabold text-emerald">{avgTotal}/100</span>
          </div>
          <div className="bg-white border border-platinum px-4 py-2 rounded-xl text-right">
            <span className="text-[10px] uppercase font-bold text-slate block">Credits Registered</span>
            <span className="font-heading text-lg font-extrabold text-ink">20</span>
          </div>
        </div>
      </div>

      {/* Main Marksheet Table */}
      <div className="bg-white border border-platinum rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-platinum flex items-center justify-between bg-paper">
          <div>
            <h3 className="font-heading text-base font-bold text-ink">Semester 3 Course Evaluations</h3>
            <p className="text-xs text-slate">Internal Continuous Assessments + Semester End Exams</p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald/10 text-emerald border border-emerald/20">
            Current Semester
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-paper/60 border-b border-platinum text-slate uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Subject Code</th>
                <th className="py-3 px-4">Course Name</th>
                <th className="py-3 px-3 text-center">Mid-Sem 1 (25)</th>
                <th className="py-3 px-3 text-center">Mid-Sem 2 (25)</th>
                <th className="py-3 px-3 text-center">End-Sem (40)</th>
                <th className="py-3 px-3 text-center">Internal (10)</th>
                <th className="py-3 px-3 text-center font-bold text-ink">Total (100)</th>
                <th className="py-3 px-4 text-center">Letter Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-platinum">
              {marks.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate">
                    {loading ? "Loading marks..." : "No marks published yet for this semester."}
                  </td>
                </tr>
              ) : (
                marks.map((m) => {
                  const isTopGrade = m.grade === "A+" || m.grade === "A";
                  const isFail = m.grade === "F";
                  return (
                    <tr key={m._id} className="hover:bg-paper/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate">{m.subjectCode}</td>
                      <td className="py-3 px-4 font-bold text-ink">{m.subjectName}</td>
                      <td className="py-3 px-3 text-center font-mono">{m.midSem1}</td>
                      <td className="py-3 px-3 text-center font-mono">{m.midSem2}</td>
                      <td className="py-3 px-3 text-center font-mono">{m.endSem}</td>
                      <td className="py-3 px-3 text-center font-mono">{m.internal}</td>
                      <td className="py-3 px-3 text-center font-mono font-extrabold text-ink text-sm">
                        {m.total}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-3 py-1 rounded-lg text-xs font-extrabold font-mono shadow-xs ${
                            isTopGrade
                              ? "bg-emerald/15 text-emerald border border-emerald/30"
                              : isFail
                              ? "bg-crimson/15 text-crimson border border-crimson/30"
                              : "bg-platinum/60 text-ink border border-platinum"
                          }`}
                        >
                          {m.grade}
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

      {/* Grading Scale Legend */}
      <div className="bg-white border border-platinum rounded-2xl p-5 shadow-sm">
        <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-slate mb-3">
          University Grading Scale Reference
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-center text-xs">
          {[
            { grade: "A+", range: "90 - 100", point: "10.0" },
            { grade: "A", range: "80 - 89", point: "9.0" },
            { grade: "B+", range: "70 - 79", point: "8.0" },
            { grade: "B", range: "60 - 69", point: "7.0" },
            { grade: "C+", range: "50 - 59", point: "6.0" },
            { grade: "C", range: "40 - 49", point: "5.0" },
            { grade: "D", range: "30 - 39", point: "4.0" },
            { grade: "F", range: "< 30 (Fail)", point: "0.0" },
          ].map((item) => (
            <div key={item.grade} className="p-2.5 rounded-xl border border-platinum bg-paper">
              <div className="font-bold text-ink text-sm">{item.grade}</div>
              <div className="text-[10px] text-slate font-mono mt-0.5">{item.range}</div>
              <div className="text-[10px] font-semibold text-emerald mt-1">GP: {item.point}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
