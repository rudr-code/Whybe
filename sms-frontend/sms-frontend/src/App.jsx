import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";
import Sidebar from "./components/Sidebar";
import NotificationBell from "./components/NotificationBell";
import { useAuth } from "./context/AuthContext";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Attendance from "./pages/Attendance";
import Notifications from "./pages/Notifications";

// Student Pages
import StudentAttendance from "./pages/student/StudentAttendance";
import StudentMarks from "./pages/student/StudentMarks";
import StudentFees from "./pages/student/StudentFees";
import StudentTimetable from "./pages/student/StudentTimetable";
import StudentMessMenu from "./pages/student/StudentMessMenu";
import StudentNotifications from "./pages/student/StudentNotifications";

// TA Pages
import TAStudents from "./pages/ta/TAStudents";
import TAMarksEntry from "./pages/ta/TAMarksEntry";
import TATimetableEditor from "./pages/ta/TATimetableEditor";
import TAAttendanceRequests from "./pages/ta/TAAttendanceRequests";

// Faculty Pages
import FacultyStudents from "./pages/faculty/FacultyStudents";
import FacultyMarks from "./pages/faculty/FacultyMarks";
import FacultyAttendanceApproval from "./pages/faculty/FacultyAttendanceApproval";

// Exam Cell Pages
import ExamCellSubjects from "./pages/examcell/ExamCellSubjects";
import ExamCellGradeOverride from "./pages/examcell/ExamCellGradeOverride";

// Admin Pages
import AdminUsers from "./pages/admin/AdminUsers";

const Shell = ({ children }) => {
  const { user } = useAuth();
  return (
    <div className="flex min-h-screen bg-paper text-ink font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-platinum bg-white px-6 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate uppercase tracking-wider">
              {user?.role?.replace("_", " ")} Portal
            </span>
            <span className="text-slate/40">&bull;</span>
            <span className="text-xs text-slate truncate font-medium">
              Academic Session 2025–2026
            </span>
          </div>

          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="h-5 w-px bg-platinum hidden sm:block" />
            <div className="hidden sm:flex items-center gap-2 text-xs">
              <span className="font-bold text-ink">{user?.name}</span>
              <span className="text-[10px] uppercase font-bold text-emerald bg-emerald/10 px-2 py-0.5 rounded-full">
                {user?.role}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 p-5 sm:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Primary Role-Aware Dashboard */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Shell><Dashboard /></Shell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Shell><Dashboard /></Shell>
          </ProtectedRoute>
        }
      />

      {/* Student Portal Routes */}
      <Route
        path="/student/attendance"
        element={
          <RoleRoute allowedRoles={["student", "admin"]}>
            <Shell><StudentAttendance /></Shell>
          </RoleRoute>
        }
      />
      <Route
        path="/student/marks"
        element={
          <RoleRoute allowedRoles={["student", "admin"]}>
            <Shell><StudentMarks /></Shell>
          </RoleRoute>
        }
      />
      <Route
        path="/student/fees"
        element={
          <RoleRoute allowedRoles={["student", "admin"]}>
            <Shell><StudentFees /></Shell>
          </RoleRoute>
        }
      />
      <Route
        path="/student/timetable"
        element={
          <RoleRoute allowedRoles={["student", "admin"]}>
            <Shell><StudentTimetable /></Shell>
          </RoleRoute>
        }
      />
      <Route
        path="/student/mess"
        element={
          <RoleRoute allowedRoles={["student", "admin"]}>
            <Shell><StudentMessMenu /></Shell>
          </RoleRoute>
        }
      />
      <Route
        path="/student/notifications"
        element={
          <RoleRoute allowedRoles={["student", "admin"]}>
            <Shell><StudentNotifications /></Shell>
          </RoleRoute>
        }
      />

      {/* TA Routes */}
      <Route
        path="/ta/students"
        element={
          <RoleRoute allowedRoles={["ta", "admin"]}>
            <Shell><TAStudents /></Shell>
          </RoleRoute>
        }
      />
      <Route
        path="/ta/marks"
        element={
          <RoleRoute allowedRoles={["ta", "admin"]}>
            <Shell><TAMarksEntry /></Shell>
          </RoleRoute>
        }
      />
      <Route
        path="/ta/timetable"
        element={
          <RoleRoute allowedRoles={["ta", "admin"]}>
            <Shell><TATimetableEditor /></Shell>
          </RoleRoute>
        }
      />
      <Route
        path="/ta/attendance-requests"
        element={
          <RoleRoute allowedRoles={["ta", "admin"]}>
            <Shell><TAAttendanceRequests /></Shell>
          </RoleRoute>
        }
      />

      {/* Faculty Routes */}
      <Route
        path="/faculty/students"
        element={
          <RoleRoute allowedRoles={["faculty", "admin"]}>
            <Shell><FacultyStudents /></Shell>
          </RoleRoute>
        }
      />
      <Route
        path="/faculty/marks"
        element={
          <RoleRoute allowedRoles={["faculty", "admin"]}>
            <Shell><FacultyMarks /></Shell>
          </RoleRoute>
        }
      />
      <Route
        path="/faculty/attendance-approval"
        element={
          <RoleRoute allowedRoles={["faculty", "admin"]}>
            <Shell><FacultyAttendanceApproval /></Shell>
          </RoleRoute>
        }
      />

      {/* Examination Cell Routes */}
      <Route
        path="/examcell/subjects"
        element={
          <RoleRoute allowedRoles={["exam_cell", "admin"]}>
            <Shell><ExamCellSubjects /></Shell>
          </RoleRoute>
        }
      />
      <Route
        path="/examcell/grade-override"
        element={
          <RoleRoute allowedRoles={["exam_cell", "admin"]}>
            <Shell><ExamCellGradeOverride /></Shell>
          </RoleRoute>
        }
      />

      {/* Administrative & Shared Operations */}
      <Route
        path="/students"
        element={
          <RoleRoute allowedRoles={["admin", "faculty", "ta"]}>
            <Shell><Students /></Shell>
          </RoleRoute>
        }
      />
      <Route
        path="/attendance"
        element={
          <RoleRoute allowedRoles={["admin", "faculty", "ta"]}>
            <Shell><Attendance /></Shell>
          </RoleRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <RoleRoute allowedRoles={["admin"]}>
            <Shell><AdminUsers /></Shell>
          </RoleRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Shell><Notifications /></Shell>
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
