import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import { API, formatApiErrorDetail } from "@/lib/api";

const publicApi = axios.create({ baseURL: API });

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true); setError("");
    try {
      await publicApi.post("/auth/forgot-password", { email });
      setSubmitted(true);
    } catch (err) {
      setError(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally { setSubmitting(false); }
  };

  if (submitted) {
    return (
      <div className="min-h-screen grid-bg flex items-center justify-center px-6">
        <div className="bg-white border border-black/10 p-10 max-w-lg w-full nx-fade-up" data-testid="forgot-success">
          <CheckCircle2 size={48} className="text-[#0055FF] mb-4" />
          <h1 className="font-display font-black tracking-tighter text-4xl mb-3">Check your inbox.</h1>
          <p className="text-gray-700 mb-6 leading-relaxed">
            If an account exists for <strong>{email}</strong>, we've sent a password reset link.
            The link is valid for <strong>1 hour</strong> and can be used once.
          </p>
          <Link to="/login" className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium hover:bg-black/80">
            <ArrowLeft size={14} /> Back to login
          </Link>
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
        <div className="text-[10px] uppercase tracking-[0.25em] text-gray-500 mb-2">Recover access</div>
        <h1 className="font-display font-black tracking-tighter text-4xl mb-2">Forgot password?</h1>
        <p className="text-sm text-gray-600 mb-8">
          Enter your email — we'll send you a one-time reset link.
        </p>
        <form onSubmit={submit} className="space-y-4" data-testid="forgot-form">
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold mb-1.5 block">Email</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                     className="w-full border border-black/10 pl-9 pr-3 py-3 text-sm focus:border-black outline-none"
                     data-testid="forgot-email-input" />
            </div>
          </div>
          {error && (
            <div className="border border-red-300 bg-red-50 text-red-700 text-sm px-3 py-2" data-testid="forgot-error">
              {error}
            </div>
          )}
          <button type="submit" disabled={submitting}
                  className="w-full bg-black text-white py-3 font-bold hover:bg-black/80 disabled:bg-gray-400"
                  data-testid="forgot-submit-btn">
            {submitting ? "Sending..." : "Send reset link"}
          </button>
        </form>
      </div>
    </div>
  );
}
