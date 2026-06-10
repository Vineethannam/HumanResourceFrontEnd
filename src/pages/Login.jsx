import React, { useState } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { formatApiErrorDetail } from "@/lib/api";

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/admin/dashboard" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--nx-bg)] flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-black text-white p-12 relative overflow-hidden">
        <div>
          <Link to="/" className="inline-flex items-center gap-2 text-sm hover:text-[#0055FF] transition-colors">
            <ArrowLeft size={16} /> Back to site
          </Link>
        </div>
        <div className="relative z-10">
          <div className="font-display font-black tracking-tighter text-7xl leading-[0.9] mb-6">
            NEXUS<span className="text-[#0055FF]">.</span>
          </div>
          <p className="text-gray-400 max-w-md leading-relaxed">
            Your single source of truth for talent. Log in to manage the hiring pipeline and active workforce.
          </p>
        </div>
        <div className="text-xs text-gray-500 font-mono uppercase tracking-widest">
          Hiring CRM & HRM · Admin Console
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none">
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/3 w-[600px] h-[600px] bg-[#0055FF] opacity-10 rounded-full blur-3xl" />
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden font-display font-black tracking-tighter text-3xl mb-8">
            NEXUS<span className="text-[#0055FF]">.</span>
          </div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-gray-500 mb-3">
            Admin Console
          </div>
          <h1 className="font-display font-black tracking-tighter text-4xl mb-2">Sign in</h1>
          <p className="text-sm text-gray-600 mb-8">
            Use your admin credentials to enter.
          </p>

          <form onSubmit={submit} className="space-y-4" data-testid="login-form">
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-gray-700 mb-1.5 block">
                Email
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-black/10 bg-white px-3 py-3 text-sm focus:border-black outline-none transition-colors"
                data-testid="login-email-input"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-700">
                  Password
                </label>
                <Link to="/forgot-password" className="text-[11px] font-medium hover:text-[#0055FF]"
                      data-testid="forgot-link">
                  Forgot password?
                </Link>
              </div>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-black/10 bg-white px-3 py-3 text-sm focus:border-black outline-none transition-colors"
                data-testid="login-password-input"
              />
            </div>

            {error && (
              <div className="border border-red-300 bg-red-50 text-red-700 text-sm px-3 py-2" data-testid="login-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-black text-white py-3 font-bold hover:bg-black/80 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400"
              data-testid="login-submit-btn"
            >
              {submitting ? "Signing in..." : "Sign in"} <ArrowRight size={16} />
            </button>
          </form>

          <div className="mt-8 border-t border-black/10 pt-6">
            <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">Demo credentials</div>
            <div className="font-mono text-xs text-gray-600 leading-relaxed">
              admin@hiringcrm.com<br />Admin@123
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
