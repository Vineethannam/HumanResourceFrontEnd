import React, { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate, Link } from "react-router-dom";
import {
  LayoutGrid, Users, Briefcase, Settings as SettingsIcon, Search, LogOut, Menu, Lock,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { usePermission } from "@/lib/permissions";

const NAV_ITEMS = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutGrid, key: "dashboard", module: null },
  { to: "/admin/candidates", label: "Candidates", icon: Users, key: "candidates", module: "candidates" },
  { to: "/admin/employees", label: "Employees", icon: Briefcase, key: "employees", module: "employees" },
  { to: "/admin/settings", label: "Settings", icon: SettingsIcon, key: "settings", module: null },
];

export default function AppShell({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState(null);
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    if (!q || q.length < 2) { setResults(null); return; }
    const t = setTimeout(async () => {
      try {
        const { data } = await api.get(`/search?q=${encodeURIComponent(q)}`);
        setResults(data); setOpen(true);
      } catch { setResults(null); }
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div className="min-h-screen flex bg-[var(--nx-bg)]">
      {/* Sidebar */}
      <aside
        className={`bg-black text-white flex flex-col transition-all duration-300 ${
          collapsed ? "w-16" : "w-60"
        } sticky top-0 h-screen`}
        data-testid="sidebar"
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
          {!collapsed && (
            <div className="font-display font-black tracking-tighter text-xl">
              NEXUS<span className="text-[#0055FF]">.</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 hover:bg-white/10 transition-colors"
            data-testid="sidebar-toggle"
          >
            <Menu size={16} />
          </button>
        </div>

        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <SidebarNavLink key={item.to} item={item} collapsed={collapsed} />
          ))}
        </nav>

        <div className="border-t border-white/10 p-3">
          {!collapsed && (
            <div className="mb-3">
              <div className="text-xs font-medium text-white truncate">{user?.name}</div>
              <div className="text-[10px] uppercase tracking-widest text-gray-500">
                {user?.role === "ADMIN" ? "ADMIN" : user?.role_name || "USER"}
              </div>
            </div>
          )}
          <NavLink
            to="/change-password"
            className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-300 hover:bg-white/10 hover:text-white transition-colors mb-1 ${
              collapsed ? "justify-center" : ""
            }`}
            data-testid="change-password-link"
            title="Change password"
          >
            <Lock size={14} />
            {!collapsed && <span>Change password</span>}
          </NavLink>
          <button
            onClick={logout}
            className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-300 hover:bg-white/10 hover:text-white transition-colors ${
              collapsed ? "justify-center" : ""
            }`}
            data-testid="logout-btn"
            title="Logout"
          >
            <LogOut size={14} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-black/10 sticky top-0 z-30 flex items-center px-6 gap-6">
          <div className="flex-1 max-w-xl relative" ref={boxRef}>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onFocus={() => results && setOpen(true)}
                placeholder="Search candidates & employees..."
                className="w-full bg-[#f1f1f3] border border-transparent focus:border-black focus:bg-white rounded-none pl-9 pr-3 py-2 text-sm outline-none transition-colors"
                data-testid="global-search-input"
              />
            </div>
            {open && results && (
              <div
                className="absolute top-full left-0 right-0 mt-1 bg-white border border-black/20 shadow-lg z-50 max-h-96 overflow-y-auto"
                data-testid="global-search-results"
              >
                <SearchSection
                  title="Candidates"
                  items={results.candidates}
                  onClick={(c) => { navigate(`/admin/candidates/${c.id}`); setOpen(false); setQ(""); }}
                  render={(c) => (
                    <>
                      <div className="font-medium text-sm">{c.full_name}</div>
                      <div className="text-xs text-gray-500">{c.email} · {c.status}</div>
                    </>
                  )}
                />
                <SearchSection
                  title="Employees"
                  items={results.employees}
                  onClick={(e) => { navigate(`/admin/employees?id=${e.id}`); setOpen(false); setQ(""); }}
                  render={(e) => (
                    <>
                      <div className="font-medium text-sm">{e.full_name} <span className="text-gray-400">· {e.emp_id_code}</span></div>
                      <div className="text-xs text-gray-500">{e.designation} · {e.department}</div>
                    </>
                  )}
                />
                {results.candidates.length === 0 && results.employees.length === 0 && (
                  <div className="px-4 py-3 text-sm text-gray-500">No results</div>
                )}
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

function SearchSection({ title, items, onClick, render }) {
  if (!items?.length) return null;
  return (
    <div>
      <div className="px-4 py-2 text-[10px] uppercase tracking-widest text-gray-500 bg-[#f7f7f8] border-b border-black/5">
        {title}
      </div>
      {items.map((it) => (
        <button
          key={it.id}
          onClick={() => onClick(it)}
          className="w-full text-left px-4 py-2 hover:bg-[#f7f7f8] border-b border-black/5 last:border-0 transition-colors"
        >
          {render(it)}
        </button>
      ))}
    </div>
  );
}
function SidebarNavLink({ item, collapsed }) {
  const Icon = item.icon;
  const allowed = usePermission(item.module, "read");
  if (item.module && !allowed) return null;
  return (
    <NavLink
      to={item.to}
      data-testid={`nav-${item.key}`}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all ${
          isActive ? "bg-white text-black" : "text-gray-400 hover:bg-white/10 hover:text-white"
        } ${collapsed ? "justify-center" : ""}`
      }
      title={collapsed ? item.label : ""}
    >
      <Icon size={18} />
      {!collapsed && <span>{item.label}</span>}
    </NavLink>
  );
}
