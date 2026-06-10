import React, { useEffect, useState } from "react";
import { Plus, X, Trash2, Copy, Check, Mail } from "lucide-react";
import AppShell from "@/components/AppShell";
import GateKeeper from "@/components/GateKeeper";
import { api, formatApiErrorDetail } from "@/lib/api";
import { usePermission } from "@/lib/permissions";
import { toast } from "sonner";

const DEFAULT_USER = {
  full_name: "", email: "", phone: "", designation: "",
  department: "", report_to: "", role_id: "", about: "",
};

export default function Users() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(DEFAULT_USER);
  const [q, setQ] = useState("");
  const [tempPasswordModal, setTempPasswordModal] = useState(null); // {email, password}
  const [copied, setCopied] = useState(false);

  const canCreate = usePermission("users", "create");
  const canDelete = usePermission("users", "delete");

  const load = async () => {
    try {
      const [u, r] = await Promise.all([
        api.get(`/users${q ? `?q=${encodeURIComponent(q)}` : ""}`),
        api.get("/roles"),
      ]);
      setUsers(u.data); setRoles(r.data);
    } catch (e) { toast.error(formatApiErrorDetail(e.response?.data?.detail)); }
  };
  useEffect(() => { load(); }, [q]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      if (!payload.report_to) delete payload.report_to;
      const { data } = await api.post("/users", payload);
      toast.success("User created — welcome email sent");
      setForm(DEFAULT_USER);
      setShowForm(false);
      // Show temp password fallback for admin in case email failed
      if (data?.temp_password) {
        setTempPasswordModal({ email: data.email, password: data.temp_password, name: data.full_name });
      }
      load();
    } catch (err) { toast.error(formatApiErrorDetail(err.response?.data?.detail)); }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try { await api.delete(`/users/${id}`); toast.success("Deleted"); load(); }
    catch (err) { toast.error(formatApiErrorDetail(err.response?.data?.detail)); }
  };

  const copyTemp = () => {
    if (!tempPasswordModal) return;
    navigator.clipboard.writeText(`Email: ${tempPasswordModal.email}\nTemp Password: ${tempPasswordModal.password}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <AppShell>
      <div className="max-w-[1400px] mx-auto px-6 py-8" data-testid="users-page">
        <div className="flex items-end justify-between mb-8 pb-6 border-b border-black/10">
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-gray-500 mb-2">Settings · Users</div>
            <h1 className="font-display font-black tracking-tighter text-4xl">Users</h1>
          </div>
          <GateKeeper module="users" action="create">
            <button onClick={() => setShowForm(!showForm)}
                    className="bg-black text-white px-4 py-2.5 text-sm font-medium flex items-center gap-2 hover:bg-black/80"
                    data-testid="users-toggle-form-btn">
              {showForm ? <><X size={14} /> Cancel</> : <><Plus size={14} /> New User</>}
            </button>
          </GateKeeper>
        </div>

        {showForm && canCreate && (
          <form onSubmit={submit} className="bg-white border border-black/10 p-6 mb-8" data-testid="user-form">
            <div className="text-sm font-bold uppercase tracking-widest mb-1">Create User</div>
            <div className="text-xs text-gray-500 mb-4">
              A strong temporary password will be auto-generated and emailed to the user. They'll be required to change it on first login.
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="Full name" required>
                <Input value={form.full_name} onChange={(v) => setForm({ ...form, full_name: v })}
                       data-testid="user-fullname-input" required />
              </Field>
              <Field label="Email" required>
                <Input type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })}
                       data-testid="user-email-input" required />
              </Field>
              <Field label="Phone">
                <Input value={form.phone} onChange={(v) => setForm({ ...form, phone: v })}
                       data-testid="user-phone-input" />
              </Field>
              <Field label="Designation" required>
                <Input value={form.designation} onChange={(v) => setForm({ ...form, designation: v })}
                       data-testid="user-designation-input" required />
              </Field>
              <Field label="Department">
                <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}
                        className="nx-input bg-white" data-testid="user-department-select">
                  <option value="">—</option>
                  <option value="TECH">Tech</option>
                  <option value="OPS">Ops</option>
                  <option value="HR">HR</option>
                  <option value="SALES">Sales</option>
                </select>
              </Field>
              <Field label="Report To">
                <select value={form.report_to} onChange={(e) => setForm({ ...form, report_to: e.target.value })}
                        className="nx-input bg-white" data-testid="user-reportto-select">
                  <option value="">—</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.full_name} ({u.email})</option>
                  ))}
                </select>
              </Field>
              <Field label="Role" required>
                <select value={form.role_id} onChange={(e) => setForm({ ...form, role_id: e.target.value })}
                        className="nx-input bg-white" required data-testid="user-role-select">
                  <option value="">Select role</option>
                  {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </Field>
              <Field label="About" cols={3}>
                <textarea value={form.about} onChange={(e) => setForm({ ...form, about: e.target.value })}
                          rows={2} className="nx-input resize-none" data-testid="user-about-input" />
              </Field>
            </div>
            <div className="flex gap-2 mt-5">
              <button type="submit"
                      className="bg-[#0055FF] text-white px-5 py-2 text-sm font-bold hover:bg-[#0044cc]"
                      data-testid="user-submit-btn">
                Create User & Send Invite
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                      className="px-5 py-2 text-sm border border-black/10 hover:border-black">Cancel</button>
            </div>
            <style>{`.nx-input{width:100%;border:1px solid rgba(0,0,0,.1);padding:8px 12px;font-size:14px;outline:none}.nx-input:focus{border-color:#000}`}</style>
          </form>
        )}

        <div className="mb-4 flex items-center justify-between">
          <input value={q} onChange={(e) => setQ(e.target.value)}
                 placeholder="Search users..."
                 className="border border-black/10 px-3 py-1.5 text-sm focus:border-black outline-none w-64"
                 data-testid="users-search" />
          <div className="text-xs font-mono uppercase tracking-widest text-gray-500">{users.length} users</div>
        </div>

        <div className="bg-white border border-black/10 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#f7f7f8] border-b border-black/10 text-[10px] uppercase tracking-widest">
                <Th>Name</Th><Th>Email</Th><Th>Designation</Th><Th>Department</Th>
                <Th>Role</Th><Th>Reports To</Th>
                {canDelete && <Th>Actions</Th>}
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={canDelete ? 7 : 6} className="px-6 py-16 text-center text-gray-400 italic">No users yet</td></tr>
              ) : users.map((u) => (
                <tr key={u.id} className="border-b border-black/5 hover:bg-[#fafafa]" data-testid={`user-row-${u.id}`}>
                  <td className="px-6 py-3 font-medium">
                    {u.full_name}
                    {u.must_change_password && (
                      <span className="ml-2 text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 bg-yellow-100 text-yellow-800">
                        Pending first-login
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-gray-600">{u.email}</td>
                  <td className="px-6 py-3">{u.designation || "—"}</td>
                  <td className="px-6 py-3"><span className="text-xs px-2 py-0.5 bg-black/5 border border-black/10">{u.department || "—"}</span></td>
                  <td className="px-6 py-3"><span className="text-xs font-medium">{u.role_name}</span></td>
                  <td className="px-6 py-3 text-gray-500">{u.report_to_name || "—"}</td>
                  {canDelete && (
                    <td className="px-6 py-3">
                      {u.role !== "ADMIN" && (
                        <button onClick={() => remove(u.id)}
                                className="p-1.5 border border-black/10 hover:border-red-500 hover:text-red-500"
                                data-testid={`user-delete-${u.id}`}>
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Temp password modal (fallback in case email doesn't reach) */}
      {tempPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" data-testid="temp-password-modal">
          <div className="bg-white border border-black/10 max-w-lg w-full mx-4 p-6 nx-fade-up">
            <div className="flex items-start gap-3 mb-4">
              <div className="bg-[#0055FF] text-white p-2"><Mail size={20} /></div>
              <div>
                <h3 className="font-display font-bold text-2xl tracking-tight">Welcome email sent.</h3>
                <p className="text-sm text-gray-600 mt-1">
                  A welcome email with the temporary password has been sent to <strong>{tempPasswordModal.email}</strong>.
                  Share these credentials manually if email delivery is unavailable:
                </p>
              </div>
            </div>
            <div className="border border-black/10">
              <div className="px-4 py-3 bg-[#f7f7f8] flex items-center justify-between border-b border-black/10">
                <span className="text-[10px] uppercase tracking-widest text-gray-500">Email</span>
                <span className="font-mono text-sm">{tempPasswordModal.email}</span>
              </div>
              <div className="px-4 py-3 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-widest text-gray-500">Temp password</span>
                <span className="font-mono text-sm font-bold" data-testid="temp-password-value">{tempPasswordModal.password}</span>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={copyTemp}
                      className="flex-1 bg-black text-white px-4 py-2 text-sm font-medium hover:bg-black/80 flex items-center justify-center gap-2"
                      data-testid="temp-password-copy-btn">
                {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy credentials</>}
              </button>
              <button onClick={() => setTempPasswordModal(null)}
                      className="px-4 py-2 text-sm border border-black/10 hover:border-black"
                      data-testid="temp-password-close-btn">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function Th({ children }) { return <th className="px-6 py-3 text-left font-bold text-gray-600">{children}</th>; }
function Field({ label, required, cols, children }) {
  return (
    <div className={cols === 3 ? "md:col-span-3" : ""}>
      <label className="text-[10px] uppercase tracking-widest font-bold text-gray-700 mb-1.5 block">
        {label} {required && <span className="text-[#0055FF]">*</span>}
      </label>
      {children}
    </div>
  );
}
function Input({ value, onChange, type = "text", required, "data-testid": testId }) {
  return <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
                required={required} data-testid={testId}
                className="w-full border border-black/10 px-3 py-2 text-sm focus:border-black outline-none" />;
}
