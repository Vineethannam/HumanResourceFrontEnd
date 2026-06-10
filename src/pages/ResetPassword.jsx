import React, { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Lock, CheckCircle2, AlertCircle } from "lucide-react";
import { API, formatApiErrorDetail } from "@/lib/api";

const publicApi = axios.create({ baseURL: API });

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") || "";

  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!token) {
    return (
      <div className="min-h-screen grid-bg flex items-center justify-center px-6">
        <div className="bg-white border border-black/10 p-10 max-w-lg w-full">
          <AlertCircle size={48} className="text-red-500 mb-4" />
          <h1 className="font-display font-black tracking-tighter text-4xl mb-3">Invalid link.</h1>
          <p className="text-gray-700 mb-6">This reset link is missing required information.</p>
          <Link to="/login" className="px-4 py-2 bg-black text-white text-sm font-medium hover:bg-black/80">Back to login</Link>
        </div>
      </div>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (pwd.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (pwd !== pwd2) { setError("Passwords do not match."); return; }
    setSubmitting(true);
    try {
      await publicApi.post("/auth/reset-password", { token, new_password: pwd });
      setSubmitted(true);
      setTimeout(() => navigate("/login"), 2200);
    } catch (err) {
      setError(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally { setSubmitting(false); }
  };

  if (submitted) {
    return (
      <div className="min-h-screen grid-bg flex items-center justify-center px-6">
        <div className="bg-white border border-black/10 p-10 max-w-lg w-full nx-fade-up" data-testid="reset-success">
          <CheckCircle2 size={48} className="text-[#0055FF] mb-4" />
          <h1 className="font-display font-black tracking-tighter text-4xl mb-3">Password updated.</h1>
          <p className="text-gray-700 mb-6">Redirecting you to the login page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[var(--nx-bg)]">
      <div className="w-full max-w-md">
        <Link to="/login" className="inline-flex items-center gap-2 text-sm font-medium hover:text-[#0055FF] mb-6">
          <ArrowLeft size={14} /> Back to login
        </Link>
        <div className="text-[10px] uppercase tracking-[0.25em] text-gray-500 mb-2">Set new password</div>
        <h1 className="font-display font-black tracking-tighter text-4xl mb-2">Reset password.</h1>
        <p className="text-sm text-gray-600 mb-8">Choose a strong password (min 8 characters).</p>
        <form onSubmit={submit} className="space-y-4" data-testid="reset-form">
          <PasswordField label="New password" value={pwd} onChange={setPwd} testId="reset-pwd-input" />
          <PasswordField label="Confirm new password" value={pwd2} onChange={setPwd2} testId="reset-pwd2-input" />
          {error && <div className="border border-red-300 bg-red-50 text-red-700 text-sm px-3 py-2" data-testid="reset-error">{error}</div>}
          <button type="submit" disabled={submitting}
                  className="w-full bg-black text-white py-3 font-bold hover:bg-black/80 disabled:bg-gray-400"
                  data-testid="reset-submit-btn">
            {submitting ? "Updating..." : "Update password"}
          </button>
        </form>
      </div>
    </div>
  );
}

function PasswordField({ label, value, onChange, testId }) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-widest font-bold mb-1.5 block">{label}</label>
      <div className="relative">
        <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="password" value={value} onChange={(e) => onChange(e.target.value)} required
               className="w-full border border-black/10 pl-9 pr-3 py-3 text-sm focus:border-black outline-none"
               data-testid={testId} />
      </div>
    </div>
  );
}
