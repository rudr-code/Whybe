import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RoleRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-paper text-ink">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald border-t-transparent"></div>
          <span className="text-sm font-medium text-slate">Loading CampusSync...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
