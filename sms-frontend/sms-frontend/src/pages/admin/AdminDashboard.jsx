import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";
import StatCard from "../../components/StatCard";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [totalStudents, setTotalStudents] = useState(1000);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const { data } = await api.get("/students", { params: { limit: 1 } });
        if (data.total) setTotalStudents(data.total);
      } catch (err) {
        console.error("Failed to load admin stats", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Visual chart datasets based on Kaggle 1000-student distribution
  const branchData = [
    { branch: "CSE", count: 200 },
    { branch: "AI & ML", count: 200 },
    { branch: "ECE", count: 200 },
    { branch: "Mechanical", count: 200 },
    { branch: "Civil", count: 200 },
  ];

  const feeData = [
    { name: "Paid Fees (Full)", value: 645, color: "#10B981" }, // Emerald
    { name: "Pending Installment", value: 215, color: "#737373" }, // Platinum Slate
    { name: "Overdue Fees", value: 140, color: "#DC2626" }, // Crimson
  ];

  const attendanceDistribution = [
    { range: "< 75% (At Risk)", students: 120, fill: "#DC2626" },
    { range: "75% - 84%", students: 340, fill: "#737373" },
    { range: "85% - 94%", students: 410, fill: "#10B981" },
    { range: "95% - 100%", students: 130, fill: "#059669" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Banner */}
      <div className="bg-gradient-to-r from-jet via-jet-light to-jet p-6 sm:p-8 rounded-3xl text-white shadow-lg relative overflow-hidden border border-jet-light">
        <div className="absolute right-0 top-0 w-96 h-full bg-emerald/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-light text-xs font-semibold mb-3 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald" />
              University Administration Console &bull; CampusSync Core
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome, {user?.name || "Administrator"}!
            </h1>
            <p className="text-xs sm:text-sm text-platinum-light mt-1">
              Institutional intelligence & real-time telemetry across {totalStudents} students &middot; Kaggle Dataset
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              to="/students"
              className="px-4 py-2 rounded-xl bg-emerald hover:bg-emerald-dark text-white text-xs font-bold shadow-md shadow-emerald/20 transition-all flex items-center gap-1.5"
            >
              <span>Manage All Students</span>
              <span>&rarr;</span>
            </Link>
            <Link
              to="/admin/users"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/10 transition-all"
            >
              System Accounts
            </Link>
          </div>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Student Body"
          value={totalStudents}
          subtitle="Enrolled active learners"
          color="emerald"
          trend="100% Data Loaded"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
        />

        <StatCard
          title="Fee Revenue Collected"
          value="Rs. 5.12 Cr"
          subtitle="64.5% clearance rate"
          color="jet"
          trend="Rs. 1.2 Cr Pending"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          }
        />

        <StatCard
          title="Campus Attendance Average"
          value="84.3%"
          subtitle="Across all departments"
          color="emerald"
          trend="88% Meet 75% Requirement"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        <StatCard
          title="Faculty & Staff"
          value="48 Officers"
          subtitle="Profs, Lecturers, TAs"
          color="platinum"
          trend="Teacher:Student Ratio 1:20"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
        />
      </div>

      {/* Visual Data Analytics (Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Branch-Wise Enrollment */}
        <div className="bg-white border border-platinum rounded-2xl p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="font-heading text-base font-bold text-ink">Departmental Student Enrollment</h3>
            <p className="text-xs text-slate">Balanced distribution across 5 core engineering divisions</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branchData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="branch" tick={{ fontSize: 11, fill: "#737373" }} />
                <YAxis tick={{ fontSize: 11, fill: "#737373" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0A0A0A",
                    border: "none",
                    borderRadius: "8px",
                    color: "#FAFAFA",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="count" fill="#10B981" radius={[6, 6, 0, 0]} name="Students" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Fee Collection Breakdown */}
        <div className="bg-white border border-platinum rounded-2xl p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="font-heading text-base font-bold text-ink">Semester Fee Settlement Ratio</h3>
            <p className="text-xs text-slate">Paid, Pending installment, and Overdue dues</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={feeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {feeData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0A0A0A",
                    border: "none",
                    borderRadius: "8px",
                    color: "#FAFAFA",
                    fontSize: "12px",
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Chart 3: Campus-Wide Attendance Spread */}
      <div className="bg-white border border-platinum rounded-2xl p-6 shadow-sm">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-heading text-base font-bold text-ink">Attendance Bracket Distribution</h3>
            <p className="text-xs text-slate">Number of students falling into each attendance bracket</p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-crimson/10 text-crimson border border-crimson/20">
            120 Students Below 75% Cutoff
          </span>
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={attendanceDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="range" tick={{ fontSize: 11, fill: "#737373" }} />
              <YAxis tick={{ fontSize: 11, fill: "#737373" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0A0A0A",
                  border: "none",
                  borderRadius: "8px",
                  color: "#FAFAFA",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="students" radius={[6, 6, 0, 0]} name="Students" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
