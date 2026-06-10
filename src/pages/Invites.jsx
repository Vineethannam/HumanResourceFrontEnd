import React, { useEffect, useState } from "react";
import { Plus, X, Trash2, Copy, Check, Link2 } from "lucide-react";
import AppShell from "@/components/AppShell";
import { api, formatApiErrorDetail } from "@/lib/api";
import { toast } from "sonner";

export default function Invites() {
  const [invites, setInvites] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [label, setLabel] = useState("");
  const [expiresDays, setExpiresDays] = useState(30);
  const [copiedId, setCopiedId] = useState(null);

  const load = async () => {
    try { const { data } = await api.get("/invites"); setInvites(data); }
    catch (e) { toast.error(formatApiErrorDetail(e.response?.data?.detail)); }
  };
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    try {
      await api.post("/invites", { label, expires_in_days: Number(expiresDays) });
      toast.success("Invitation link created");
      setLabel(""); setExpiresDays(30); setShowForm(false);
      load();
    } catch (err) { toast.error(formatApiErrorDetail(err.response?.data?.detail)); }
  };

  const revoke = async (id) => {
    if (!window.confirm("Revoke this invitation?")) return;
    try { await api.delete(`/invites/${id}`); toast.success("Revoked"); load(); }
    catch (err) { toast.error(formatApiErrorDetail(err.response?.data?.detail)); }
  };

  const copy = (token, id) => {
    const url = `${window.location.origin}/apply/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("Link copied");
    setTimeout(() => setCopiedId(null), 1500);
  };

  const status = (inv) => {
    if (inv.revoked) return { label: "Revoked", color: "bg-red-100 text-red-700" };
    if (inv.used) return { label: "Used", color: "bg-gray-200 text-gray-600" };
    if (inv.expires_at && new Date(inv.expires_at) < new Date()) return { label: "Expired", color: "bg-yellow-100 text-yellow-700" };
    return { label: "Active", color: "bg-green-100 text-green-700" };
  };

  return (
    <AppShell>
      <div className="max-w-[1400px] mx-auto px-6 py-8" data-testid="invites-page">
        <div className="flex items-end justify-between mb-8 pb-6 border-b border-black/10">
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-gray-500 mb-2">Settings · Invites</div>
            <h1 className="font-display font-black tracking-tighter text-4xl">Application Invites</h1>
            <p className="text-sm text-gray-600 mt-2 max-w-2xl">
              Generate one-time application links to share with candidates. Each link can be submitted only once and is revocable.
            </p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
                  className="bg-black text-white px-4 py-2.5 text-sm font-medium flex items-center gap-2 hover:bg-black/80"
                  data-testid="invites-toggle-form-btn">
            {showForm ? <><X size={14} /> Cancel</> : <><Plus size={14} /> New Invite</>}
          </button>
        </div>

        {showForm && (
          <form onSubmit={create} className="bg-white border border-black/10 p-6 mb-8 grid grid-cols-1 md:grid-cols-3 gap-4 items-end" data-testid="invite-form">
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold mb-1.5 block">Label (optional)</label>
              <input value={label} onChange={(e) => setLabel(e.target.value)}
                     placeholder="e.g. Senior React Engineer"
                     className="w-full border border-black/10 px-3 py-2 text-sm focus:border-black outline-none"
                     data-testid="invite-label-input" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold mb-1.5 block">Expires in (days)</label>
              <input type="number" min={1} max={365} value={expiresDays}
                     onChange={(e) => setExpiresDays(e.target.value)}
                     className="w-full border border-black/10 px-3 py-2 text-sm focus:border-black outline-none"
                     data-testid="invite-expires-input" />
            </div>
            <button type="submit"
                    className="bg-[#0055FF] text-white px-5 py-2.5 text-sm font-bold hover:bg-[#0044cc]"
                    data-testid="invite-submit-btn">
              Generate Link
            </button>
          </form>
        )}

        <div className="bg-white border border-black/10 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#f7f7f8] border-b border-black/10 text-[10px] uppercase tracking-widest">
                <th className="px-6 py-3 text-left font-bold">Label</th>
                <th className="px-6 py-3 text-left font-bold">Status</th>
                <th className="px-6 py-3 text-left font-bold">Created</th>
                <th className="px-6 py-3 text-left font-bold">Expires</th>
                <th className="px-6 py-3 text-left font-bold">Used At</th>
                <th className="px-6 py-3 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invites.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-16 text-center text-gray-400 italic">
                  No invitations yet. Click "New Invite" to generate one.
                </td></tr>
              ) : invites.map((inv) => {
                const s = status(inv);
                return (
                  <tr key={inv.id} className="border-b border-black/5 hover:bg-[#fafafa]" data-testid={`invite-row-${inv.id}`}>
                    <td className="px-6 py-3 font-medium">{inv.label || "(no label)"}</td>
                    <td className="px-6 py-3">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 ${s.color}`}>
                        {s.label}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-xs font-mono">{new Date(inv.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-3 text-xs font-mono">{inv.expires_at ? new Date(inv.expires_at).toLocaleDateString() : "—"}</td>
                    <td className="px-6 py-3 text-xs font-mono">{inv.used_at ? new Date(inv.used_at).toLocaleString() : "—"}</td>
                    <td className="px-6 py-3 text-right whitespace-nowrap">
                      <button onClick={() => copy(inv.token, inv.id)}
                              disabled={inv.revoked || inv.used}
                              className="p-1.5 border border-black/10 hover:border-black mr-1 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1"
                              data-testid={`invite-copy-${inv.id}`}
                              title="Copy invite link">
                        {copiedId === inv.id ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                      <a href={`/apply/${inv.token}`} target="_blank" rel="noopener noreferrer"
                         className="p-1.5 border border-black/10 hover:border-black mr-1 inline-flex items-center"
                         data-testid={`invite-open-${inv.id}`} title="Open invite">
                        <Link2 size={14} />
                      </a>
                      {!inv.revoked && !inv.used && (
                        <button onClick={() => revoke(inv.id)}
                                className="p-1.5 border border-black/10 hover:border-red-500 hover:text-red-500"
                                data-testid={`invite-revoke-${inv.id}`} title="Revoke">
                          <Trash2 size={14} />
                        </button>
                      )}
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
