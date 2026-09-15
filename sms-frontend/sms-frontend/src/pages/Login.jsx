import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("admin@sms.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="font-serif text-3xl text-indigo">Campus ERP</div>
          <div className="text-sm text-slate mt-1">Sign in to your dashboard</div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-black/5 rounded-lg p-7">
          {error && (
            <div className="chip chip-overdue mb-4 !inline-block !rounded-md !px-3 !py-2 w-full text-left">
              {error}
            </div>
          )}

          <label className="block text-sm font-medium text-ink mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-black/10 rounded-md px-3 py-2 mb-4 text-sm focus:border-indigo outline-none"
          />

          <label className="block text-sm font-medium text-ink mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border border-black/10 rounded-md px-3 py-2 mb-6 text-sm focus:border-indigo outline-none"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo hover:bg-indigo-light text-white text-sm font-medium py-2.5 rounded-md transition-colors disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <p className="text-xs text-slate mt-4 text-center">
            Demo: admin@sms.com / admin123 (or faculty@sms.com / faculty123)
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
