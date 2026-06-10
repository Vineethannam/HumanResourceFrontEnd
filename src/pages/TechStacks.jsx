import React, { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import AppShell from "@/components/AppShell";
import { api, formatApiErrorDetail } from "@/lib/api";
import { toast } from "sonner";

export default function TechStacks() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [filter, setFilter] = useState({ q: "", category_id: "" });

  const load = async () => {
    try {
      const qs = new URLSearchParams();
      if (filter.q) qs.set("q", filter.q);
      if (filter.category_id) qs.set("category_id", filter.category_id);
      const [t, c] = await Promise.all([
        api.get(`/tech-stacks?${qs.toString()}`),
        api.get("/categories"),
      ]);
      setItems(t.data); setCategories(c.data);
    } catch (e) { toast.error(formatApiErrorDetail(e.response?.data?.detail)); }
  };
  useEffect(() => { load(); }, [filter]);

  const create = async (e) => {
    e.preventDefault();
    if (!name.trim() || !categoryId) return;
    try {
      await api.post("/tech-stacks", { name, category_id: categoryId });
      toast.success("Tech stack added");
      setName("");
      load();
    } catch (err) { toast.error(formatApiErrorDetail(err.response?.data?.detail)); }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this tech stack?")) return;
    try { await api.delete(`/tech-stacks/${id}`); toast.success("Deleted"); load(); }
    catch (err) { toast.error(formatApiErrorDetail(err.response?.data?.detail)); }
  };

  return (
    <AppShell>
      <div className="max-w-[1100px] mx-auto px-6 py-8" data-testid="techstacks-page">
        <div className="mb-8 pb-6 border-b border-black/10">
          <div className="text-[10px] uppercase tracking-[0.25em] text-gray-500 mb-2">Settings · Tech Stack</div>
          <h1 className="font-display font-black tracking-tighter text-4xl">Tech Stacks</h1>
          <p className="text-sm text-gray-600 mt-2">
            Languages, frameworks and tools. These appear in the public application form and candidate filters.
          </p>
        </div>

        {categories.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 px-4 py-3 mb-6 text-sm text-yellow-800">
            Please create at least one Category before adding tech stacks.
          </div>
        )}

        <form onSubmit={create} className="bg-white border border-black/10 p-6 mb-8 grid grid-cols-1 md:grid-cols-3 gap-4 items-end" data-testid="techstack-form">
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold mb-1.5 block">Name *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required
                   placeholder="e.g. React"
                   className="w-full border border-black/10 px-3 py-2 text-sm focus:border-black outline-none"
                   data-testid="techstack-name-input" />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold mb-1.5 block">Category *</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required
                    className="w-full border border-black/10 px-3 py-2 text-sm focus:border-black outline-none bg-white"
                    data-testid="techstack-category-select">
              <option value="">Select category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <button type="submit" disabled={categories.length === 0}
                  className="bg-[#0055FF] text-white px-5 py-2.5 text-sm font-bold hover:bg-[#0044cc] disabled:bg-gray-300 flex items-center justify-center gap-2"
                  data-testid="techstack-submit-btn">
            <Plus size={14} /> Add Tech Stack
          </button>
        </form>

        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <input value={filter.q} onChange={(e) => setFilter({ ...filter, q: e.target.value })}
                 placeholder="Search tech stacks..."
                 className="border border-black/10 px-3 py-1.5 text-sm focus:border-black outline-none w-64"
                 data-testid="techstack-search" />
          <select value={filter.category_id} onChange={(e) => setFilter({ ...filter, category_id: e.target.value })}
                  className="border border-black/10 px-3 py-1.5 text-sm bg-white focus:border-black outline-none"
                  data-testid="techstack-filter-category">
            <option value="">All categories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <div className="ml-auto text-xs font-mono uppercase tracking-widest text-gray-500">{items.length} total</div>
        </div>

        <div className="bg-white border border-black/10">
          {items.length === 0 ? (
            <div className="px-6 py-16 text-center text-gray-400 italic">No tech stacks yet</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-black/10">
              {items.map((t) => (
                <div key={t.id} className="bg-white px-4 py-3 flex items-center justify-between" data-testid={`techstack-row-${t.id}`}>
                  <div>
                    <div className="font-medium text-sm">{t.name}</div>
                    <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mt-0.5">{t.category_name}</div>
                  </div>
                  <button onClick={() => remove(t.id)}
                          className="p-1.5 border border-black/10 hover:border-red-500 hover:text-red-500"
                          data-testid={`techstack-delete-${t.id}`}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
