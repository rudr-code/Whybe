import { useState, useEffect } from "react";
import api from "../../api/axios";

export default function FacultyStudents() {
  const [students, setStudents] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentStudentData, setCurrentStudentData] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Load initial list of students
  useEffect(() => {
    async function fetchList() {
      try {
        setLoadingList(true);
        const { data } = await api.get("/students", { params: { limit: 100 } });
        setStudents(data.students);
      } catch (err) {
        console.error("Failed to load students list", err);
      } finally {
        setLoadingList(false);
      }
    }
    fetchList();
  }, []);

  // Whenever currentIndex or students change, fetch full student details (including marks & attendance)
  useEffect(() => {
    async function fetchDetails() {
      if (students.length === 0) return;
      const s = students[currentIndex];
      if (!s) return;

      try {
        setLoadingDetails(true);
        const { data } = await api.get(`/students/${s._id}`);
        setCurrentStudentData(data);
      } catch (err) {
        console.error("Failed to load student details", err);
      } finally {
        setLoadingDetails(false);
      }
    }
    fetchDetails();
  }, [currentIndex, students]);

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(students.length - 1, prev + 1));
  };

  const current = currentStudentData || students[currentIndex];
  const marks = currentStudentData?.marks || [];
  const attSummary = currentStudentData?.attendanceSummary || { percent: 85, total: 30, present: 25 };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header with Sequential Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-platinum rounded-2xl p-5 shadow-sm">
        <div>
          <h1 className="font-heading text-xl font-bold text-ink">Sequential Student Inspector</h1>
          <p className="text-xs text-slate mt-0.5">
            Student {currentIndex + 1} of {students.length} &bull; Browse full student profiles sequentially
          </p>
        </div>

        {/* Previous / Next buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0 || loadingList}
            className="px-4 py-2 rounded-xl border border-platinum bg-paper hover:bg-white text-xs font-bold text-ink transition-colors disabled:opacity-40 flex items-center gap-1.5"
          >
            <span>&larr;</span>
            <span>Previous Student</span>
          </button>
          <button
            onClick={handleNext}
            disabled={currentIndex >= students.length - 1 || loadingList}
            className="px-4 py-2 rounded-xl bg-emerald hover:bg-emerald-dark text-white text-xs font-bold shadow-md shadow-emerald/20 transition-all disabled:opacity-40 flex items-center gap-1.5"
          >
            <span>Next Student</span>
            <span>&rarr;</span>
          </button>
        </div>
      </div>

      {loadingList || !current ? (
        <div className="bg-white border border-platinum rounded-2xl p-16 text-center text-xs text-slate">
          Loading student dossier...
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Dossier Card */}
          <div className="bg-white border border-platinum rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-platinum">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-jet text-emerald font-heading text-2xl font-bold flex items-center justify-center shadow-md">
                  {current.name?.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-heading text-2xl font-bold text-ink">{current.name}</h2>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-paper border border-platinum text-slate">
                      {current.rollNo}
                    </span>
                  </div>
                  <p className="text-xs text-slate mt-1">
                    Branch: <span className="font-semibold text-ink">{current.branch}</span> &bull; Section: <span className="font-semibold text-ink">{current.section}</span> &bull; Semester: {current.semester || "3"}
                  </p>
                </div>
              </div>

              {/* Attendance & Fee Badges */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate block">Course Attendance</span>
                  <span className={`font-heading text-xl font-bold font-mono ${
                    attSummary.percent >= 75 ? "text-emerald" : "text-crimson"
                  }`}>
                    {attSummary.percent}%
                  </span>
                </div>
                <div className="w-px h-10 bg-platinum" />
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate block">Fee Clearance</span>
                  <span className={`text-xs font-extrabold uppercase px-2.5 py-1 rounded-md inline-block ${
                    current.feeStatus === "paid" ? "bg-emerald/15 text-emerald" : "bg-crimson/15 text-crimson"
                  }`}>
                    {current.feeStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Profile & Kaggle Dataset Fields */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 text-xs">
              <div className="p-3 bg-paper rounded-xl border border-platinum">
                <span className="text-[10px] uppercase font-semibold text-slate block">Gender</span>
                <span className="font-bold text-ink capitalize mt-0.5 block">{current.gender || "male"}</span>
              </div>
              <div className="p-3 bg-paper rounded-xl border border-platinum">
                <span className="text-[10px] uppercase font-semibold text-slate block">Date of Birth (Password)</span>
                <span className="font-bold text-ink font-mono mt-0.5 block">{current.dob || "2005-01-01"}</span>
              </div>
              <div className="p-3 bg-paper rounded-xl border border-platinum">
                <span className="text-[10px] uppercase font-semibold text-slate block">Parental Education (Kaggle)</span>
                <span className="font-bold text-ink capitalize mt-0.5 block">{current.parentalEducation || "bachelor's degree"}</span>
              </div>
              <div className="p-3 bg-paper rounded-xl border border-platinum">
                <span className="text-[10px] uppercase font-semibold text-slate block">Lunch Plan (Kaggle)</span>
                <span className="font-bold text-ink capitalize mt-0.5 block">{current.lunchType || "standard"}</span>
              </div>
            </div>
          </div>

          {/* Academic Marksheet Across All 6 Courses */}
          <div className="bg-white border border-platinum rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-platinum bg-paper flex items-center justify-between">
              <h3 className="font-heading text-sm font-bold text-ink">Academic Marksheet & Evaluation</h3>
              <span className="text-xs font-semibold text-slate">Semester 3 Core Subjects</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-paper/60 border-b border-platinum text-slate uppercase text-[10px]">
                    <th className="py-2.5 px-4">Subject</th>
                    <th className="py-2.5 px-3 text-center">Mid-Sem 1 (25)</th>
                    <th className="py-2.5 px-3 text-center">Mid-Sem 2 (25)</th>
                    <th className="py-2.5 px-3 text-center">End-Sem (40)</th>
                    <th className="py-2.5 px-3 text-center">Internal (10)</th>
                    <th className="py-2.5 px-3 text-center">Total (100)</th>
                    <th className="py-2.5 px-4 text-center">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-platinum">
                  {loadingDetails ? (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-slate">Loading marksheet...</td>
                    </tr>
                  ) : marks.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-slate">No marks recorded yet.</td>
                    </tr>
                  ) : (
                    marks.map((m) => (
                      <tr key={m._id} className="hover:bg-paper/50">
                        <td className="py-3 px-4 font-bold text-ink">
                          <div>{m.subjectName}</div>
                          <span className="text-[10px] font-mono text-slate">{m.subjectCode}</span>
                        </td>
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
      )}
    </div>
  );
}
