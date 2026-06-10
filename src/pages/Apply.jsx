import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { CheckCircle2, ArrowLeft, Upload, X, AlertCircle } from "lucide-react";
import axios from "axios";
import { api, formatApiErrorDetail, API } from "@/lib/api";
import { toast } from "sonner";

const publicApi = axios.create({ baseURL: API });

export default function Apply() {
  const navigate = useNavigate();
  const { token } = useParams();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [validating, setValidating] = useState(true);
  const [inviteValid, setInviteValid] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteLabel, setInviteLabel] = useState("");

  const [techStacks, setTechStacks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [techSearch, setTechSearch] = useState("");

  const [form, setForm] = useState({
    full_name: "", email: "", phone: "", current_location: "",
    is_tech: true, tech_stack: [], category: "",
    resume_base64: null, resume_filename: null, notes: "",
  });

  useEffect(() => {
    (async () => {
      try {
        const { data } = await publicApi.get(`/public/invite/${token}`);
        setInviteValid(true);
        setInviteLabel(data.label || "");
      } catch (e) {
        setInviteError(formatApiErrorDetail(e.response?.data?.detail) || "Invalid invitation link");
      } finally { setValidating(false); }
    })();
  }, [token]);

  useEffect(() => {
    if (!inviteValid) return;
    (async () => {
      try {
        const { data } = await publicApi.get(`/public/tech-stacks${techSearch ? `?q=${encodeURIComponent(techSearch)}` : ""}`);
        setTechStacks(data.tech_stacks); setCategories(data.categories);
      } catch { /* ignore */ }
    })();
  }, [inviteValid, techSearch]);

  const toggleTech = (name) => {
    setForm((f) => ({
      ...f,
      tech_stack: f.tech_stack.includes(name)
        ? f.tech_stack.filter((t) => t !== name)
        : [...f.tech_stack, name],
    }));
  };

  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("File must be under 5MB"); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = String(reader.result).split(",")[1];
      setForm({ ...form, resume_base64: base64, resume_filename: file.name });
    };
    reader.readAsDataURL(file);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await publicApi.post(`/public/apply/${token}`, form);
      setSubmitted(true);
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail));
    } finally { setSubmitting(false); }
  };

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="font-mono text-xs uppercase tracking-widest text-gray-500">Verifying invitation...</div>
      </div>
    );
  }

  if (!inviteValid) {
    return (
      <div className="min-h-screen grid-bg flex items-center justify-center px-6">
        <div className="bg-white border border-black/10 p-10 max-w-lg w-full nx-fade-up" data-testid="invite-invalid">
          <AlertCircle size={48} className="text-red-500 mb-4" />
          <h1 className="font-display font-black tracking-tighter text-4xl mb-3">Invitation unavailable</h1>
          <p className="text-gray-700 mb-6 leading-relaxed">{inviteError}</p>
          <Link to="/" className="px-4 py-2 border border-black/20 text-sm font-medium hover:border-black inline-block">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen grid-bg flex items-center justify-center px-6">
        <div className="bg-white border border-black/10 p-10 max-w-lg w-full nx-fade-up" data-testid="apply-success">
          <CheckCircle2 size={48} className="text-[#0055FF] mb-4" />
          <h1 className="font-display font-black tracking-tighter text-4xl mb-3">Application received.</h1>
          <p className="text-gray-700 mb-6 leading-relaxed">
            Thanks <span className="font-semibold">{form.full_name}</span>. Our team will review your profile and reach out soon.
            <br /><br />
            <span className="text-xs text-gray-500 font-mono">This invitation has been consumed and cannot be reused.</span>
          </p>
          <Link to="/" className="px-4 py-2 border border-black/20 text-sm font-medium hover:border-black inline-block">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  const filteredStacks = techStacks; // already filtered server-side via techSearch
  const grouped = categories.map((c) => ({
    category: c,
    stacks: filteredStacks.filter((t) => t.category_id === c.id),
  }));

  return (
    <div className="min-h-screen bg-[var(--nx-bg)]">
      <div className="border-b border-black/10 bg-white">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => navigate("/")}
                  className="inline-flex items-center gap-2 text-sm font-medium hover:text-[#0055FF]"
                  data-testid="back-home-btn">
            <ArrowLeft size={16} /> Back
          </button>
          <div className="font-display font-black tracking-tighter text-xl">
            NEXUS<span className="text-[#0055FF]">.</span>
          </div>
          <div className="w-16" />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="text-[10px] uppercase tracking-[0.25em] text-gray-500 mb-3">Private invitation</div>
        <h1 className="font-display font-black tracking-tighter text-4xl sm:text-5xl mb-2">
          You're invited to apply.
        </h1>
        {inviteLabel && (
          <div className="text-sm text-gray-600 mb-2">Role: <span className="font-semibold">{inviteLabel}</span></div>
        )}
        <p className="text-gray-600 mb-10">
          This invitation is single-use. Please complete it fully.
        </p>

        <form onSubmit={submit} className="space-y-6" data-testid="apply-form">
          <Row>
            <Field label="Full name" required>
              <Input value={form.full_name} onChange={(v) => setForm({ ...form, full_name: v })}
                     required data-testid="apply-fullname" />
            </Field>
            <Field label="Email" required>
              <Input type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })}
                     required data-testid="apply-email" />
            </Field>
          </Row>
          <Row>
            <Field label="Phone" required>
              <Input value={form.phone} onChange={(v) => setForm({ ...form, phone: v })}
                     required data-testid="apply-phone" />
            </Field>
            <Field label="Current location" required>
              <Input value={form.current_location} onChange={(v) => setForm({ ...form, current_location: v })}
                     placeholder="City, Country" required data-testid="apply-location" />
            </Field>
          </Row>

          <Field label="Role type" required>
            <div className="flex gap-2">
              <button type="button" onClick={() => setForm({ ...form, is_tech: true })}
                      className={`flex-1 px-4 py-3 text-sm font-medium border transition-all ${form.is_tech ? "bg-black text-white border-black" : "bg-white border-black/10 hover:border-black"}`}
                      data-testid="apply-tech-btn">Tech / Engineering</button>
              <button type="button" onClick={() => setForm({ ...form, is_tech: false })}
                      className={`flex-1 px-4 py-3 text-sm font-medium border transition-all ${!form.is_tech ? "bg-black text-white border-black" : "bg-white border-black/10 hover:border-black"}`}
                      data-testid="apply-nontech-btn">Non-tech</button>
            </div>
          </Field>

          {form.is_tech && categories.length > 0 && (
            <Field label="Category">
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full border border-black/10 bg-white px-3 py-2 text-sm focus:border-black outline-none"
                      data-testid="apply-category-select">
                <option value="">Select category</option>
                {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </Field>
          )}

          {form.is_tech && (
            <Field label="Tech stack">
              <input value={techSearch} onChange={(e) => setTechSearch(e.target.value)}
                     placeholder="Search tech stacks..."
                     className="w-full border border-black/10 px-3 py-2 text-sm focus:border-black outline-none mb-3"
                     data-testid="apply-tech-search" />
              {form.tech_stack.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {form.tech_stack.map((t) => (
                    <span key={t} onClick={() => toggleTech(t)}
                          className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-black text-white cursor-pointer">
                      {t} <X size={10} />
                    </span>
                  ))}
                </div>
              )}
              {techStacks.length === 0 ? (
                <div className="text-xs text-gray-400 italic px-3 py-3 border border-dashed border-black/10">
                  No tech stacks configured yet by admin.
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto border border-black/10 p-3">
                  {grouped.filter(g => g.stacks.length > 0).map(({ category, stacks }) => (
                    <div key={category.id}>
                      <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1.5">
                        {category.name}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {stacks.map((t) => (
                          <button key={t.id} type="button" onClick={() => toggleTech(t.name)}
                                  className={`text-xs px-2.5 py-1 border transition-all ${
                                    form.tech_stack.includes(t.name)
                                      ? "bg-black text-white border-black"
                                      : "bg-white border-black/10 hover:border-black"
                                  }`}>
                            {t.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Field>
          )}

          <Field label="Resume (PDF, under 5MB)">
            <div className="border border-dashed border-black/20 p-6 hover:border-black transition-colors bg-white">
              {form.resume_filename ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Upload size={16} />
                    <span className="font-mono truncate">{form.resume_filename}</span>
                  </div>
                  <button type="button"
                          onClick={() => setForm({ ...form, resume_base64: null, resume_filename: null })}
                          className="text-xs text-gray-500 hover:text-red-500">Remove</button>
                </div>
              ) : (
                <label className="flex flex-col items-center gap-2 cursor-pointer">
                  <Upload size={24} className="text-gray-400" />
                  <span className="text-sm text-gray-500">Click to upload PDF</span>
                  <input type="file" accept="application/pdf" onChange={onFile} className="hidden"
                         data-testid="apply-resume-input" />
                </label>
              )}
            </div>
          </Field>

          <Field label="Anything else?">
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      rows={3} className="w-full border border-black/10 bg-white px-3 py-2 text-sm focus:border-black outline-none resize-none"
                      placeholder="Portfolio links, cover note, etc." data-testid="apply-notes" />
          </Field>

          <button type="submit" disabled={submitting}
                  className="w-full bg-[#0055FF] text-white py-4 font-bold tracking-wide hover:bg-[#0044cc] disabled:bg-gray-400"
                  data-testid="apply-submit-btn">
            {submitting ? "Submitting..." : "Submit application"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Row({ children }) { return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>; }
function Field({ label, required, children }) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-widest font-bold text-gray-700 mb-1.5 block">
        {label} {required && <span className="text-[#0055FF]">*</span>}
      </label>
      {children}
    </div>
  );
}
function Input({ value, onChange, type = "text", required, placeholder, "data-testid": testId }) {
  return <input type={type} value={value} placeholder={placeholder}
                onChange={(e) => onChange(e.target.value)} required={required} data-testid={testId}
                className="w-full border border-black/10 bg-white px-3 py-2 text-sm focus:border-black outline-none" />;
}
