import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";
import StatCard from "../../components/StatCard";

export default function TADashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 1000,
    pendingRequests: 0,
    subjectsCount: 6,
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [studRes, reqRes] = await Promise.allSettled([
          api.get("/students", { params: { limit: 1 } }),
          api.get("/attendance-requests", { params: { status: "pending_ta" } }),
        ]);

        const totalStudents = studRes.status === "fulfilled" ? studRes.value.data.total : 1000;
        const pending = reqRes.status === "fulfilled" ? reqRes.value.data.length : 0;
        const requests = reqRes.status === "fulfilled" ? reqRes.value.data.slice(0, 5) : [];

        setStats({ totalStudents, pendingRequests: pending, subjectsCount: 6 });
        setRecentRequests(requests);
      } catch (err) {
        console.error("Failed to load TA stats", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Banner */}
      <div className="bg-gradient-to-r from-jet via-jet-light to-jet p-6 sm:p-8 rounded-3xl text-white shadow-lg relative overflow-hidden border border-jet-light">
        <div className="absolute right-0 top-0 w-96 h-full bg-emerald/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-light text-xs font-semibold mb-3 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald" />
              Teaching Assistant Portal &bull; Academic Operations
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome, {user?.name || "Teaching Assistant"}!
            </h1>
            <p className="text-xs sm:text-sm text-platinum-light mt-1">
              Manage student marks grading, section timetables, and verify event attendance requests.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              to="/ta/marks"
              className="px-4 py-2 rounded-xl bg-emerald hover:bg-emerald-dark text-white text-xs font-bold shadow-md shadow-emerald/20 transition-all flex items-center gap-1.5"
            >
              <span>Enter Marks Grid</span>
              <span>&rarr;</span>
            </Link>
            <Link
              to="/ta/attendance-requests"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/10 transition-all"
            >
              Pending Claims ({stats.pendingRequests})
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Students Under Care"
          value={stats.totalStudents}
          subtitle="Enrolled across 5 branches"
          color="emerald"
          trend="Kaggle Dataset Distribution"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
        />

        <StatCard
          title="Attendance Claims Pending"
          value={stats.pendingRequests}
          subtitle="Require TA verification"
          color={stats.pendingRequests > 0 ? "crimson" : "emerald"}
          trend={stats.pendingRequests > 0 ? "Action Required" : "All Reviewed"}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />

        <StatCard
          title="Active Timetable Slots"
          value="44 / week"
          subtitle="Mon - Sat Schedule"
          color="jet"
          trend="Labs & Lectures"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />

        <StatCard
          title="Laboratory Courses"
          value="3 Labs"
          subtitle="C Prog &bull; DSA &bull; Physics"
          color="platinum"
          trend="Semester 3 Batch"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          }
        />
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link
          to="/ta/marks"
          className="p-6 bg-white border border-platinum rounded-2xl shadow-sm hover:border-emerald hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald/10 text-emerald flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h3 className="font-heading text-base font-bold text-ink group-hover:text-emerald transition-colors">
            Enter Student Marks &rarr;
          </h3>
          <p className="text-xs text-slate mt-1">
            Input mid-semester tests, lab assessments, and quiz scores with auto-grade computation.
          </p>
        </Link>

        <Link
          to="/ta/timetable"
          className="p-6 bg-white border border-platinum rounded-2xl shadow-sm hover:border-emerald hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-jet/10 text-ink flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="font-heading text-base font-bold text-ink group-hover:text-emerald transition-colors">
            Edit Class Timetable &rarr;
          </h3>
          <p className="text-xs text-slate mt-1">
            Update classroom allocations, reschedule lab periods, and balance faculty hours.
          </p>
        </Link>

        <Link
          to="/ta/attendance-requests"
          className="p-6 bg-white border border-platinum rounded-2xl shadow-sm hover:border-emerald hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-crimson/10 text-crimson flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="font-heading text-base font-bold text-ink group-hover:text-emerald transition-colors">
            Verify Compensation Claims &rarr;
          </h3>
          <p className="text-xs text-slate mt-1">
            Review event proof submitted by students and forward to course faculty for approval.
          </p>
        </Link>
      </div>

      {/* Pending Attendance Requests Table */}
      <div className="bg-white border border-platinum rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-heading text-base font-bold text-ink">Recent Attendance Compensation Queue</h3>
            <p className="text-xs text-slate">Students awaiting initial TA verification</p>
          </div>
          <Link to="/ta/attendance-requests" className="text-xs font-semibold text-emerald hover:underline">
            View All &rarr;
          </Link>
        </div>

        <div className="divide-y divide-platinum">
          {recentRequests.length === 0 ? (
            <p className="py-6 text-center text-xs text-slate">No pending claims in your queue right now.</p>
          ) : (
            recentRequests.map((r) => (
              <div key={r._id} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-ink">{r.studentName || "Student"}</span>
                    <span className="text-[10px] font-mono text-slate">({r.rollNo})</span>
                  </div>
                  <p className="text-xs text-slate mt-0.5">
                    {r.eventName} &bull; Date: {r.eventDate}
                  </p>
                </div>
                <Link
                  to="/ta/attendance-requests"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald text-white hover:bg-emerald-dark"
                >
                  Review
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
