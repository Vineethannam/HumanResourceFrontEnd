import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft, Star, FileText, Download, UserPlus, Trash2,
  Clock, Mail, Phone, MapPin, Calendar, History as HistoryIcon,
} from "lucide-react";
import AppShell from "@/components/AppShell";
import GateKeeper from "@/components/GateKeeper";
import { api, formatApiErrorDetail } from "@/lib/api";
import { usePermission } from "@/lib/permissions";
import { toast } from "sonner";

const STATUS_OPTIONS = ["APPLIED", "INTERVIEWING", "OFFERED", "HIRED", "REJECTED"];
const STATUS_COLORS = {
  APPLIED: "#e5e7eb", INTERVIEWING: "#bfdbfe", OFFERED: "#fde68a",
  HIRED: "#bbf7d0", REJECTED: "#fecaca",
};
const DEPT_OPTIONS = ["TECH", "OPS", "HR", "SALES"];

export default function CandidateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [notes, setNotes] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(7);
  const [showOnboard, setShowOnboard] = useState(false);
  const [onboardForm, setOnboardForm] = useState({
    emp_id_code: "", designation: "", department: "TECH",
    joining_date: new Date().toISOString().slice(0, 10), salary_details: "",
  });

  const load = async () => {
    setLoading(true);
    try {
      const [c, n, h] = await Promise.all([
        api.get(`/candidates/${id}`),
        api.get(`/interviews/notes?candidate_id=${id}`),
        api.get(`/candidates/${id}/history`),
      ]);
      setCandidate(c.data); setNotes(n.data); setHistory(h.data);
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail));
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const changeStatus = async (status) => {
    try {
      await api.patch(`/candidates/${id}/status`, { status });
      toast.success(`Status → ${status}`);
      load();
    } catch (e) { toast.error(formatApiErrorDetail(e.response?.data?.detail)); }
  };

  const addNote = async () => {
    if (!feedback.trim()) return;
    try {
      await api.post(`/interviews/notes`, { candidate_id: id, feedback, score: Number(score) });
      setFeedback(""); setScore(7);
      toast.success("Note added");
      load();
    } catch (e) { toast.error(formatApiErrorDetail(e.response?.data?.detail)); }
  };

  const onboard = async () => {
    try {
      await api.post(`/hr/onboard`, { candidate_id: id, ...onboardForm });
      toast.success("Onboarded as employee");
      load();
      setShowOnboard(false);
    } catch (e) { toast.error(formatApiErrorDetail(e.response?.data?.detail)); }
  };

  const deleteCandidate = async () => {
    if (!window.confirm("Delete this candidate permanently?")) return;
    try {
      await api.delete(`/candidates/${id}`);
      toast.success("Deleted");
      navigate("/admin/candidates");
    } catch (e) { toast.error(formatApiErrorDetail(e.response?.data?.detail)); }
  };

  if (loading || !candidate) {
    return (
      <AppShell>
        <div className="max-w-[1400px] mx-auto px-6 py-10 font-mono text-xs text-gray-500">Loading...</div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-[1400px] mx-auto px-6 py-8" data-testid="candidate-detail-page">
        <button onClick={() => navigate("/admin/candidates")}
                className="inline-flex items-center gap-2 text-sm font-medium hover:text-[#0055FF] mb-6"
                data-testid="back-to-candidates-btn">
          <ArrowLeft size={16} /> Back to candidates
        </button>

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8 pb-6 border-b border-black/10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] uppercase tracking-[0.25em] text-gray-500">Candidate</span>
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5"
                    style={{ backgroundColor: STATUS_COLORS[candidate.status] }}>
                {candidate.status}
              </span>
              {candidate.is_tech && (
                <span className="text-[10px] font-bold px-2 py-0.5 bg-black text-white uppercase">Tech</span>
              )}
            </div>
            <h1 className="font-display font-black tracking-tighter text-4xl sm:text-5xl mb-3">
              {candidate.full_name}
            </h1>
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-600">
              <span className="inline-flex items-center gap-1.5"><Mail size={14} /> {candidate.email}</span>
              <span className="inline-flex items-center gap-1.5"><Phone size={14} /> {candidate.phone}</span>
              <span className="inline-flex items-center gap-1.5"><MapPin size={14} /> {candidate.current_location}</span>
              <span className="inline-flex items-center gap-1.5 font-mono"><Calendar size={14} /> {new Date(candidate.application_date).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex gap-2">
            {!showOnboard && (
              <>
                <GateKeeper module="employees" action="create">
                  <button onClick={() => setShowOnboard(true)} disabled={candidate.status === "HIRED"}
                          className="bg-[#0055FF] text-white px-4 py-2.5 font-bold text-sm hover:bg-[#0044cc] transition-all flex items-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
                          data-testid="promote-employee-btn">
                    <UserPlus size={16} /> Promote to Employee
                  </button>
                </GateKeeper>
                <GateKeeper module="candidates" action="delete">
                  <button onClick={deleteCandidate}
                          className="p-2.5 border border-black/10 hover:border-red-500 hover:text-red-500"
                          data-testid="delete-candidate-btn">
                    <Trash2 size={16} />
                  </button>
                </GateKeeper>
              </>
            )}
          </div>
        </div>

        {/* Onboard form */}
        {showOnboard && (
          <div className="border border-[#0055FF] p-6 bg-white mb-8" data-testid="onboard-form">
            <div className="text-sm font-bold text-[#0055FF] uppercase tracking-widest mb-4">Onboard as Employee</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <input placeholder="Employee ID (e.g. NX-001)" value={onboardForm.emp_id_code}
                     onChange={(e) => setOnboardForm({ ...onboardForm, emp_id_code: e.target.value })}
                     className="border border-black/10 px-3 py-2 text-sm focus:border-black outline-none"
                     data-testid="onboard-empid-input" />
              <input placeholder="Designation" value={onboardForm.designation}
                     onChange={(e) => setOnboardForm({ ...onboardForm, designation: e.target.value })}
                     className="border border-black/10 px-3 py-2 text-sm focus:border-black outline-none"
                     data-testid="onboard-designation-input" />
              <select value={onboardForm.department}
                      onChange={(e) => setOnboardForm({ ...onboardForm, department: e.target.value })}
                      className="border border-black/10 px-3 py-2 text-sm focus:border-black outline-none bg-white"
                      data-testid="onboard-department-select">
                {DEPT_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <input type="date" value={onboardForm.joining_date}
                     onChange={(e) => setOnboardForm({ ...onboardForm, joining_date: e.target.value })}
                     className="border border-black/10 px-3 py-2 text-sm focus:border-black outline-none" />
              <input placeholder="Salary details" value={onboardForm.salary_details}
                     onChange={(e) => setOnboardForm({ ...onboardForm, salary_details: e.target.value })}
                     className="border border-black/10 px-3 py-2 text-sm focus:border-black outline-none sm:col-span-2" />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={onboard} disabled={!onboardForm.emp_id_code || !onboardForm.designation}
                      className="bg-[#0055FF] text-white px-4 py-2 text-sm font-bold hover:bg-[#0044cc] disabled:bg-gray-300"
                      data-testid="onboard-confirm-btn">
                Confirm & Create Employee
              </button>
              <button onClick={() => setShowOnboard(false)}
                      className="px-4 py-2 text-sm border border-black/10 hover:border-black">Cancel</button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: main details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tech stack */}
            <Section title="Profile">
              <div className="grid grid-cols-2 gap-px bg-black/10 border border-black/10">
                <KV label="Type" value={candidate.is_tech ? "Tech / Engineering" : "Non-tech"} />
                <KV label="Category" value={candidate.category || "—"} />
                <KV label="Email" value={candidate.email} />
                <KV label="Phone" value={candidate.phone} />
                <KV label="Location" value={candidate.current_location} />
                <KV label="Applied on" value={new Date(candidate.application_date).toLocaleDateString()} mono />
              </div>
              {candidate.tech_stack?.length > 0 && (
                <div className="mt-4">
                  <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">Tech stack</div>
                  <div className="flex flex-wrap gap-1.5">
                    {candidate.tech_stack.map((t) => (
                      <span key={t} className="text-xs px-2 py-1 bg-black text-white">{t}</span>
                    ))}
                  </div>
                </div>
              )}
              {candidate.notes && (
                <div className="mt-4">
                  <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">Additional notes from candidate</div>
                  <div className="text-sm bg-[#f7f7f8] border border-black/10 p-3">{candidate.notes}</div>
                </div>
              )}
            </Section>

            {/* Status pipeline */}
            <Section title="Move in Pipeline">
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((s) => (
                  <button key={s} onClick={() => changeStatus(s)}
                          className={`text-xs font-medium px-3 py-1.5 border transition-all ${
                            candidate.status === s ? "bg-black text-white border-black" : "bg-white border-black/10 hover:border-black"
                          }`}
                          data-testid={`status-btn-${s.toLowerCase()}`}>
                    {s}
                  </button>
                ))}
              </div>
            </Section>

            {/* Resume */}
            <Section title="Resume">
              {candidate.resume_base64 ? (
                <div className="border border-black/10">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-black/10 bg-[#f7f7f8]">
                    <span className="text-xs font-mono truncate inline-flex items-center gap-2">
                      <FileText size={12} /> {candidate.resume_filename || "resume.pdf"}
                    </span>
                    <a href={`data:application/pdf;base64,${candidate.resume_base64}`}
                       download={candidate.resume_filename || "resume.pdf"}
                       className="text-xs flex items-center gap-1 hover:underline" data-testid="resume-download-btn">
                      <Download size={12} /> Download
                    </a>
                  </div>
                  <iframe title="Resume" src={`data:application/pdf;base64,${candidate.resume_base64}`}
                          className="w-full h-[520px] bg-white" data-testid="resume-iframe" />
                </div>
              ) : (
                <div className="text-sm text-gray-400 italic border border-dashed border-black/10 p-6 text-center">
                  No resume uploaded
                </div>
              )}
            </Section>

            {/* Interview notes */}
            <Section title={`Interview Notes (${notes.length})`}>
              <div className="border border-black/10 p-4 bg-[#f7f7f8] space-y-3">
                <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)}
                          placeholder="Write feedback..."
                          className="w-full border border-black/10 bg-white px-3 py-2 text-sm focus:border-black outline-none resize-none"
                          rows={3} data-testid="feedback-textarea" />
                <div className="flex items-center gap-3 flex-wrap">
                  <label className="text-xs font-medium">Score:</label>
                  <div className="flex items-center gap-1">
                    {[...Array(10)].map((_, i) => (
                      <button key={i} onClick={() => setScore(i + 1)}
                              className={`w-6 h-6 text-xs border transition-all ${
                                i + 1 <= score ? "bg-[#0055FF] text-white border-[#0055FF]" : "bg-white border-black/10 hover:border-black/40"
                              }`}
                              data-testid={`score-btn-${i + 1}`}>
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button onClick={addNote}
                          className="ml-auto bg-black text-white px-4 py-2 text-xs font-medium hover:bg-black/80"
                          data-testid="add-note-btn">
                    Add Note
                  </button>
                </div>
              </div>
              <div className="mt-3 space-y-2">
                {notes.map((n) => (
                  <div key={n.id} className="border border-black/10 p-3 bg-white" data-testid={`note-${n.id}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium">{n.interviewer_name}</span>
                      <span className="inline-flex items-center gap-1 text-xs font-mono text-[#0055FF]">
                        <Star size={12} fill="#0055FF" /> {n.score}/10
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{n.feedback}</p>
                    <div className="text-[10px] text-gray-400 mt-1 font-mono">
                      {new Date(n.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          </div>

          {/* Right: history timeline */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-3 inline-flex items-center gap-2">
                <HistoryIcon size={12} /> Stage History
              </div>
              <div className="bg-white border border-black/10 p-4" data-testid="history-timeline">
                {history.length === 0 ? (
                  <div className="text-sm text-gray-400 italic">No history yet</div>
                ) : (
                  <ol className="relative space-y-5">
                    {history.map((h, idx) => (
                      <li key={h.id} className="pl-6 relative" data-testid={`history-${h.id}`}>
                        <span className="absolute left-0 top-1 w-2.5 h-2.5 rounded-full"
                              style={{
                                backgroundColor: h.to_status ? STATUS_COLORS[h.to_status] || "#000" : "#0055FF",
                                outline: "2px solid #fff",
                                boxShadow: "0 0 0 1px rgba(0,0,0,0.2)",
                              }} />
                        {idx < history.length - 1 && (
                          <span className="absolute left-[5px] top-4 bottom-[-20px] w-px bg-black/10" />
                        )}
                        <div className="text-xs font-bold uppercase tracking-widest">
                          {h.action === "STATUS_CHANGE"
                            ? `${h.from_status || "—"} → ${h.to_status}`
                            : h.action === "CREATED" ? "APPLICATION CREATED"
                            : h.action === "NOTE_ADDED" ? "INTERVIEW NOTE"
                            : h.action === "ONBOARDED" ? "ONBOARDED" : h.action}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          by {h.changed_by_name || "System"}
                        </div>
                        {h.meta?.feedback_preview && (
                          <div className="text-xs text-gray-700 mt-1 italic">"{h.meta.feedback_preview}..."</div>
                        )}
                        {h.meta?.emp_id_code && (
                          <div className="text-xs text-gray-700 mt-1">
                            Emp ID: <span className="font-mono">{h.meta.emp_id_code}</span>
                          </div>
                        )}
                        <div className="text-[10px] text-gray-400 font-mono mt-1 inline-flex items-center gap-1">
                          <Clock size={10} /> {new Date(h.changed_at).toLocaleString()}
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">{title}</div>
      <div>{children}</div>
    </div>
  );
}

function KV({ label, value, mono }) {
  return (
    <div className="bg-white p-3">
      <div className="text-[10px] uppercase tracking-widest text-gray-500">{label}</div>
      <div className={`text-sm mt-0.5 ${mono ? "font-mono" : ""}`}>{value || "—"}</div>
    </div>
  );
}
