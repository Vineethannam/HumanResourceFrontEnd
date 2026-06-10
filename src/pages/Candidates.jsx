import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Filter, LayoutGrid, Table as TableIcon, X, Plus } from "lucide-react";
import AppShell from "@/components/AppShell";
import { api, formatApiErrorDetail } from "@/lib/api";
import { toast } from "sonner";

const STATUS_COLORS = {
  APPLIED: "#e5e7eb",
  INTERVIEWING: "#bfdbfe",
  OFFERED: "#fde68a",
  HIRED: "#bbf7d0",
  REJECTED: "#fecaca",
};

const STATUS_KEYS = ["APPLIED", "INTERVIEWING", "OFFERED", "HIRED", "REJECTED"];

export default function Candidates() {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [view, setView] = useState(() => localStorage.getItem("nx_cand_view") || "kanban");
  const [filterOpen, setFilterOpen] = useState(false);
  const [dragId, setDragId] = useState(null);
  const [filters, setFilters] = useState({
    is_tech: null,
    status: null,
    date_from: "",
    date_to: "",
    score_min: "",
    score_max: "",
    tech_stack: [], // array of names
    q: "",
  });

  useEffect(() => localStorage.setItem("nx_cand_view", view), [view]);

  const load = useCallback(async () => {
    const qs = new URLSearchParams();
    if (filters.is_tech !== null) qs.set("is_tech", String(filters.is_tech));
    if (filters.status) qs.set("status", filters.status);
    if (filters.date_from) qs.set("date_from", filters.date_from);
    if (filters.date_to) qs.set("date_to", filters.date_to);
    if (filters.score_min) qs.set("score_min", filters.score_min);
    if (filters.score_max) qs.set("score_max", filters.score_max);
    if (filters.tech_stack.length) qs.set("tech_stack", filters.tech_stack.join(","));
    if (filters.q) qs.set("q", filters.q);
    try {
      const { data } = await api.get(`/candidates?${qs.toString()}`);
      setCandidates(data);
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail));
    }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const handleDrop = async (statusKey) => {
    if (!dragId) return;
    const cand = candidates.find((c) => c.id === dragId);
    setDragId(null);
    if (!cand || cand.status === statusKey) return;
    setCandidates((cs) => cs.map((c) => (c.id === dragId ? { ...c, status: statusKey } : c)));
    try {
      await api.patch(`/candidates/${dragId}/status`, { status: statusKey });
      toast.success(`Moved → ${statusKey}`);
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail));
      load();
    }
  };

  const activeFilterCount = [
    filters.is_tech !== null,
    !!filters.status,
    !!filters.date_from || !!filters.date_to,
    !!filters.score_min || !!filters.score_max,
    filters.tech_stack.length > 0,
  ].filter(Boolean).length;

  return (
    <AppShell>
      <div className="max-w-[1400px] mx-auto px-6 py-8" data-testid="candidates-page">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-gray-500 mb-2">Recruitment CRM</div>
            <h1 className="font-display font-black tracking-tighter text-4xl sm:text-5xl">Candidates</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs font-mono uppercase tracking-widest text-gray-500">
              {candidates.length} total
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 mb-6 pb-4 border-b border-black/10">
          {/* View toggle */}
          <div className="inline-flex border border-black/10">
            <button
              onClick={() => setView("kanban")}
              className={`px-3 py-2 text-xs font-medium flex items-center gap-2 transition-colors ${
                view === "kanban" ? "bg-black text-white" : "bg-white hover:bg-gray-50"
              }`}
              data-testid="view-kanban"
            >
              <LayoutGrid size={14} /> Kanban
            </button>
            <button
              onClick={() => setView("table")}
              className={`px-3 py-2 text-xs font-medium flex items-center gap-2 transition-colors ${
                view === "table" ? "bg-black text-white" : "bg-white hover:bg-gray-50"
              }`}
              data-testid="view-table"
            >
              <TableIcon size={14} /> Table
            </button>
          </div>

          <button
            onClick={() => setFilterOpen(true)}
            className="px-3 py-2 text-xs font-medium flex items-center gap-2 border border-black/10 hover:border-black transition-colors"
            data-testid="filters-btn"
          >
            <Filter size={14} /> Filters
            {activeFilterCount > 0 && (
              <span className="ml-1 inline-flex items-center justify-center w-4 h-4 text-[10px] bg-[#0055FF] text-white">
                {activeFilterCount}
              </span>
            )}
          </button>

          <div className="ml-auto relative">
            <input
              placeholder="Search name, email..."
              value={filters.q}
              onChange={(e) => setFilters({ ...filters, q: e.target.value })}
              className="border border-black/10 bg-white px-3 py-1.5 text-sm focus:border-black outline-none w-64"
              data-testid="candidates-quick-search"
            />
            {filters.q && (
              <button
                onClick={() => setFilters({ ...filters, q: "" })}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {view === "kanban" ? (
          <KanbanView candidates={candidates} onDrop={handleDrop} setDragId={setDragId}
                      dragId={dragId} onOpen={(id) => navigate(`/admin/candidates/${id}`)} />
        ) : (
          <TableView candidates={candidates} onOpen={(id) => navigate(`/admin/candidates/${id}`)} />
        )}
      </div>

      {filterOpen && (
        <FiltersDrawer
          filters={filters}
          onClose={() => setFilterOpen(false)}
          onApply={(f) => { setFilters(f); setFilterOpen(false); }}
          onClear={() => {
            setFilters({ is_tech: null, status: null, date_from: "", date_to: "",
                         score_min: "", score_max: "", tech_stack: [], q: filters.q });
            setFilterOpen(false);
          }}
        />
      )}
    </AppShell>
  );
}

function KanbanView({ candidates, onDrop, setDragId, dragId, onOpen }) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 kanban-rail" data-testid="kanban-board">
      {STATUS_KEYS.map((statusKey) => {
        const items = candidates.filter((c) => c.status === statusKey);
        return (
          <div
            key={statusKey}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(statusKey)}
            className="bg-[#f1f1f3] p-3 min-w-[300px] max-w-[320px] flex flex-col gap-3 flex-shrink-0"
            data-testid={`kanban-column-${statusKey.toLowerCase()}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 inline-block" style={{ backgroundColor: STATUS_COLORS[statusKey] }} />
                <span className="text-xs font-bold uppercase tracking-widest">{statusKey}</span>
              </div>
              <span className="text-[10px] font-mono text-gray-500 bg-white border border-black/10 px-1.5 py-0.5">
                {items.length}
              </span>
            </div>
            <div className="flex flex-col gap-2 min-h-[60px]">
              {items.length === 0 ? (
                <div className="text-xs text-gray-400 italic px-2 py-8 text-center border border-dashed border-black/10">
                  Drop here
                </div>
              ) : (
                items.map((c) => (
                  <div
                    key={c.id}
                    draggable
                    onDragStart={() => setDragId(c.id)}
                    onDragEnd={() => setDragId(null)}
                    onClick={() => onOpen(c.id)}
                    className={`bg-white border border-black/10 p-3 cursor-pointer hover:border-black hover:-translate-y-0.5 hover:shadow-sm transition-all ${dragId === c.id ? "dragging" : ""}`}
                    data-testid={`candidate-card-${c.id}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="font-medium text-sm truncate">{c.full_name}</div>
                      {c.is_tech && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 bg-black text-white uppercase">Tech</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 truncate">{c.email}</div>
                    {c.tech_stack?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {c.tech_stack.slice(0, 3).map((t) => (
                          <span key={t} className="text-[10px] px-1.5 py-0.5 bg-[#f1f1f3] border border-black/10">{t}</span>
                        ))}
                        {c.tech_stack.length > 3 && (
                          <span className="text-[10px] text-gray-500 px-1">+{c.tech_stack.length - 3}</span>
                        )}
                      </div>
                    )}
                    <div className="text-[10px] text-gray-400 font-mono mt-2">
                      {new Date(c.application_date).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TableView({ candidates, onOpen }) {
  return (
    <div className="bg-white border border-black/10 overflow-x-auto" data-testid="candidates-table">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#f7f7f8] border-b border-black/10 text-[10px] uppercase tracking-widest">
            <Th>Candidate</Th>
            <Th>Status</Th>
            <Th>Type</Th>
            <Th>Tech Stack</Th>
            <Th>Location</Th>
            <Th>Applied</Th>
          </tr>
        </thead>
        <tbody>
          {candidates.length === 0 ? (
            <tr><td colSpan={6} className="px-6 py-16 text-center text-sm text-gray-400 italic">No candidates found</td></tr>
          ) : (
            candidates.map((c) => (
              <tr key={c.id} onClick={() => onOpen(c.id)}
                  className="border-b border-black/5 hover:bg-[#fafafa] cursor-pointer transition-colors"
                  data-testid={`candidate-row-${c.id}`}>
                <td className="px-6 py-3">
                  <div className="font-medium">{c.full_name}</div>
                  <div className="text-xs text-gray-500">{c.email}</div>
                </td>
                <td className="px-6 py-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5"
                        style={{ backgroundColor: STATUS_COLORS[c.status] }}>
                    {c.status}
                  </span>
                </td>
                <td className="px-6 py-3">
                  <span className="text-xs font-medium">
                    {c.is_tech ? "Tech" : "Non-tech"}
                  </span>
                </td>
                <td className="px-6 py-3">
                  <div className="flex flex-wrap gap-1">
                    {(c.tech_stack || []).slice(0, 4).map((t) => (
                      <span key={t} className="text-[10px] px-1.5 py-0.5 bg-[#f1f1f3] border border-black/10">{t}</span>
                    ))}
                    {(c.tech_stack || []).length > 4 && <span className="text-[10px] text-gray-500">+{c.tech_stack.length - 4}</span>}
                  </div>
                </td>
                <td className="px-6 py-3 text-xs">{c.current_location}</td>
                <td className="px-6 py-3 text-xs font-mono">{new Date(c.application_date).toLocaleDateString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
function Th({ children }) {
  return <th className="px-6 py-3 text-left font-bold text-gray-600">{children}</th>;
}

function FiltersDrawer({ filters, onClose, onApply, onClear }) {
  const [local, setLocal] = useState(filters);
  const [techSearch, setTechSearch] = useState("");
  const [techOptions, setTechOptions] = useState([]);

  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        const { data } = await api.get(`/tech-stacks?q=${encodeURIComponent(techSearch)}`);
        setTechOptions(data);
      } catch { /* ignore */ }
    }, 200);
    return () => clearTimeout(t);
  }, [techSearch]);

  const toggleStack = (name) => {
    setLocal((l) => ({
      ...l,
      tech_stack: l.tech_stack.includes(name)
        ? l.tech_stack.filter((t) => t !== name)
        : [...l.tech_stack, name],
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex" data-testid="filters-drawer">
      <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <aside className="w-full max-w-md bg-white border-l border-black/10 shadow-2xl flex flex-col nx-fade-up">
        <div className="px-6 py-4 border-b border-black/10 flex items-center justify-between">
          <h2 className="font-display font-bold text-2xl tracking-tight">Filters</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100" data-testid="filters-close-btn"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <Group label="From Date">
            <input type="date" value={local.date_from || ""}
                   onChange={(e) => setLocal({ ...local, date_from: e.target.value })}
                   className="w-full border border-black/10 px-3 py-2 text-sm focus:border-black outline-none"
                   data-testid="filter-date-from" />
          </Group>
          <Group label="To Date">
            <input type="date" value={local.date_to || ""}
                   onChange={(e) => setLocal({ ...local, date_to: e.target.value })}
                   className="w-full border border-black/10 px-3 py-2 text-sm focus:border-black outline-none"
                   data-testid="filter-date-to" />
          </Group>

          <Group label="Status">
            <select value={local.status || ""}
                    onChange={(e) => setLocal({ ...local, status: e.target.value || null })}
                    className="w-full border border-black/10 px-3 py-2 text-sm bg-white focus:border-black outline-none"
                    data-testid="filter-status">
              <option value="">All</option>
              {STATUS_KEYS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Group>

          <Group label="Role type">
            <div className="flex gap-2">
              {[
                { v: null, l: "All" },
                { v: true, l: "Tech" },
                { v: false, l: "Non-tech" },
              ].map(({ v, l }) => (
                <button key={l}
                        onClick={() => setLocal({ ...local, is_tech: v })}
                        className={`flex-1 text-xs font-medium px-3 py-2 border transition-all ${
                          local.is_tech === v ? "bg-black text-white border-black" : "bg-white border-black/10"
                        }`}
                        data-testid={`filter-roletype-${l.toLowerCase()}`}>
                  {l}
                </button>
              ))}
            </div>
          </Group>

          <Group label="Score range (avg)">
            <div className="flex gap-2 items-center">
              <input type="number" min={1} max={10} placeholder="Min"
                     value={local.score_min}
                     onChange={(e) => setLocal({ ...local, score_min: e.target.value })}
                     className="flex-1 border border-black/10 px-3 py-2 text-sm focus:border-black outline-none"
                     data-testid="filter-score-min" />
              <span className="text-gray-400">—</span>
              <input type="number" min={1} max={10} placeholder="Max"
                     value={local.score_max}
                     onChange={(e) => setLocal({ ...local, score_max: e.target.value })}
                     className="flex-1 border border-black/10 px-3 py-2 text-sm focus:border-black outline-none"
                     data-testid="filter-score-max" />
            </div>
          </Group>

          <Group label="Tech Stack (searchable)">
            <input
              value={techSearch}
              onChange={(e) => setTechSearch(e.target.value)}
              placeholder="Search tech stacks..."
              className="w-full border border-black/10 px-3 py-2 text-sm focus:border-black outline-none mb-2"
              data-testid="filter-tech-search"
            />
            {local.tech_stack.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {local.tech_stack.map((t) => (
                  <span key={t}
                        className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-black text-white"
                        onClick={() => toggleStack(t)}>
                    {t} <X size={10} />
                  </span>
                ))}
              </div>
            )}
            <div className="max-h-48 overflow-y-auto border border-black/10">
              {techOptions.length === 0 ? (
                <div className="px-3 py-2 text-xs text-gray-400 italic">No tech stacks found. Add some in Settings → Tech Stack.</div>
              ) : (
                techOptions.map((t) => (
                  <button key={t.id}
                          type="button"
                          onClick={() => toggleStack(t.name)}
                          className={`w-full text-left px-3 py-1.5 text-sm border-b border-black/5 last:border-0 hover:bg-[#f7f7f8] flex items-center justify-between transition-colors ${
                            local.tech_stack.includes(t.name) ? "bg-[#f1f1f3]" : ""
                          }`}>
                    <span>{t.name}</span>
                    <span className="text-[10px] text-gray-500 font-mono">{t.category_name}</span>
                  </button>
                ))
              )}
            </div>
          </Group>
        </div>

        <div className="border-t border-black/10 p-4 flex gap-2">
          <button onClick={onClear} className="px-4 py-2 text-sm border border-black/10 hover:border-black"
                  data-testid="filters-clear-btn">Clear</button>
          <button onClick={() => onApply(local)}
                  className="flex-1 bg-[#0055FF] text-white px-4 py-2 text-sm font-bold hover:bg-[#0044cc] transition-colors"
                  data-testid="filters-apply-btn">
            Apply filters
          </button>
        </div>
      </aside>
    </div>
  );
}
function Group({ label, children }) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-widest font-bold text-gray-700 mb-1.5 block">
        {label}
      </label>
      {children}
    </div>
  );
}
