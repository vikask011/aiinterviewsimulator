import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Loader2, ArrowRight } from "lucide-react";

const Login = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const API_BASE = "http://localhost:5000/api/auth";

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError(""); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await axios.post(`${API_BASE}/login`, form);

      // ✅ STORE AUTH DATA PROPERLY
      localStorage.setItem("token", res.data.token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          name: res.data.name,
          email: res.data.email,
        })
      );

      // Using navigate for better SPA experience, or window.location for full refresh
      window.location.href = "/home";
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans">
      {/* LEFT SIDE: BRANDING/VISUAL */}
      <div className="hidden lg:flex w-1/2 bg-[#0f172a] p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl -ml-20 -mb-20" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-white font-black text-2xl tracking-tighter">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-sm rotate-45" />
            </div>
            AI INTERVIEWER
          </div>
        </div>

        <div className="relative z-10">
          <h1 className="text-5xl font-bold text-white leading-tight mb-6">
            Master your next <br />
            <span className="text-blue-500 underline decoration-blue-500/30 underline-offset-8">career move.</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-md font-medium">
            Join thousands of candidates using our AI to simulate real-world interviews and get instant, actionable feedback.
          </p>
        </div>

        <div className="relative z-10 text-slate-500 text-sm font-medium">
          © 2026 AI Interviewer Inc. • Privacy Policy
        </div>
      </div>

      {/* RIGHT SIDE: LOGIN FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-black text-slate-900 mb-2">Welcome Back</h2>
            <p className="text-slate-500 font-medium">Log in to your account to continue practicing.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-2xl animate-shake">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                <input
                  name="email"
                  type="email"
                  placeholder="name@company.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all outline-none text-slate-900 font-medium placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Password</label>
                <Link to="/forgot-password" size={20} className="text-xs font-bold text-blue-600 hover:text-blue-700">Forgot?</Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                <input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all outline-none text-slate-900 font-medium placeholder:text-slate-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-blue-500/20 transition-all active:scale-[0.98] disabled:bg-slate-300 disabled:shadow-none flex items-center justify-center gap-2 group"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  SIGN IN
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-slate-500 font-medium">
            Don’t have an account?{" "}
            <Link to="/signup" className="text-blue-600 font-black hover:underline underline-offset-4">
              Create one for free
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
      `}</style>
    </div>
  );
};

export default Login;