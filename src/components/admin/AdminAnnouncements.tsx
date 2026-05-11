import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Megaphone, Plus, Trash2, Edit3, Send, X } from "lucide-react";

type Announcement = {
  key: string;
  value: {
    title: string;
    body: string;
    type: "info" | "warning" | "call_for_papers";
    active: boolean;
    created_at: string;
    created_by?: string;
  };
};

const ANNOUNCEMENT_TYPES = [
  { value: "info", label: "Information", color: "bg-blue-100 text-blue-800" },
  { value: "warning", label: "Important Notice", color: "bg-amber-100 text-amber-800" },
  { value: "call_for_papers", label: "Call for Papers", color: "bg-emerald-100 text-emerald-800" },
];

export function AdminAnnouncements() {
  const { user } = useAuth();
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editKey, setEditKey] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", body: "", type: "info" as string, active: true });
  const [saving, setSaving] = useState(false);

  async function load() {
    const { data, error } = await supabase.from("app_settings").select("key, value").like("key", "announcement_%").order("key");
    if (error) { toast.error(error.message); setLoading(false); return; }
    setItems((data ?? []).map((d) => ({ key: d.key, value: d.value as Announcement["value"] })));
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function startNew() {
    setEditKey(null); setForm({ title: "", body: "", type: "info", active: true }); setShowForm(true);
  }

  function startEdit(a: Announcement) {
    setEditKey(a.key); setForm({ title: a.value.title, body: a.value.body, type: a.value.type, active: a.value.active }); setShowForm(true);
  }

  async function save() {
    if (!form.title.trim() || !form.body.trim()) { toast.error("Title and body are required"); return; }
    setSaving(true);
    const key = editKey ?? `announcement_${Date.now()}`;
    const value = { title: form.title.trim(), body: form.body.trim(), type: form.type, active: form.active, created_at: new Date().toISOString(), created_by: user?.id };
    const { error } = await supabase.from("app_settings").upsert({ key, value: value as never, updated_at: new Date().toISOString() });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(editKey ? "Announcement updated" : "Announcement created");
    setShowForm(false); load();
  }

  async function remove(key: string) {
    if (!confirm("Delete this announcement?")) return;
    const { error } = await supabase.from("app_settings").delete().eq("key", key);
    if (error) return toast.error(error.message);
    toast.success("Announcement deleted"); load();
  }

  async function toggleActive(a: Announcement) {
    const val = { ...a.value, active: !a.value.active };
    const { error } = await supabase.from("app_settings").update({ value: val as never, updated_at: new Date().toISOString() }).eq("key", a.key);
    if (error) return toast.error(error.message);
    toast.success(val.active ? "Activated" : "Deactivated"); load();
  }

  const typeColor = (t: string) => ANNOUNCEMENT_TYPES.find((at) => at.value === t)?.color ?? "bg-muted text-foreground/70";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="font-display text-3xl font-bold text-primary">Announcements</h1><p className="mt-1 text-sm text-muted-foreground">Manage site-wide announcements and calls for papers.</p></div>
        <button onClick={startNew} className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"><Plus size={15} /> New Announcement</button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-primary/30 bg-card p-6 shadow-sm animate-in slide-in-from-top-3 duration-300">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold text-primary">{editKey ? "Edit Announcement" : "New Announcement"}</h3>
            <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2"><label className="block text-xs"><span className="mb-1 block uppercase tracking-wide text-muted-foreground">Title</span><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="Announcement title…" /></label></div>
            <div className="sm:col-span-2"><label className="block text-xs"><span className="mb-1 block uppercase tracking-wide text-muted-foreground">Body</span><textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={4} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="Full announcement text…" /></label></div>
            <label className="block text-xs"><span className="mb-1 block uppercase tracking-wide text-muted-foreground">Type</span><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">{ANNOUNCEMENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</select></label>
            <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="rounded border-border" /><span>Active (visible on site)</span></label>
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={save} disabled={saving} className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"><Send size={12} />{saving ? "Saving…" : "Publish"}</button>
            <button onClick={() => setShowForm(false)} className="rounded-full border border-border px-4 py-2 text-xs text-foreground/80 hover:border-primary">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (<div className="rounded-2xl border border-border/60 bg-card p-8"><p className="text-sm text-muted-foreground">Loading…</p></div>) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
          <Megaphone className="mx-auto mb-3 text-muted-foreground" size={32} />
          <p className="text-sm text-muted-foreground">No announcements yet.</p>
          <button onClick={startNew} className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"><Plus size={15} /> Create first announcement</button>
        </div>
      ) : (
        <ul className="space-y-3">{items.map((a) => (
          <li key={a.key} className={`rounded-2xl border bg-card p-5 transition-all hover:shadow-sm ${a.value.active ? "border-border/60" : "border-dashed border-border/40 opacity-60"}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${typeColor(a.value.type)}`}>{a.value.type.replace("_", " ")}</span>
                  {!a.value.active && <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-foreground/50">Inactive</span>}
                </div>
                <p className="mt-2 font-display text-lg font-semibold text-foreground">{a.value.title}</p>
                <p className="mt-1 text-sm text-foreground/80 line-clamp-2">{a.value.body}</p>
                <p className="mt-2 text-[11px] text-muted-foreground">Created {new Date(a.value.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => toggleActive(a)} className={`rounded-full border px-3 py-1 text-xs ${a.value.active ? "border-amber-300 text-amber-700 hover:bg-amber-50" : "border-emerald-300 text-emerald-700 hover:bg-emerald-50"}`}>{a.value.active ? "Deactivate" : "Activate"}</button>
                <button onClick={() => startEdit(a)} className="rounded-full border border-border px-3 py-1 text-xs text-foreground/80 hover:border-primary hover:text-primary"><Edit3 size={12} /></button>
                <button onClick={() => remove(a.key)} className="rounded-full border border-border px-3 py-1 text-xs text-foreground/80 hover:border-destructive hover:text-destructive"><Trash2 size={12} /></button>
              </div>
            </div>
          </li>
        ))}</ul>
      )}
    </div>
  );
}
