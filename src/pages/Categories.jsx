import React, { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import AppShell from "@/components/AppShell";
import { api, formatApiErrorDetail } from "@/lib/api";
import { toast } from "sonner";

export default function Categories() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const load = async () => {
    try { const { data } = await api.get("/categories"); setItems(data); }
    catch (e) { toast.error(formatApiErrorDetail(e.response?.data?.detail)); }
  };
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await api.post("/categories", { name, description });
      toast.success("Category created");
      setName(""); setDescription("");
      load();
    } catch (err) { toast.error(formatApiErrorDetail(err.response?.data?.detail)); }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this category? All tech stacks under it will also be removed.")) return;
    try { await api.delete(`/categories/${id}`); toast.success("Deleted"); load(); }
    catch (err) { toast.error(formatApiErrorDetail(err.response?.data?.detail)); }
  };

  return (
    <AppShell>
      <div className="max-w-[1100px] mx-auto px-6 py-8" data-testid="categories-page">
        <div className="mb-8 pb-6 border-b border-black/10">
          <div className="text-[10px] uppercase tracking-[0.25em] text-gray-500 mb-2">Settings · Categories</div>
          <h1 className="font-display font-black tracking-tighter text-4xl">Categories</h1>
          <p className="text-sm text-gray-600 mt-2">
            Top-level groupings for tech stacks. Create categories first, then add tech stacks under them.
          </p>
        </div>

        <form onSubmit={create} className="bg-white border border-black/10 p-6 mb-8 grid grid-cols-1 md:grid-cols-3 gap-4 items-end" data-testid="category-form">
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold mb-1.5 block">Name *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required
                   placeholder="e.g. Frontend"
                   className="w-full border border-black/10 px-3 py-2 text-sm focus:border-black outline-none"
                   data-testid="category-name-input" />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold mb-1.5 block">Description</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)}
                   placeholder="optional"
                   className="w-full border border-black/10 px-3 py-2 text-sm focus:border-black outline-none"
                   data-testid="category-description-input" />
          </div>
          <button type="submit" className="bg-[#0055FF] text-white px-5 py-2.5 text-sm font-bold hover:bg-[#0044cc] flex items-center justify-center gap-2"
                  data-testid="category-submit-btn">
            <Plus size={14} /> Add Category
          </button>
        </form>

        <div className="bg-white border border-black/10">
          <div className="px-6 py-3 border-b border-black/10 bg-[#f7f7f8] text-[10px] uppercase tracking-widest font-bold">
            {items.length} categories
          </div>
          {items.length === 0 ? (
            <div className="px-6 py-16 text-center text-gray-400 italic">No categories yet</div>
          ) : items.map((c) => (
            <div key={c.id} className="px-6 py-4 flex items-center justify-between border-b border-black/5 last:border-0 hover:bg-[#fafafa]"
                 data-testid={`category-row-${c.id}`}>
              <div>
                <div className="font-medium text-sm">{c.name}</div>
                {c.description && <div className="text-xs text-gray-500 mt-0.5">{c.description}</div>}
              </div>
              <button onClick={() => remove(c.id)}
                      className="p-1.5 border border-black/10 hover:border-red-500 hover:text-red-500"
                      data-testid={`category-delete-${c.id}`}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
