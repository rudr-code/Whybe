import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";
import StatCard from "../../components/StatCard";

export default function ExamCellDashboard() {
  const { user } = useAuth();
  const [subjectsCount, setSubjectsCount] = useState(6);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const { data } = await api.get("/subjects");
        setSubjectsCount(data.length);
      } catch (err) {
        console.error("Failed to load exam cell stats", err);
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
              Office of the Controller of Examinations
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight">
              Examination Cell Portal
            </h1>
            <p className="text-xs sm:text-sm text-platinum-light mt-1">
              Curriculum subject management, end-semester evaluation, and grade verification desk
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              to="/examcell/subjects"
              className="px-4 py-2 rounded-xl bg-emerald hover:bg-emerald-dark text-white text-xs font-bold shadow-md shadow-emerald/20 transition-all flex items-center gap-1.5"
            >
              <span>Manage Subjects</span>
              <span>&rarr;</span>
            </Link>
            <Link
              to="/examcell/grade-override"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/10 transition-all"
            >
              Grade Verification & Override
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Course Subjects"
          value={subjectsCount}
          subtitle="Semester 3 Curriculum"
          color="emerald"
          trend="Credits: 20 Registered"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          }
        />

        <StatCard
          title="Total Exam Candidates"
          value="1,000"
          subtitle="Enrolled students"
          color="jet"
          trend="Hall Tickets Generated"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />

        <StatCard
          title="Overall Clearance Rate"
          value="96.2%"
          subtitle="Pass percentage"
          color="emerald"
          trend="Target: 95% Min"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        <StatCard
          title="Examination Cycle"
          value="End-Sem 2026"
          subtitle="December session"
          color="platinum"
          trend="Draft Timetable Prepared"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
      </div>

      {/* Main Operations Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Link
          to="/examcell/subjects"
          className="p-6 bg-white border border-platinum rounded-2xl shadow-sm hover:border-emerald hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald/10 text-emerald flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="font-heading text-base font-bold text-ink group-hover:text-emerald transition-colors">
            Academic Subjects & Curriculum Catalogue &rarr;
          </h3>
          <p className="text-xs text-slate mt-1">
            Define subject codes, credit weightages, branch assignments, and assign course lead faculty.
          </p>
        </Link>

        <Link
          to="/examcell/grade-override"
          className="p-6 bg-white border border-platinum rounded-2xl shadow-sm hover:border-emerald hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-jet/10 text-ink flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <h3 className="font-heading text-base font-bold text-ink group-hover:text-emerald transition-colors">
            Official Grade Verification & Override Desk &rarr;
          </h3>
          <p className="text-xs text-slate mt-1">
            Conduct re-evaluation audits, moderate end-semester answer scripts, and apply official grade revisions.
          </p>
        </Link>
      </div>
    </div>
  );
}
