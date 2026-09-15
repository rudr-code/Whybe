import { useAuth } from "../context/AuthContext";
import StudentDashboard from "./student/StudentDashboard";
import TADashboard from "./ta/TADashboard";
import FacultyDashboard from "./faculty/FacultyDashboard";
import ExamCellDashboard from "./examcell/ExamCellDashboard";
import AdminDashboard from "./admin/AdminDashboard";

export default function Dashboard() {
  const { user } = useAuth();
  const role = user?.role || "student";

  switch (role) {
    case "student":
      return <StudentDashboard />;
    case "ta":
      return <TADashboard />;
    case "faculty":
      return <FacultyDashboard />;
    case "exam_cell":
      return <ExamCellDashboard />;
    case "admin":
    default:
      return <AdminDashboard />;
  }
}
