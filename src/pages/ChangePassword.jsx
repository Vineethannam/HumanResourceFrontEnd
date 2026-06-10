import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, CheckCircle2, ArrowRight } from "lucide-react";
import { api, formatApiErrorDetail } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

/**
 * Change password page. Used for:
 * - First login when must_change_password = true (no current_password required)
 * - Normal change from profile menu (current_password required)
 */
export default function ChangePassword() {
  const navigate = useNavigate();
  const { user, refresh } = useAuth();
  const forced = !!user?.must_change_password;

  const [current, setCurrent] = useState("");
  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (pwd.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (pwd !== pwd2) { setError("Passwords do not match."); return; }
    setSubmitting(true);
    try {
      const payload = { new_password: pwd };
      if (!forced) payload.current_password = current;
      await api.post("/auth/change-password", payload);
      setDone(true);
      await refresh();
      toast.success("Password updated");
      setTimeout(() => navigate("/admin/dashboard"), 1500);
    } catch (err) {
      setError(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally { setSubmitting(false); }
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-[var(--nx-bg)]">
        <div className="bg-white border border-black/10 p-10 max-w-lg w-full nx-fade-up" data-testid="change-pwd-success">
          <CheckCircle2 size={48} className="text-[#0055FF] mb-4" />
          <h1 className="font-display font-black tracking-tighter text-4xl mb-3">Password updated.</h1>
          <p className="text-gray-700">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[var(--nx-bg)]" data-testid="change-password-page">
      <div className="w-full max-w-md">
        <div className="text-[10px] uppercase tracking-[0.25em] text-gray-500 mb-2">
          {forced ? "First sign-in" : "Account security"}
        </div>
        <h1 className="font-display font-black tracking-tighter text-4xl mb-2">
          {forced ? "Set your password." : "Change password."}
        </h1>
        <p className="text-sm text-gray-600 mb-8">
          {forced
            ? "For your security, please replace the temporary password you received via email."
            : "Choose a strong password — at least 8 characters."}
        </p>
        <form onSubmit={submit} className="space-y-4" data-testid="change-pwd-form">
          {!forced && (
            <Field label="Current password">
              <Pwd value={current} onChange={setCurrent} testId="change-pwd-current" />
            </Field>
          )}
          <Field label="New password">
            <Pwd value={pwd} onChange={setPwd} testId="change-pwd-new" />
          </Field>
          <Field label="Confirm new password">
            <Pwd value={pwd2} onChange={setPwd2} testId="change-pwd-confirm" />
          </Field>
          {error && <div className="border border-red-300 bg-red-50 text-red-700 text-sm px-3 py-2" data-testid="change-pwd-error">{error}</div>}
          <button type="submit" disabled={submitting}
                  className="w-full bg-black text-white py-3 font-bold hover:bg-black/80 disabled:bg-gray-400 flex items-center justify-center gap-2"
                  data-testid="change-pwd-submit-btn">
            {submitting ? "Updating..." : "Update password"} <ArrowRight size={14} />
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-widest font-bold mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}

function Pwd({ value, onChange, testId }) {
  return (
    <div className="relative">
      <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input type="password" value={value} required onChange={(e) => onChange(e.target.value)}
             className="w-full border border-black/10 pl-9 pr-3 py-3 text-sm focus:border-black outline-none"
             data-testid={testId} />
    </div>
  );
}
