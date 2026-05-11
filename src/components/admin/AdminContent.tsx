import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BookOpen, Globe, Hash, FileText, ChevronLeft, ChevronRight, Search, ExternalLink } from "lucide-react";

type PublishedRow = {
  id: string; title: string; type: "journal" | "conference"; status: string;
  doi: string | null; volume: string | null; issue: string | null; page_range: string | null;
  published_at: string | null; owner_id: string; keywords: string[];
  owner_name?: string;
};

const PAGE_SIZE = 10;

export function AdminContent() {
  const [rows, setRows] = useState<PublishedRow[] | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [editId, setEditId] = useState<string | null>(null);
  const [editDoi, setEditDoi] = useState("");
  const [editVolume, setEditVolume] = useState("");
  const [editIssue, setEditIssue] = useState("");
  const [editPages, setEditPages] = useState("");
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<{ published: number; withDoi: number; journals: number; conferences: number } | null>(null);

  async function loadStats() {
    const [pub, doi, jnl, conf] = await Promise.all([
      supabase.from("submissions").select("id", { count: "exact", head: true }).eq("status", "published"),
      supabase.from("submissions").select("id", { count: "exact", head: true }).eq("status", "published").not("doi", "is", null),
      supabase.from("submissions").select("id", { count: "exact", head: true }).eq("status", "published").eq("type", "journal"),
      supabase.from("submissions").select("id", { count: "exact", head: true }).eq("status", "published").eq("type", "conference"),
    ]);
    setStats({ published: pub.count ?? 0, withDoi: doi.count ?? 0, journals: jnl.count ?? 0, conferences: conf.count ?? 0 });
  }

  async function load() {
    let q = supabase.from("submissions")
      .select("id,title,type,status,doi,volume,issue,page_range,published_at,owner_id,keywords", { count: "exact" })
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);
    if (search.trim()) q = q.ilike("title", `%${search.trim()}%`);
    const { data, error, count } = await q;
    if (error) { toast.error(error.message); setRows([]); return; }
    const items = (data ?? []) as PublishedRow[];
    const ids = [...new Set(items.map((r) => r.owner_id))];
    if (ids.length) {
      const { data: profs } = await supabase.from("profiles").select("id, full_name").in("id", ids);
      const m = new Map((profs ?? []).map((p) => [p.id, p.full_name]));
      items.forEach((r) => { r.owner_name = m.get(r.owner_id) ?? ""; });
    }
    setRows(items); setTotal(count ?? 0);
  }

  useEffect(() => { loadStats(); }, []);
  useEffect(() => { load(); }, [page]); // eslint-disable-line
  useEffect(() => setPage(0), [search]);
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [search]); // eslint-disable-line

  function startEdit(r: PublishedRow) {
    setEditId(r.id); setEditDoi(r.doi ?? ""); setEditVolume(r.volume ?? ""); setEditIssue(r.issue ?? ""); setEditPages(r.page_range ?? "");
  }

  async function saveEdit() {
    if (!editId) return;
    setSaving(true);
    const { error } = await supabase.from("submissions").update({
      doi: editDoi || null, volume: editVolume || null, issue: editIssue || null, page_range: editPages || null,
    } as never).eq("id", editId);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Publication details updated"); setEditId(null); load();
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div><h1 className="font-display text-3xl font-bold text-primary">Published Content</h1><p className="mt-1 text-sm text-muted-foreground">Manage published articles, DOIs, volumes, and issues.</p></div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CStatCard icon={<BookOpen className="text-violet-500" size={20} />} label="Published" value={stats?.published ?? "—"} bg="bg-violet-50" />
        <CStatCard icon={<Globe className="text-blue-500" size={20} />} label="With DOI" value={stats?.withDoi ?? "—"} bg="bg-blue-50" />
        <CStatCard icon={<FileText className="text-emerald-500" size={20} />} label="Journal Articles" value={stats?.journals ?? "—"} bg="bg-emerald-50" />
        <CStatCard icon={<Hash className="text-amber-500" size={20} />} label="Conference Papers" value={stats?.conferences ?? "—"} bg="bg-amber-50" />
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border/60 bg-card p-3">
        <div className="relative flex-1 min-w-[200px]"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search published articles…" className="w-full rounded-lg border border-input bg-background py-2 pl-8 pr-3 text-sm" /></div>
      </div>

      {rows === null ? (<div className="rounded-2xl border border-border/60 bg-card p-8"><p className="text-sm text-muted-foreground">Loading…</p></div>) : rows.length === 0 ? (<div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center text-sm text-muted-foreground">No published content yet.</div>) : (
        <ul className="space-y-3">{rows.map((r) => (
          <li key={r.id} className="rounded-2xl border border-border/60 bg-card p-5 transition-all hover:shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{r.type}{r.volume ? ` · Vol. ${r.volume}` : ""}{r.issue ? `, No. ${r.issue}` : ""}</p>
                <p className="mt-1 font-display text-lg font-semibold text-foreground">{r.title}</p>
                <p className="text-xs text-muted-foreground">By {r.owner_name || "Unknown"} · Published {r.published_at ? new Date(r.published_at).toLocaleDateString() : "—"}</p>
                {r.doi && <p className="mt-1 inline-flex items-center gap-1 text-xs text-primary"><ExternalLink size={11} /> DOI: {r.doi}</p>}
                {r.keywords.length > 0 && <div className="mt-2 flex flex-wrap gap-1">{r.keywords.slice(0, 6).map((k) => <span key={k} className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-foreground/70">{k}</span>)}</div>}
              </div>
              <div className="flex flex-col gap-1.5 items-end">
                {r.page_range && <span className="text-xs text-muted-foreground">pp. {r.page_range}</span>}
                <span className="rounded-full bg-primary/15 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-primary">Published</span>
              </div>
            </div>

            {editId === r.id ? (
              <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4 animate-in slide-in-from-top-2 duration-200">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-primary">Edit Publication Details</p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <label className="block text-xs"><span className="mb-1 block uppercase tracking-wide text-muted-foreground">DOI</span><input value={editDoi} onChange={(e) => setEditDoi(e.target.value)} placeholder="10.xxxx/xxxxx" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" /></label>
                  <label className="block text-xs"><span className="mb-1 block uppercase tracking-wide text-muted-foreground">Volume</span><input value={editVolume} onChange={(e) => setEditVolume(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" /></label>
                  <label className="block text-xs"><span className="mb-1 block uppercase tracking-wide text-muted-foreground">Issue</span><input value={editIssue} onChange={(e) => setEditIssue(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" /></label>
                  <label className="block text-xs"><span className="mb-1 block uppercase tracking-wide text-muted-foreground">Pages</span><input value={editPages} onChange={(e) => setEditPages(e.target.value)} placeholder="1-15" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" /></label>
                </div>
                <div className="mt-3 flex gap-2">
                  <button onClick={saveEdit} disabled={saving} className="rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60">{saving ? "Saving…" : "Save"}</button>
                  <button onClick={() => setEditId(null)} className="rounded-full border border-border px-4 py-1.5 text-xs text-foreground/80 hover:border-primary">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="mt-3"><button onClick={() => startEdit(r)} className="rounded-full border border-border px-3 py-1 text-xs text-foreground/80 hover:border-primary hover:text-primary">Edit publication details</button></div>
            )}
          </li>
        ))}</ul>
      )}

      <div className="flex items-center justify-between text-sm">
        <p className="text-muted-foreground">{total} published</p>
        <div className="flex items-center gap-2">
          <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs disabled:opacity-40"><ChevronLeft size={14} /> Prev</button>
          <span className="text-xs text-muted-foreground">Page {page + 1} / {totalPages}</span>
          <button onClick={() => setPage((p) => (p + 1 < totalPages ? p + 1 : p))} disabled={page + 1 >= totalPages} className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs disabled:opacity-40">Next <ChevronRight size={14} /></button>
        </div>
      </div>
    </div>
  );
}

function CStatCard({ icon, label, value, bg }: { icon: React.ReactNode; label: string; value: number | string; bg: string }) {
  return (<div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"><div className="flex items-center gap-3"><div className={`flex h-10 w-10 items-center justify-center rounded-full ${bg}`}>{icon}</div><div><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p><p className="font-display text-2xl font-bold text-foreground">{value}</p></div></div></div>);
}
