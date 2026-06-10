import React, { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Filter, X, Power, FileText, Download } from "lucide-react";
import AppShell from "@/components/AppShell";
import { api, formatApiErrorDetail } from "@/lib/api";
import { toast } from "sonner";

const DEPARTMENTS = [
  { key: null, label: "All" },
  { key: "TECH", label: "Tech" },
  { key: "OPS", label: "Ops" },
  { key: "HR", label: "HR" },
  { key: "SALES", label: "Sales" },
];

export default function Employees() {
  const [params, setParams] = useSearchParams();
  const [employees, setEmployees] = useState([]);
  const [filter, setFilter] = useState({ department: null, q: "" });
  const [selectedId, setSelectedId] = useState(params.get("id"));

  const load = useCallback(async () => {
    const qs = new URLSearchParams();
    if (filter.department) qs.set("department", filter.department);
    if (filter.q) qs.set("q", filter.q);
    try {
      const { data } = await api.get(`/employees?${qs.toString()}`);
      setEmployees(data);
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail));
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const id = params.get("id");
    if (id) setSelectedId(id);
  }, [params]);

  const toggleActive = async (emp, e) => {
    e.stopPropagation();
    try {
      await api.patch(`/employees/${emp.id}/status`, { active_status: !emp.active_status });
      setEmployees((list) =>
        list.map((x) => (x.id === emp.id ? { ...x, active_status: !emp.active_status } : x))
      );
      toast.success(`${emp.full_name} is now ${!emp.active_status ? "Active" : "Inactive"}`);
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail));
    }
  };

  return (
    <AppShell>
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="employees-page">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-gray-500 mb-2">Human Resources</div>
            <h1 className="font-display font-black tracking-tighter text-4xl sm:text-5xl">Employees</h1>
          </div>
          <div className="text-xs font-mono uppercase tracking-widest text-gray-500">
            {employees.length} records
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-6 pb-4 border-b border-black/10">
          <div className="inline-flex items-center gap-2 text-xs uppercase font-bold tracking-widest text-gray-500">
            <Filter size={14} /> Department
          </div>
          {DEPARTMENTS.map((d) => (
            <button
              key={d.label}
              onClick={() => setFilter({ ...filter, department: d.key })}
              className={`text-xs font-medium px-3 py-1.5 border transition-all ${
                filter.department === d.key ? "bg-black text-white border-black" : "bg-white border-black/10 hover:border-black"
              }`}
              data-testid={`emp-dept-${d.key ?? "all"}`}
            >
              {d.label}
            </button>
          ))}
          <div className="relative ml-auto">
            <input
              placeholder="Search employees..."
              value={filter.q}
              onChange={(e) => setFilter({ ...filter, q: e.target.value })}
              className="border border-black/10 bg-white px-3 py-1.5 text-sm focus:border-black outline-none w-64"
              data-testid="employees-search"
            />
            {filter.q && (
              <button
                onClick={() => setFilter({ ...filter, q: "" })}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="bg-white border border-black/10 overflow-hidden">
          <table className="w-full" data-testid="employees-table">
            <thead>
              <tr className="border-b border-black/10 bg-[#f7f7f8] text-[10px] uppercase tracking-widest">
                <Th>Employee</Th>
                <Th>ID</Th>
                <Th>Designation</Th>
                <Th>Department</Th>
                <Th>Joined</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-sm text-gray-400 italic">
                    No employees yet. Onboard a hired candidate from the Kanban board.
                  </td>
                </tr>
              ) : (
                employees.map((e) => (
                  <tr
                    key={e.id}
                    onClick={() => setSelectedId(e.id)}
                    className={`border-b border-black/5 last:border-0 cursor-pointer transition-colors ${
                      selectedId === e.id ? "bg-[#f7f7f8]" : "hover:bg-[#fafafa]"
                    }`}
                    data-testid={`employee-row-${e.id}`}
                  >
                    <Td>
                      <div className="font-medium">{e.full_name}</div>
                      <div className="text-xs text-gray-500">{e.email}</div>
                    </Td>
                    <Td mono>{e.emp_id_code}</Td>
                    <Td>{e.designation}</Td>
                    <Td>
                      <span className="text-xs font-medium px-2 py-0.5 bg-black/5 border border-black/10">
                        {e.department}
                      </span>
                    </Td>
                    <Td mono>{e.joining_date}</Td>
                    <Td>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 ${
                          e.active_status ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {e.active_status ? "Active" : "Inactive"}
                      </span>
                    </Td>
                    <Td>
                      <button
                        onClick={(ev) => toggleActive(e, ev)}
                        className="p-1.5 border border-black/10 hover:border-black transition-colors"
                        title="Toggle active"
                        data-testid={`toggle-active-${e.id}`}
                      >
                        <Power size={14} />
                      </button>
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {selectedId && <EmployeeDrawer id={selectedId} onClose={() => setSelectedId(null)} />}
      </main>
    </AppShell>
  );
}

function Th({ children }) {
  return <th className="px-6 py-3 text-left font-bold text-gray-600">{children}</th>;
}
function Td({ children, mono }) {
  return <td className={`px-6 py-4 text-sm ${mono ? "font-mono" : ""}`}>{children}</td>;
}

function EmployeeDrawer({ id, onClose }) {
  const [emp, setEmp] = useState(null);
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/employees/${id}`);
        setEmp(data);
      } catch (e) {
        toast.error(formatApiErrorDetail(e.response?.data?.detail));
      }
    })();
  }, [id]);

  if (!emp) return null;

  return (
    <div className="fixed inset-0 z-50 flex" data-testid="employee-drawer">
      <div className="flex-1 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <aside className="w-full max-w-xl bg-white border-l border-black/10 shadow-2xl overflow-y-auto nx-fade-up">
        <div className="sticky top-0 bg-white border-b border-black/10 px-6 py-4 flex items-start justify-between z-10">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-gray-500">
              Employee · {emp.emp_id_code}
            </div>
            <h2 className="font-display font-bold text-2xl tracking-tight mt-1">{emp.full_name}</h2>
            <div className="text-sm text-gray-600 mt-1">
              {emp.designation} · {emp.department}
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100" data-testid="emp-drawer-close">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-px bg-black/10 border border-black/10">
            <KV label="Email" value={emp.email} />
            <KV label="Phone" value={emp.phone} />
            <KV label="Joined" value={emp.joining_date} mono />
            <KV label="Salary" value={emp.salary_details} />
            <KV label="Status" value={emp.active_status ? "Active" : "Inactive"} />
            <KV label="Department" value={emp.department} />
          </div>
          {emp.tech_stack?.length > 0 && (
            <div>
              <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">Tech stack</div>
              <div className="flex flex-wrap gap-1.5">
                {emp.tech_stack.map((t) => (
                  <span key={t} className="text-xs px-2 py-1 bg-black text-white">{t}</span>
                ))}
              </div>
            </div>
          )}
          {emp.resume_base64 && (
            <div>
              <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-2 flex items-center gap-2">
                <FileText size={12} /> Resume
              </div>
              <div className="border border-black/10">
                <div className="flex items-center justify-between px-3 py-2 bg-[#f7f7f8] border-b border-black/10">
                  <span className="text-xs font-mono truncate">{emp.resume_filename}</span>
                  <a
                    href={`data:application/pdf;base64,${emp.resume_base64}`}
                    download={emp.resume_filename}
                    className="text-xs flex items-center gap-1 hover:underline"
                  >
                    <Download size={12} /> Download
                  </a>
                </div>
                <iframe
                  title="Employee resume"
                  src={`data:application/pdf;base64,${emp.resume_base64}`}
                  className="w-full h-[400px]"
                />
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

function KV({ label, value, mono }) {
  return (
    <div className="bg-white p-4">
      <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">{label}</div>
      <div className={`text-sm ${mono ? "font-mono" : ""}`}>{value}</div>
    </div>
  );
}
