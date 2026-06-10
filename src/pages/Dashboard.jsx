import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, Briefcase, CheckCircle2, TrendingUp, ArrowRight } from "lucide-react";
import AppShell from "@/components/AppShell";
import { api } from "@/lib/api";

const STATUS_COLORS = {
  APPLIED: "#e5e7eb", INTERVIEWING: "#bfdbfe", OFFERED: "#fde68a",
  HIRED: "#bbf7d0", REJECTED: "#fecaca",
};
const DEPT_LABELS = { TECH: "Tech", OPS: "Ops", HR: "HR", SALES: "Sales" };

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [recentCandidates, setRecentCandidates] = useState([]);
  const [recentEmployees, setRecentEmployees] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [m, c, e] = await Promise.all([
          api.get("/metrics"), api.get("/candidates"), api.get("/employees"),
        ]);
        setMetrics(m.data);
        setRecentCandidates(c.data.slice(0, 5));
        setRecentEmployees(e.data.slice(0, 5));
      } catch { /* handled by interceptors */ }
    })();
  }, []);

  const statusTotal = metrics
    ? Object.values(metrics.candidates.by_status).reduce((a, b) => a + b, 0) || 1 : 1;

  return (
    <AppShell>
      <div className="max-w-[1400px] mx-auto px-6 py-10" data-testid="dashboard-page">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-gray-500 mb-2">Overview</div>
            <h1 className="font-display font-black tracking-tighter text-4xl sm:text-5xl">Dashboard</h1>
          </div>
          <Link to="/admin/candidates"
                className="hidden md:inline-flex items-center gap-2 bg-black text-white px-4 py-2 text-sm font-medium hover:bg-black/80"
                data-testid="dashboard-open-kanban">
            Open Kanban <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-black/10 border border-black/10 mb-10" data-testid="metrics-grid">
          <Metric icon={<Users size={18} />} label="Candidates" value={metrics?.candidates.total ?? "—"}
                  sub={`${metrics?.candidates.tech ?? 0} tech · ${metrics?.candidates.non_tech ?? 0} non-tech`}
                  testId="metric-candidates" />
          <Metric icon={<TrendingUp size={18} />} label="In Pipeline"
                  value={metrics ? (metrics.candidates.by_status.APPLIED + metrics.candidates.by_status.INTERVIEWING + metrics.candidates.by_status.OFFERED) : "—"}
                  sub="Applied + Interviewing + Offered" testId="metric-pipeline" />
          <Metric icon={<CheckCircle2 size={18} />} label="Hired" value={metrics?.candidates.by_status.HIRED ?? "—"}
                  sub="Converted to employees" accent testId="metric-hired" />
          <Metric icon={<Briefcase size={18} />} label="Active Employees" value={metrics?.employees.active ?? "—"}
                  sub={`of ${metrics?.employees.total ?? 0} total`} testId="metric-employees" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <div className="lg:col-span-2 bg-white border border-black/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-xl tracking-tight">Pipeline breakdown</h2>
              <Link to="/admin/candidates" className="text-xs font-medium hover:text-[#0055FF]">View all →</Link>
            </div>
            <div className="space-y-3">
              {["APPLIED", "INTERVIEWING", "OFFERED", "HIRED", "REJECTED"].map((s) => {
                const count = metrics?.candidates.by_status[s] ?? 0;
                const pct = Math.round((count / statusTotal) * 100);
                return (
                  <div key={s}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium">{s}</span>
                      <span className="font-mono text-gray-500">{count}</span>
                    </div>
                    <div className="h-3 bg-[#f1f1f3] relative">
                      <div className="h-full transition-all duration-500"
                           style={{ width: `${pct}%`, backgroundColor: STATUS_COLORS[s] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white border border-black/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-xl tracking-tight">Workforce</h2>
              <Link to="/admin/employees" className="text-xs font-medium hover:text-[#0055FF]">View all →</Link>
            </div>
            <div className="space-y-3">
              {Object.entries(DEPT_LABELS).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between py-2 border-b border-black/5 last:border-0">
                  <span className="text-sm font-medium">{v}</span>
                  <span className="font-mono text-sm">{metrics?.employees.by_department[k] ?? 0}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentList title="Recent candidates" link="/admin/candidates"
                      empty="No candidates yet — generate an invite link in Settings."
                      items={recentCandidates}
                      buildHref={(c) => `/admin/candidates/${c.id}`}
                      render={(c) => (<><div className="font-medium text-sm">{c.full_name}</div>
                        <div className="text-xs text-gray-500">{c.email}</div></>)}
                      side={(c) => (
                        <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5"
                              style={{ backgroundColor: STATUS_COLORS[c.status] }}>{c.status}</span>
                      )} />
          <RecentList title="Recent employees" link="/admin/employees"
                      empty="No employees yet — onboard a hired candidate."
                      items={recentEmployees}
                      buildHref={(e) => `/admin/employees?id=${e.id}`}
                      render={(e) => (
                        <>
                          <div className="font-medium text-sm">{e.full_name} <span className="text-gray-400">· {e.emp_id_code}</span></div>
                          <div className="text-xs text-gray-500">{e.designation} · {e.department}</div>
                        </>
                      )}
                      side={(e) => (
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 ${e.active_status ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-600"}`}>
                          {e.active_status ? "Active" : "Inactive"}
                        </span>
                      )} />
        </div>
      </div>
    </AppShell>
  );
}

function Metric({ icon, label, value, sub, accent, testId }) {
  return (
    <div className={`p-6 ${accent ? "bg-black text-white" : "bg-white"}`} data-testid={testId}>
      <div className={`flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold ${accent ? "text-gray-400" : "text-gray-500"}`}>
        {icon}{label}
      </div>
      <div className={`font-display font-black tracking-tighter text-4xl mt-3 ${accent ? "text-[#0055FF]" : ""}`}>{value}</div>
      <div className={`text-xs mt-1 ${accent ? "text-gray-400" : "text-gray-500"}`}>{sub}</div>
    </div>
  );
}

function RecentList({ title, items, empty, render, side, link, buildHref }) {
  return (
    <div className="bg-white border border-black/10">
      <div className="flex items-center justify-between px-6 py-4 border-b border-black/10">
        <h2 className="font-display font-bold text-lg tracking-tight">{title}</h2>
        <Link to={link} className="text-xs font-medium hover:text-[#0055FF]">View all →</Link>
      </div>
      {items.length === 0 ? (
        <div className="px-6 py-10 text-sm text-gray-400 italic text-center">{empty}</div>
      ) : items.map((it) => (
        <Link to={buildHref(it)} key={it.id}
              className="px-6 py-3 flex items-center justify-between border-b border-black/5 last:border-0 hover:bg-[#f7f7f8]">
          <div>{render(it)}</div>{side(it)}
        </Link>
      ))}
    </div>
  );
}
