import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/", label: "Dashboard" },
  { to: "/students", label: "Students" },
  { to: "/attendance", label: "Attendance" },
];

const Sidebar = () => {
  const { user, logout } = useAuth();

  return (
    <aside className="w-60 shrink-0 bg-indigo text-white flex flex-col h-screen sticky top-0">
      <div className="px-6 py-7 border-b border-white/10">
        <div className="font-serif text-xl tracking-tight">Campus ERP</div>
        <div className="text-xs text-white/50 mt-0.5">Student Management</div>
      </div>

      <nav className="flex-1 px-3 py-5 flex flex-col gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-6 py-5 border-t border-white/10">
        <div className="text-sm font-medium">{user?.name}</div>
        <div className="text-xs text-white/50 capitalize mb-3">{user?.role}</div>
        <button
          onClick={logout}
          className="text-xs text-white/70 hover:text-amber underline underline-offset-2"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
