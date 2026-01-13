import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

type User = {
  id: string;
  name: string;
  email: string;
  password?: string;
  createdAt: string;
};

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const API_BASE = import.meta.env.VITE_API_BASE || `${window.location.protocol}//${window.location.hostname}:4000`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const resp = await fetch(`${API_BASE}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase(), password: btoa(password) }),
      });

      if (resp.status === 409) {
        setError("An account with this email already exists. Please login.");
        return;
      }

      if (!resp.ok) {
        const j = await resp.json().catch(() => ({}));
        setError(j.error || "Failed to register user");
        return;
      }

      navigate("/login", { replace: true });
    } catch (err) {
      setError("Network error while registering user");
    }
  };

  // public image path
  const bgUrl = "/image.png";

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-6">
      {/* Background Image */}
      <div
        className="absolute inset-0 -z-20 bg-cover bg-center"
        style={{
          backgroundImage: `url(${bgUrl})`,
        }}
      />

      {/* Optional Soft Overlay */}
      <div className="absolute inset-0 -z-10 bg-black/20" />

      {/* Card */}
      <div className="relative w-full max-w-md">
        {/* Icon */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-28 h-28 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 shadow-2xl flex items-center justify-center ring-6 ring-white/30">
          <span className="text-3xl">✍️</span>
        </div>

        {/* Form */}
        <div className="mt-14 bg-gradient-to-b from-white/80 to-white/70 backdrop-blur-sm rounded-3xl shadow-[0_18px_36px_rgba(2,6,23,0.12)] p-10 border border-white/20">
          <h1 className="text-2xl md:text-3xl font-semibold mb-2 text-slate-900">Create Account</h1>
          <p className="text-sm text-slate-600 mb-6">Sign up to track habits and progress</p>

          {error && (
            <div className="text-sm text-red-600 mb-3">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-white/95 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-300 placeholder:text-slate-400 shadow-sm transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white/95 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-300 placeholder:text-slate-400 shadow-sm transition"
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
                className="w-full bg-white/95 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-300 placeholder:text-slate-400 shadow-sm transition"
              />
            </div>

            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-indigo-600 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-2xl transition-transform transform hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-emerald-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3a1 1 0 00.293.707l2 2a1 1 0 001.414-1.414L11 9.586V7z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Register</span>
              </button>

              <Link
                to="/login"
                className="ml-4 inline-flex items-center gap-2 text-sm text-slate-700 px-3 py-2 rounded-md hover:bg-indigo-50 transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 10a1 1 0 011-1h8.586l-2.293-2.293a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
