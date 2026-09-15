import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const role = user?.role || "student";

  // Navigation menus customized strictly per role
  const getNavItems = () => {
    switch (role) {
      case "student":
        return [
          { to: "/dashboard", label: "Dashboard", icon: "grid" },
          { to: "/student/attendance", label: "My Attendance", icon: "check" },
          { to: "/student/marks", label: "Marks & Grades", icon: "award" },
          { to: "/student/fees", label: "Fee Status", icon: "credit-card" },
          { to: "/student/timetable", label: "Class Timetable", icon: "calendar" },
          { to: "/student/mess", label: "Hostel Mess Menu", icon: "coffee" },
          { to: "/student/notifications", label: "Notifications & Requests", icon: "bell" },
        ];
      case "ta":
        return [
          { to: "/dashboard", label: "Dashboard", icon: "grid" },
          { to: "/ta/students", label: "Students Directory", icon: "users" },
          { to: "/ta/marks", label: "Marks Entry", icon: "edit" },
          { to: "/ta/timetable", label: "Timetable Editor", icon: "calendar" },
          { to: "/ta/attendance-requests", label: "Attendance Requests", icon: "inbox" },
          { to: "/notifications", label: "Announcements", icon: "bell" },
        ];
      case "faculty":
        return [
          { to: "/dashboard", label: "Faculty Dashboard", icon: "grid" },
          { to: "/faculty/students", label: "Student Inspector", icon: "user-check" },
          { to: "/faculty/marks", label: "Grading & Marks", icon: "award" },
          { to: "/faculty/attendance-approval", label: "Attendance Approvals", icon: "clipboard-check" },
          { to: "/notifications", label: "Announcements", icon: "bell" },
        ];
      case "exam_cell":
        return [
          { to: "/dashboard", label: "Exam Cell Overview", icon: "grid" },
          { to: "/examcell/subjects", label: "Course Subjects", icon: "book" },
          { to: "/examcell/grade-override", label: "Grade Overrides", icon: "sliders" },
          { to: "/notifications", label: "Circulars", icon: "bell" },
        ];
      case "admin":
      default:
        return [
          { to: "/dashboard", label: "Overview & Analytics", icon: "grid" },
          { to: "/students", label: "Student Management", icon: "users" },
          { to: "/attendance", label: "Attendance Audit", icon: "check" },
          { to: "/examcell/subjects", label: "Academic Subjects", icon: "book" },
          { to: "/ta/timetable", label: "Timetable Schedule", icon: "calendar" },
          { to: "/admin/users", label: "System Accounts", icon: "shield" },
          { to: "/notifications", label: "Broadcasts", icon: "bell" },
        ];
    }
  };

  const navItems = getNavItems();

  const renderIcon = (type) => {
    switch (type) {
      case "grid":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        );
      case "users":
      case "user-check":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
      case "check":
      case "clipboard-check":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        );
      case "award":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        );
      case "credit-card":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        );
      case "calendar":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case "coffee":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
          </svg>
        );
      case "bell":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        );
      case "edit":
      case "sliders":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        );
      case "book":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      case "shield":
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      case "inbox":
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        );
    }
  };

  const getRoleBadge = () => {
    switch (role) {
      case "admin":
        return "bg-crimson/20 text-crimson-light border border-crimson/30";
      case "faculty":
        return "bg-emerald/20 text-emerald-light border border-emerald/30";
      case "ta":
        return "bg-platinum/20 text-platinum border border-platinum/30";
      case "exam_cell":
        return "bg-amber-500/20 text-amber-300 border border-amber-500/30";
      case "student":
      default:
        return "bg-emerald/20 text-emerald-light border border-emerald/30";
    }
  };

  return (
    <aside className="w-64 shrink-0 bg-jet text-white flex flex-col h-screen sticky top-0 border-r border-jet-light select-none z-30">
      {/* Brand Header */}
      <div className="px-5 py-5 border-b border-jet-light flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald to-emerald-dark flex items-center justify-center font-bold text-white shadow-md shadow-emerald/20">
          CS
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-heading text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
            Campus<span className="text-emerald">Sync</span>
          </div>
          <div className="text-[11px] text-platinum-dim truncate font-mono">
            College ERP System
          </div>
        </div>
      </div>

      {/* Role Notice */}
      <div className="px-4 py-3 bg-jet-dark/60 border-b border-jet-light/60 flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wider text-slate font-medium">Logged in role</span>
        <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full ${getRoleBadge()}`}>
          {role.replace("_", " ")}
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                isActive
                  ? "bg-emerald text-white shadow-sm shadow-emerald/30 font-semibold"
                  : "text-platinum-light hover:text-white hover:bg-jet-light/70"
              }`
            }
          >
            {renderIcon(item.icon)}
            <span className="truncate">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-jet-light bg-jet-dark/40">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-jet-light border border-jet flex items-center justify-center text-xs font-bold text-emerald">
            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-white truncate">{user?.name || "Campus User"}</div>
            <div className="text-[11px] text-platinum-dim truncate">{user?.email}</div>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium text-crimson-light hover:text-white hover:bg-crimson/20 border border-crimson/20 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
