import React, { useEffect, useState } from "react";
import { Plus, X, Trash2, Edit2 } from "lucide-react";
import AppShell from "@/components/AppShell";
import { api, formatApiErrorDetail } from "@/lib/api";
import { toast } from "sonner";

const MODULES = [
  { key: "candidates", label: "Candidates" },
  { key: "employees", label: "Employees" },
  { key: "users", label: "Users" },
  { key: "roles", label: "Roles" },
  { key: "invites", label: "Invites" },
  { key: "categories", label: "Categories" },
  { key: "tech_stacks", label: "Tech Stacks" },
  { key: "settings", label: "Settings" },
];

const PERMS = ["create", "read", "update", "delete"];

function emptyPermissions() {
  return MODULES.reduce((acc, m) => {
    acc[m.key] = { create: false, read: false, update: false, delete: false };
    return acc;
  }, {});
}

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", permissions: emptyPermissions() });

  const load = async () => {
    try { const { data } = await api.get("/roles"); setRoles(data); }
    catch (e) { toast.error(formatApiErrorDetail(e.response?.data?.detail)); }
  };
  useEffect(() => { load(); }, []);

  const toggleAll = (moduleKey, value) => {
    setForm((f) => ({
      ...f,
      permissions: {
        ...f.permissions,
        [moduleKey]: PERMS.reduce((acc, p) => ({ ...acc, [p]: value }), {}),
      },
    }));
  };

  const toggle = (moduleKey, perm) => {
    setForm((f) => ({
      ...f,
      permissions: {
        ...f.permissions,
        [moduleKey]: { ...f.permissions[moduleKey], [perm]: !f.permissions[moduleKey][perm] },
      },
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.patch(`/roles/${editing}`, form);
        toast.success("Role updated");
      } else {
        await api.post("/roles", form);
        toast.success("Role created");
      }
      setForm({ name: "", description: "", permissions: emptyPermissions() });
      setShowForm(false); setEditing(null);
      load();
    } catch (err) { toast.error(formatApiErrorDetail(err.response?.data?.detail)); }
  };

  const edit = (role) => {
    setEditing(role.id);
    setForm({ name: role.name, description: role.description || "",
              permissions: { ...emptyPermissions(), ...role.permissions } });
    setShowForm(true);
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this role?")) return;
    try { await api.delete(`/roles/${id}`); toast.success("Deleted"); load(); }
    catch (err) { toast.error(formatApiErrorDetail(err.response?.data?.detail)); }
  };

  return (
    <AppShell>
      <div className="max-w-[1400px] mx-auto px-6 py-8" data-testid="roles-page">
        <div className="flex items-end justify-between mb-8 pb-6 border-b border-black/10">
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-gray-500 mb-2">Settings · Roles</div>
            <h1 className="font-display font-black tracking-tighter text-4xl">Roles & Permissions</h1>
          </div>
          <button onClick={() => {
                    setForm({ name: "", description: "", permissions: emptyPermissions() });
                    setEditing(null);
                    setShowForm(!showForm);
                  }}
                  className="bg-black text-white px-4 py-2.5 text-sm font-medium flex items-center gap-2 hover:bg-black/80"
                  data-testid="roles-toggle-form-btn">
            {showForm ? <><X size={14} /> Cancel</> : <><Plus size={14} /> New Role</>}
          </button>
        </div>

        {showForm && (
          <form onSubmit={submit} className="bg-white border border-black/10 p-6 mb-8" data-testid="role-form">
            <div className="text-sm font-bold uppercase tracking-widest mb-5">
              {editing ? "Edit Role" : "Create Role"}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold mb-1.5 block">Role Name *</label>
                <input value={form.name} required onChange={(e) => setForm({ ...form, name: e.target.value })}
                       placeholder="e.g. HR Manager"
                       className="w-full border border-black/10 px-3 py-2 text-sm focus:border-black outline-none"
                       data-testid="role-name-input" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold mb-1.5 block">Description</label>
                <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                       className="w-full border border-black/10 px-3 py-2 text-sm focus:border-black outline-none"
                       data-testid="role-description-input" />
              </div>
            </div>

            <div className="border border-black/10" data-testid="permissions-matrix">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#f7f7f8] border-b border-black/10 text-[10px] uppercase tracking-widest">
                    <th className="px-4 py-3 text-left font-bold">Module</th>
                    <th className="px-4 py-3 text-center font-bold">All</th>
                    {PERMS.map((p) => <th key={p} className="px-4 py-3 text-center font-bold capitalize">{p}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {MODULES.map((m) => {
                    const allOn = PERMS.every((p) => form.permissions[m.key]?.[p]);
                    return (
                      <tr key={m.key} className="border-b border-black/5 last:border-0">
                        <td className="px-4 py-3 font-medium">{m.label}</td>
                        <td className="px-4 py-3 text-center">
                          <Toggle on={allOn} onClick={() => toggleAll(m.key, !allOn)}
                                  testId={`perm-${m.key}-all`} />
                        </td>
                        {PERMS.map((p) => (
                          <td key={p} className="px-4 py-3 text-center">
                            <Toggle on={form.permissions[m.key]?.[p] || false}
                                    onClick={() => toggle(m.key, p)}
                                    testId={`perm-${m.key}-${p}`} />
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex gap-2 mt-5">
              <button type="submit"
                      className="bg-[#0055FF] text-white px-5 py-2 text-sm font-bold hover:bg-[#0044cc]"
                      data-testid="role-submit-btn">
                {editing ? "Save Changes" : "Create Role"}
              </button>
              <button type="button"
                      onClick={() => { setShowForm(false); setEditing(null); }}
                      className="px-5 py-2 text-sm border border-black/10 hover:border-black">
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="bg-white border border-black/10 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#f7f7f8] border-b border-black/10 text-[10px] uppercase tracking-widest">
                <th className="px-6 py-3 text-left font-bold">Name</th>
                <th className="px-6 py-3 text-left font-bold">Description</th>
                <th className="px-6 py-3 text-left font-bold">Modules</th>
                <th className="px-6 py-3 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-16 text-center text-gray-400 italic">
                  No roles yet. Create one to assign to users.
                </td></tr>
              ) : roles.map((r) => {
                const accessibleModules = Object.entries(r.permissions || {})
                  .filter(([_, perms]) => Object.values(perms).some(Boolean))
                  .map(([key]) => key);
                return (
                  <tr key={r.id} className="border-b border-black/5 hover:bg-[#fafafa]" data-testid={`role-row-${r.id}`}>
                    <td className="px-6 py-3 font-medium">{r.name}</td>
                    <td className="px-6 py-3 text-gray-600">{r.description || "—"}</td>
                    <td className="px-6 py-3">
                      <div className="flex flex-wrap gap-1">
                        {accessibleModules.length === 0 ? <span className="text-xs text-gray-400">none</span> :
                          accessibleModules.map((m) => (
                            <span key={m} className="text-[10px] px-1.5 py-0.5 bg-[#f1f1f3] border border-black/10">{m}</span>
                          ))}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <button onClick={() => edit(r)}
                              className="p-1.5 border border-black/10 hover:border-black mr-1"
                              data-testid={`role-edit-${r.id}`}><Edit2 size={14} /></button>
                      <button onClick={() => remove(r.id)}
                              className="p-1.5 border border-black/10 hover:border-red-500 hover:text-red-500"
                              data-testid={`role-delete-${r.id}`}><Trash2 size={14} /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}

function Toggle({ on, onClick, testId }) {
  return (
    <button type="button" onClick={onClick} data-testid={testId}
            className={`relative w-9 h-5 transition-colors ${on ? "bg-[#0055FF]" : "bg-gray-300"}`}>
      <span className={`absolute top-0.5 w-4 h-4 bg-white transition-all ${on ? "left-[18px]" : "left-0.5"}`} />
    </button>
  );
}
