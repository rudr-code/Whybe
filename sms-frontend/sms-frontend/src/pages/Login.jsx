import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, DEMO_CREDENTIALS } from "../context/AuthContext";

export default function Login() {
  const [selectedRole, setSelectedRole] = useState("student");
  const [email, setEmail] = useState("aarav.sharma@campussync.edu");
  const [password, setPassword] = useState("2005-03-15");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRoleSelect = (roleKey) => {
    setSelectedRole(roleKey);
    setError("");
    const cred = DEMO_CREDENTIALS.find((c) => c.role === roleKey);
    if (cred) {
      setEmail(cred.email);
      setPassword(cred.password);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const loggedUser = await login(email, password);
      // Route intelligently based on role
      if (loggedUser.role === "student") {
        navigate("/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-4 py-8 relative overflow-hidden">
      {/* Decorative ambient gradients (strictly emerald/jet, NO blue) */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-crimson/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-emerald to-emerald-dark text-white font-heading font-extrabold text-2xl shadow-lg shadow-emerald/25 mb-3">
            CS
          </div>
          <h1 className="font-heading text-3xl font-extrabold text-ink tracking-tight">
            Campus<span className="text-emerald">Sync</span>
          </h1>
          <p className="text-xs text-slate mt-1">
            Enterprise College ERP & Academic Management Portal
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-platinum rounded-2xl p-6 sm:p-8 shadow-xl shadow-jet/5">
          {/* Role selector tabs */}
          <div className="mb-6">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate mb-2">
              Select Your Role / Login Portal
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-paper border border-platinum rounded-xl">
              {[
                { id: "student", label: "Student" },
                { id: "faculty", label: "Faculty" },
                { id: "ta", label: "TA" },
                { id: "exam_cell", label: "Exam Cell" },
                { id: "admin", label: "Admin" },
              ].map((tab) => {
                const isActive = selectedRole === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleRoleSelect(tab.id)}
                    className={`py-2 px-2 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-jet text-white shadow-sm"
                        : "text-slate hover:text-ink hover:bg-white"
                    } ${tab.id === "admin" ? "col-span-2 sm:col-span-1" : ""}`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error notice */}
          {error && (
            <div className="mb-4 p-3 bg-crimson/10 border border-crimson/30 rounded-xl text-xs text-crimson font-medium flex items-start gap-2">
              <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                {selectedRole === "student" ? "Student Institutional Email" : "Staff Email Address"}
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@campussync.edu"
                  className="w-full bg-paper border border-platinum rounded-xl px-3.5 py-2.5 text-xs text-ink placeholder-slate/50 focus:border-emerald focus:ring-2 focus:ring-emerald/20 focus:bg-white outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-ink">
                  {selectedRole === "student" ? "Date of Birth (Password)" : "Password"}
                </label>
                {selectedRole === "student" && (
                  <span className="text-[10px] text-emerald font-medium bg-emerald/10 px-2 py-0.5 rounded-md">
                    Format: YYYY-MM-DD
                  </span>
                )}
              </div>
              <input
                type={selectedRole === "student" ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder={selectedRole === "student" ? "2005-03-15" : "••••••••"}
                className="w-full bg-paper border border-platinum rounded-xl px-3.5 py-2.5 text-xs text-ink placeholder-slate/50 focus:border-emerald focus:ring-2 focus:ring-emerald/20 focus:bg-white outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald hover:bg-emerald-dark text-white text-xs font-bold py-3 rounded-xl shadow-md shadow-emerald/25 hover:shadow-emerald/40 transition-all duration-150 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In as {selectedRole.replace("_", " ").toUpperCase()}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Switcher */}
          <div className="mt-6 pt-5 border-t border-platinum">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate mb-2 text-center">
              Quick One-Click Demo Logins
            </div>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {DEMO_CREDENTIALS.map((cred) => (
                <button
                  key={cred.role}
                  type="button"
                  onClick={() => handleRoleSelect(cred.role)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                    selectedRole === cred.role
                      ? "bg-emerald/10 border-emerald text-emerald font-semibold"
                      : "bg-paper border-platinum text-slate hover:text-ink hover:border-slate/40"
                  }`}
                  title={`${cred.desc}\nEmail: ${cred.email}\nPass: ${cred.password}`}
                >
                  {cred.roleName}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-slate mt-4">
          Powered by Kaggle Student Exam Analytics Data &middot; CampusSync 2026
        </p>
      </div>
    </div>
  );
}
