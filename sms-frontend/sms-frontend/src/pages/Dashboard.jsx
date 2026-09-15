import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import api from "../api/axios";

const FEE_COLORS = { paid: "#16A34A", pending: "#D97706", overdue: "#DC2626" };

const StatCard = ({ label, value, sub }) => (
  <div className="bg-white border border-black/5 rounded-lg px-6 py-5 flex-1">
    <div className="font-serif text-4xl text-indigo">{value}</div>
    <div className="text-sm text-ink font-medium mt-1">{label}</div>
    {sub && <div className="text-xs text-slate mt-0.5">{sub}</div>}
  </div>
);

const Dashboard = () => {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [studentsRes, attendanceRes] = await Promise.all([
          api.get("/students"),
          api.get("/attendance/summary/all"),
        ]);
        setStudents(studentsRes.data);
        setAttendance(attendanceRes.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const feeCounts = students.reduce(
    (acc, s) => {
      acc[s.feeStatus] = (acc[s.feeStatus] || 0) + 1;
      return acc;
    },
    { paid: 0, pending: 0, overdue: 0 }
  );

  const feeChartData = Object.entries(feeCounts).map(([name, value]) => ({ name, value }));

  const avgAttendance = attendance.length
    ? (attendance.reduce((s, a) => s + a.attendancePercent, 0) / attendance.length).toFixed(1)
    : "—";

  const attendanceChartData = attendance
    .slice()
    .sort((a, b) => a.rollNo.localeCompare(b.rollNo))
    .slice(0, 12)
    .map((a) => ({ name: a.rollNo, percent: a.attendancePercent }));

  if (loading) return <div className="p-8 text-slate text-sm">Loading dashboard...</div>;

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="font-serif text-3xl text-ink mb-1">Dashboard</h1>
      <p className="text-sm text-slate mb-8">Overview across students, attendance and fees</p>

      {error && (
        <div className="chip chip-overdue !inline-block !rounded-md !px-4 !py-2 mb-6">{error}</div>
      )}

      <div className="flex gap-4 mb-8">
        <StatCard label="Total students" value={students.length} />
        <StatCard label="Avg. attendance" value={`${avgAttendance}%`} />
        <StatCard label="Fees overdue" value={feeCounts.overdue} sub={`of ${students.length} students`} />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white border border-black/5 rounded-lg p-6">
          <h2 className="text-sm font-semibold text-ink mb-4">Attendance % by roll no.</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={attendanceChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748B" }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#64748B" }} />
              <Tooltip />
              <Bar dataKey="percent" fill="#1E1B4B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-black/5 rounded-lg p-6">
          <h2 className="text-sm font-semibold text-ink mb-4">Fee status breakdown</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={feeChartData}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
              >
                {feeChartData.map((entry) => (
                  <Cell key={entry.name} fill={FEE_COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
