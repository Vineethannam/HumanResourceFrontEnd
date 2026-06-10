import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, LayoutGrid, Users2, Workflow } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-[var(--nx-bg)]">
      {/* Top bar */}
      <div className="border-b border-black/10 bg-white">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-display font-black tracking-tighter text-xl" data-testid="landing-logo">
            NEXUS<span className="text-[#0055FF]">.</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium bg-black text-white hover:bg-black/80 transition-colors flex items-center gap-2"
              data-testid="landing-login-btn"
            >
              Admin Login <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="relative grid-bg noise-overlay">
        <div className="max-w-[1400px] mx-auto px-6 py-20 md:py-32 relative">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 border border-black/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] bg-white mb-8">
              <span className="w-1.5 h-1.5 bg-[#0055FF] inline-block" />
              Hiring CRM · HRM · Single Source of Truth
            </div>
            <h1 className="font-display font-black tracking-tighter leading-[0.95] text-5xl sm:text-7xl lg:text-8xl mb-8">
              Hire smart.<br />
              Onboard <span className="text-[#0055FF]">instantly</span>.<br />
              Retain forever.
            </h1>
            <p className="text-lg md:text-xl text-gray-700 max-w-2xl mb-10 leading-relaxed">
              Nexus is a scalable, professional-grade hiring pipeline and HRM system. Capture
              applicants, screen talent in a Kanban board, then promote them to employees with
              one magic click.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 bg-black text-white px-6 py-4 font-bold hover:bg-black/80 transition-colors"
                data-testid="hero-login-btn"
              >
                Admin sign in <ArrowRight size={16} />
              </Link>
            </div>
            <p className="mt-6 text-xs uppercase tracking-widest text-gray-500">
              Applications are invitation-only. Contact your hiring team for a personal link.
            </p>
          </div>
        </div>
      </section>

      {/* Stat strip */}
      <section className="border-y border-black/10 bg-white">
        <div className="max-w-[1400px] mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-black/10">
          {[
            ["5", "Pipeline stages"],
            ["4", "Departments"],
            ["1-click", "Promote to employee"],
            ["∞", "Candidates supported"],
          ].map(([v, k]) => (
            <div key={k} className="px-6 py-8">
              <div className="font-display font-black text-3xl md:text-4xl tracking-tighter">{v}</div>
              <div className="text-xs uppercase tracking-widest text-gray-500 mt-1">{k}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-[1400px] mx-auto px-6 py-20">
        <div className="grid md:grid-cols-3 gap-px bg-black/10 border border-black/10">
          {[
            {
              Icon: LayoutGrid,
              title: "Kanban Pipeline",
              body: "Drag candidates across Applied → Interviewing → Offered → Hired. Visual, opinionated, fast.",
            },
            {
              Icon: Sparkles,
              title: "Magic Onboarding",
              body: "One button closes the candidate record and creates an employee with inherited tech-stack & resume.",
            },
            {
              Icon: Users2,
              title: "Integrated HRM",
              body: "Your active team, post-hire. Departments, designations, salaries — all in one canonical place.",
            },
            {
              Icon: Workflow,
              title: "Interview Notes",
              body: "Capture structured feedback with 1–10 scoring. Notes auto-move candidates forward.",
            },
            {
              Icon: LayoutGrid,
              title: "Resume Preview",
              body: "Inline PDF preview inside the admin drawer — never download just to screen.",
            },
            {
              Icon: Users2,
              title: "Global Search",
              body: "One search bar, both databases. Find talent whether they're applicants or employees.",
            },
          ].map(({ Icon, title, body }) => (
            <div key={title} className="bg-white p-8 hover:bg-[#fafafa] transition-colors group">
              <Icon size={24} className="mb-5 text-black group-hover:text-[#0055FF] transition-colors" />
              <h3 className="font-display font-bold text-xl tracking-tight mb-2">{title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-black text-white">
        <div className="max-w-[1400px] mx-auto px-6 py-20 md:py-28 flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
          <div>
            <h2 className="font-display font-black tracking-tighter text-4xl md:text-6xl leading-[0.95] mb-4">
              Ready to stop<br />fragmenting your talent?
            </h2>
            <p className="text-gray-400 max-w-md">
              Share the apply link, let candidates come in, then run your whole pipeline from a single premium dashboard.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-[#0055FF] text-white px-6 py-4 font-bold hover:bg-[#0044cc] transition-colors"
              data-testid="cta-login-btn"
            >
              Open admin console <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-black/10 bg-white">
        <div className="max-w-[1400px] mx-auto px-6 py-8 flex items-center justify-between text-xs text-gray-500">
          <div>© {new Date().getFullYear()} Nexus — Hiring CRM & HRM</div>
          <div className="font-mono uppercase tracking-widest">v1.0</div>
        </div>
      </footer>
    </div>
  );
}
