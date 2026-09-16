import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";
import StatCard from "../../components/StatCard";
import TimetableGrid from "../../components/TimetableGrid";
import MessMenuCard from "../../components/MessMenuCard";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [studentData, setStudentData] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [marks, setMarks] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [messMenu, setMessMenu] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadData(isBackground = false) {
      try {
        if (!isBackground) setLoading(true);
        const sId = user?.studentRef || "student-0001";

        const [studentRes, attRes, marksRes, ttRes, messRes] = await Promise.allSettled([
          api.get(`/students/${sId}`),
          api.get(`/attendance/${sId}`),
          api.get(`/marks/student/${sId}`),
          api.get("/timetable", { params: { branch: "CSE", section: "A" } }),
          api.get("/mess-menu"),
        ]);

        if (isMounted) {
          if (studentRes.status === "fulfilled") setStudentData(studentRes.value.data);
          if (attRes.status === "fulfilled") setAttendance(attRes.value.data);
          if (marksRes.status === "fulfilled") setMarks(marksRes.value.data);
          if (ttRes.status === "fulfilled") setTimetable(ttRes.value.data);
          if (messRes.status === "fulfilled") setMessMenu(messRes.value.data);
        }
      } catch (err) {
        console.error("Error loading student dashboard:", err);
      } finally {
        if (isMounted && !isBackground) setLoading(false);
      }
    }

    loadData(false);

    const interval = setInterval(() => {
      loadData(true);
    }, 8000);

    const onFocus = () => {
      if (document.visibilityState === "visible") {
        loadData(true);
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

  const attPercent = attendance?.overall?.percent ?? 88;
  const isAttendanceSafe = attPercent >= 75;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-jet via-jet-light to-jet p-6 sm:p-8 rounded-3xl text-white shadow-lg relative overflow-hidden border border-jet-light">
        <div className="absolute right-0 top-0 w-96 h-full bg-emerald/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-light text-xs font-semibold mb-3 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald animate-pulse" />
              Student Academic Portal &bull; Semester 3
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name || "Student"}!
            </h1>
            <p className="text-xs sm:text-sm text-platinum-light mt-1">
              Roll No: <span className="font-mono text-emerald font-semibold">{studentData?.rollNo || "CSE-001"}</span> &middot; Branch: {studentData?.branch || "CSE"} &middot; Section: {studentData?.section || "A"}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              to="/student/attendance"
              className="px-4 py-2 rounded-xl bg-emerald hover:bg-emerald-dark text-white text-xs font-bold shadow-md shadow-emerald/20 transition-all flex items-center gap-1.5"
            >
              <span>View Attendance Log</span>
              <span>&rarr;</span>
            </Link>
            <Link
              to="/student/notifications"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/10 transition-all"
            >
              Request Leave / Compensation
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Attendance"
          value={`${attPercent}%`}
          subtitle={isAttendanceSafe ? "Requirement met (min 75%)" : "Warning: Below 75% requirement"}
          color={isAttendanceSafe ? "emerald" : "crimson"}
          trend={isAttendanceSafe ? "Eligible for End-Sem" : "Attendance Shortage"}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        <StatCard
          title="Total Subjects"
          value={marks.length > 0 ? marks.length : "6"}
          subtitle="All active core courses"
          color="jet"
          trend="Credits: 20 total"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          }
        />

        <StatCard
          title="Semester Fee Status"
          value={studentData?.feeStatus ? studentData.feeStatus.toUpperCase() : "PAID"}
          subtitle={`Rs. ${studentData?.feeAmount?.toLocaleString() || "75,000"}`}
          color={studentData?.feeStatus === "overdue" ? "crimson" : "emerald"}
          trend={studentData?.feeStatus === "paid" ? "No Dues Pending" : "Payment Due Soon"}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          }
        />

        <StatCard
          title="Hostel & Mess"
          value="Active"
          subtitle="Veg / Non-Veg Regular Plan"
          color="platinum"
          trend="Mess Hall Block B"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
            </svg>
          }
        />
      </div>

      {/* Two-Column Section: Subject Attendance & Academic Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Breakdown Card */}
        <div className="bg-white border border-platinum rounded-2xl p-5 shadow-sm lg:col-span-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-base font-bold text-ink">Course Attendance</h3>
              <Link to="/student/attendance" className="text-xs font-semibold text-emerald hover:underline">
                Details &rarr;
              </Link>
            </div>

            <div className="space-y-3.5">
              {attendance?.bySubject?.map((s) => (
                <div key={s.subjectId}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-ink truncate max-w-[170px]">{s.subjectName}</span>
                    <span className={`font-bold font-mono ${s.percent >= 75 ? "text-emerald" : "text-crimson"}`}>
                      {s.percent}%
                    </span>
                  </div>
                  <div className="w-full bg-paper rounded-full h-2 overflow-hidden border border-platinum">
                    <div
                      className={`h-full rounded-full ${s.percent >= 75 ? "bg-emerald" : "bg-crimson"}`}
                      style={{ width: `${Math.min(100, s.percent)}%` }}
                    />
                  </div>
                </div>
              )) || (
                <p className="text-xs text-slate">Attendance records will be displayed here.</p>
              )}
            </div>
          </div>

          <div className="mt-5 p-3 rounded-xl bg-paper border border-platinum text-[11px] text-slate">
            <span className="font-bold text-ink">Note:</span> Minimum 75% attendance is mandatory to appear in end-semester exams.
          </div>
        </div>

        {/* Recent Marks / Grades Preview */}
        <div className="bg-white border border-platinum rounded-2xl p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading text-base font-bold text-ink">Recent Exam Scores & Grades</h3>
              <p className="text-xs text-slate">Performance based on mid-semesters & practicals</p>
            </div>
            <Link to="/student/marks" className="text-xs font-semibold text-emerald hover:underline">
              Full Marksheet &rarr;
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-platinum text-slate uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Subject</th>
                  <th className="py-2.5 px-3 text-center">Mid-1 (25)</th>
                  <th className="py-2.5 px-3 text-center">Mid-2 (25)</th>
                  <th className="py-2.5 px-3 text-center">End Sem (40)</th>
                  <th className="py-2.5 px-3 text-center">Total (100)</th>
                  <th className="py-2.5 px-3 text-center">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-platinum/60">
                {marks.slice(0, 5).map((m) => (
                  <tr key={m._id} className="hover:bg-paper/50">
                    <td className="py-2.5 px-3 font-semibold text-ink">
                      <div>{m.subjectName}</div>
                      <span className="text-[10px] text-slate font-mono">{m.subjectCode}</span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono">{m.midSem1}</td>
                    <td className="py-2.5 px-3 text-center font-mono">{m.midSem2}</td>
                    <td className="py-2.5 px-3 text-center font-mono">{m.endSem}</td>
                    <td className="py-2.5 px-3 text-center font-bold font-mono text-ink">{m.total}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[11px] font-extrabold ${
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Timetable Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-heading text-lg font-bold text-ink">Weekly Class Timetable</h3>
            <p className="text-xs text-slate">Your assigned lectures and laboratory sessions</p>
          </div>
          <Link to="/student/timetable" className="text-xs font-semibold text-emerald hover:underline">
            Expand Schedule &rarr;
          </Link>
        </div>
        <TimetableGrid entries={timetable} highlightToday={true} editable={false} />
      </div>

      {/* Mess Menu Card */}
      <MessMenuCard menuList={messMenu} />
    </div>
  );
}
