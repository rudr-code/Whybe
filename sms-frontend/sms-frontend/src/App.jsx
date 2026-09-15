import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Attendance from "./pages/Attendance";

const Shell = ({ children }) => (
  <div className="flex">
    <Sidebar />
    <main className="flex-1 min-h-screen bg-paper">{children}</main>
  </div>
);

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Shell><Dashboard /></Shell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/students"
        element={
          <ProtectedRoute>
            <Shell><Students /></Shell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/attendance"
        element={
          <ProtectedRoute>
            <Shell><Attendance /></Shell>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
