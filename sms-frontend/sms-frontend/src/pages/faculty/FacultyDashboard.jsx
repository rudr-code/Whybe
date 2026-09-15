import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";
import StatCard from "../../components/StatCard";

export default function FacultyDashboard() {
  const { user } = useAuth();
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [reqRes, subRes] = await Promise.allSettled([
          api.get("/attendance-requests", { params: { status: "pending_faculty" } }),
          api.get("/subjects"),
        ]);

        if (reqRes.status === "fulfilled") setPendingApprovals(reqRes.value.data.length);
        if (subRes.status === "fulfilled") setSubjects(subRes.value.data);
      } catch (err) {
        console.error("Failed to load faculty dashboard data", err);
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
              Faculty Member Portal &bull; Department of Engineering
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome, {user?.name || "Professor"}!
            </h1>
            <p className="text-xs sm:text-sm text-platinum-light mt-1">
              Course evaluation, student inspection, and final attendance approvals
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              to="/faculty/students"
              className="px-4 py-2 rounded-xl bg-emerald hover:bg-emerald-dark text-white text-xs font-bold shadow-md shadow-emerald/20 transition-all flex items-center gap-1.5"
            >
              <span>Inspect Students</span>
              <span>&rarr;</span>
            </Link>
            <Link
              to="/faculty/attendance-approval"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/10 transition-all"
            >
              Pending Approvals ({pendingApprovals})
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Subjects"
          value={subjects.length > 0 ? subjects.length : "6"}
          subtitle="Core theory & lab sessions"
          color="emerald"
          trend="Credits: 20 total"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          }
        />

        <StatCard
          title="Attendance Approvals Queue"
          value={pendingApprovals}
          subtitle="Forwarded by TAs"
          color={pendingApprovals > 0 ? "crimson" : "emerald"}
          trend={pendingApprovals > 0 ? "Pending Final Signature" : "Up to Date"}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        <StatCard
          title="Department Batch"
          value="1,000"
          subtitle="Students enrolled"
          color="jet"
          trend="5 Branches Active"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />

        <StatCard
          title="Evaluation Status"
          value="Mid-Sem Done"
          subtitle="End-sem preparation"
          color="platinum"
          trend="Grading Cycle Active"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
      </div>

      {/* Action Modules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link
          to="/faculty/students"
          className="p-6 bg-white border border-platinum rounded-2xl shadow-sm hover:border-emerald hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald/10 text-emerald flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="font-heading text-base font-bold text-ink group-hover:text-emerald transition-colors">
            Sequential Student Inspector &rarr;
          </h3>
          <p className="text-xs text-slate mt-1">
            Navigate through individual student profiles sequentially with complete marks, attendance logs, and Kaggle demographic data.
          </p>
        </Link>

        <Link
          to="/faculty/marks"
          className="p-6 bg-white border border-platinum rounded-2xl shadow-sm hover:border-emerald hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-jet/10 text-ink flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="font-heading text-base font-bold text-ink group-hover:text-emerald transition-colors">
            Subject Marksheet & Grading &rarr;
          </h3>
          <p className="text-xs text-slate mt-1">
            View class-wide marks distribution, grade curves, and audit student evaluations before publication.
          </p>
        </Link>

        <Link
          to="/faculty/attendance-approval"
          className="p-6 bg-white border border-platinum rounded-2xl shadow-sm hover:border-emerald hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-crimson/10 text-crimson flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="font-heading text-base font-bold text-ink group-hover:text-emerald transition-colors">
            Attendance Compensation Approvals &rarr;
          </h3>
          <p className="text-xs text-slate mt-1">
            Give final approval for students who represented the college in hackathons and sports events.
          </p>
        </Link>
      </div>
    </div>
  );
}
