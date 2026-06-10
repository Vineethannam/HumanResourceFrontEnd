import React from "react";
import { Link } from "react-router-dom";
import { Users, Shield, Link2, Tag, Code, ArrowRight } from "lucide-react";
import AppShell from "@/components/AppShell";
import { usePermission } from "@/lib/permissions";

const CARDS = [
  { to: "/admin/settings/users", title: "Users", desc: "Create and manage users who access this admin console. Assign roles and hierarchy.", icon: Users, key: "users", module: "users" },
  { to: "/admin/settings/roles", title: "Roles & Permissions", desc: "Define roles with granular module-level permissions: Create / Read / Update / Delete.", icon: Shield, key: "roles", module: "roles" },
  { to: "/admin/settings/invites", title: "Invites", desc: "Generate one-time application links to share with candidates. Single-use, revocable.", icon: Link2, key: "invites", module: "invites" },
  { to: "/admin/settings/categories", title: "Categories", desc: "Top-level groupings for tech stacks (e.g. Frontend, Backend, DevOps).", icon: Tag, key: "categories", module: "categories" },
  { to: "/admin/settings/tech-stacks", title: "Tech Stack", desc: "Tools, languages and frameworks assignable to candidates and applications.", icon: Code, key: "tech-stacks", module: "tech_stacks" },
];

export default function Settings() {
  return (
    <AppShell>
      <div className="max-w-[1400px] mx-auto px-6 py-10" data-testid="settings-page">
        <div className="mb-10">
          <div className="text-[10px] uppercase tracking-[0.25em] text-gray-500 mb-2">Workspace</div>
          <h1 className="font-display font-black tracking-tighter text-4xl sm:text-5xl">Settings</h1>
          <p className="text-gray-600 max-w-2xl mt-3">
            Configure your hiring workspace — users, roles, invites, and the tech taxonomy used across applications.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-black/10 border border-black/10">
          {CARDS.map((card) => <SettingsCard key={card.to} card={card} />)}
        </div>
      </div>
    </AppShell>
  );
}

function SettingsCard({ card }) {
  const { to, title, desc, icon: Icon, key, module } = card;
  const allowed = usePermission(module, "read");
  if (!allowed) {
    return (
      <div className="bg-white p-8 opacity-40 flex flex-col" data-testid={`settings-card-${key}-locked`}>
        <Icon size={24} className="mb-5 text-gray-400" />
        <h3 className="font-display font-bold text-xl tracking-tight mb-2">{title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed mb-6 flex-1">{desc}</p>
        <span className="inline-flex items-center gap-2 text-sm font-medium text-gray-400">
          No access
        </span>
      </div>
    );
  }
  return (
    <Link to={to}
          className="bg-white p-8 hover:bg-[#fafafa] transition-colors group flex flex-col"
          data-testid={`settings-card-${key}`}>
      <Icon size={24} className="mb-5 text-black group-hover:text-[#0055FF] transition-colors" />
      <h3 className="font-display font-bold text-xl tracking-tight mb-2">{title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed mb-6 flex-1">{desc}</p>
      <span className="inline-flex items-center gap-2 text-sm font-medium text-[#0055FF]">
        Explore <ArrowRight size={14} />
      </span>
    </Link>
  );
}
