
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

// ✅ Public image path
const bgUrl = "/login-bg.png";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);

  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) navigate("/", { replace: true });
  }, [isAuthenticated, navigate]);

  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    try {
      const resp = await fetch(`${API_BASE}/users`);
      if (!resp.ok) {
        setError("Failed to fetch users");
        return;
      }
      const users = await resp.json();
      const user = (users || []).find((u: any) => u.email === email.trim().toLowerCase());

      if (!user) {
        setError("No account found for this email. Please register first.");
        return;
      }

      if (user.password && user.password !== btoa(password)) {
        setError("Invalid credentials");
        return;
      }

      const adminEmail = "pasulamanish0335@gmail.com";
      const isAdmin = email.trim().toLowerCase() === adminEmail;

      login(
        { id: user.id, name: user.name, email: user.email },
        isAdmin
      );

      navigate("/", { replace: true });
    } catch (err) {
      setError("Network error while signing in");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* 🔥 Background Image */}
      <div
        className="absolute inset-0 -z-20"
        style={{
          backgroundImage: `url(${bgUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* Optional overlay */}
      <div className="absolute inset-0 -z-10 bg-black/30" />

      {/* Builder button (top-right) and info panel */}
      <div className="absolute top-4 right-6 z-40">
        <button
          onClick={() => setShowBuilder((s) => !s)}
          className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-full shadow-sm ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          aria-expanded={showBuilder}
          aria-controls="builder-info"
        >
          <span className="text-base">🛠️</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 20v-6" />
            <path d="M20 6L9 17l-5-5" />
          </svg>
          <span className="text-sm font-medium">Builder</span>
        </button>

        {showBuilder && (
          <div id="builder-info" className="mt-3 w-64 bg-white/8 backdrop-blur-md rounded-2xl p-4 text-white shadow-lg border border-white/10">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs text-white/70 uppercase tracking-wide">Builder Name</div>
                <div className="text-sm font-semibold">👨‍💻 Manish Pasula</div>
                <div className="text-sm text-white/70 mt-1">
                  <a href="mailto:pasulamanish0335@gmail.com" className="hover:underline">pasulamanish0335@gmail.com</a>
                </div>
              </div>
              <button onClick={() => setShowBuilder(false)} className="ml-3 text-white/60 hover:text-white focus:outline-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* header removed per request */}

      {/* Card */}
      <div className="relative w-full max-w-lg">
        <div className="mt-16 bg-white/70 backdrop-blur-md rounded-3xl shadow-[0_20px_40px_rgba(2,6,23,0.18)] p-10 border border-white/30 ring-1 ring-white/5">
          <div className="mx-auto mb-6 h-1 rounded-full bg-gradient-to-r from-indigo-400 to-emerald-300 w-32" />

          <div className="text-center mb-6">
            <div className="inline-block px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm font-semibold mb-3">Habit Tracker</div>
            <h1 className="text-4xl font-extrabold mb-3 text-slate-900">Welcome Back!</h1>
          </div>

          {error && (
            <div className="text-sm text-red-600 mb-3">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@company.com"
                className="w-full bg-white/90 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-300 placeholder:text-slate-400 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="w-full bg-white/90 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-300 placeholder:text-slate-400 shadow-sm"
              />
            </div>

            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="bg-gradient-to-r from-indigo-500 to-emerald-400 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-2xl transition-transform transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Sign in
              </button>

              <Link
                to="/register"
                className="inline-flex items-center gap-2 text-sm text-indigo-700 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg ring-1 ring-white/10 transition-shadow shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Create an account
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
