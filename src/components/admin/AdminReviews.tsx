import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Users, Clock, CheckCircle2, AlertCircle, Search, ChevronLeft, ChevronRight } from "lucide-react";

type ReviewRow = {
  id: string; reviewer_id: string; submission_id: string; status: string; created_at: string;
  notes: string | null; reviewer_name?: string; reviewer_email?: string; submission_title?: string;
};

const PAGE_SIZE = 12;

export function AdminReviews() {
  const [rows, setRows] = useState<ReviewRow[] | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<{ total: number; pending: number; completed: number; declined: number } | null>(null);

  async function loadStats() {
    const [tot, pend, comp, dec] = await Promise.all([
      supabase.from("submission_reviewers").select("id", { count: "exact", head: true }),
      supabase.from("submission_reviewers").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("submission_reviewers").select("id", { count: "exact", head: true }).eq("status", "completed"),
      supabase.from("submission_reviewers").select("id", { count: "exact", head: true }).eq("status", "declined"),
    ]);
    setStats({ total: tot.count ?? 0, pending: pend.count ?? 0, completed: comp.count ?? 0, declined: dec.count ?? 0 });
  }

  async function load() {
    let q = supabase.from("submission_reviewers")
      .select("id,reviewer_id,submission_id,status,created_at,notes", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);
    if (filter !== "all") q = q.eq("status", filter);
    const { data, error, count } = await q;
    if (error) { toast.error(error.message); setRows([]); return; }
    const items = (data ?? []) as ReviewRow[];

    // Enrich with profiles
    const revIds = [...new Set(items.map((r) => r.reviewer_id))];
    if (revIds.length) {
      const { data: profs } = await supabase.from("profiles").select("id, full_name, email").in("id", revIds);
      const m = new Map((profs ?? []).map((p) => [p.id, p]));
      items.forEach((r) => { const p = m.get(r.reviewer_id); r.reviewer_name = p?.full_name ?? ""; r.reviewer_email = p?.email ?? ""; });
    }

    // Enrich with submission titles
    const subIds = [...new Set(items.map((r) => r.submission_id))];
    if (subIds.length) {
      const { data: subs } = await supabase.from("submissions").select("id, title").in("id", subIds);
      const sm = new Map((subs ?? []).map((s) => [s.id, s.title]));
      items.forEach((r) => { r.submission_title = sm.get(r.submission_id) ?? "Unknown"; });
    }

    setRows(items); setTotal(count ?? 0);
  }

  useEffect(() => { loadStats(); }, []);
  useEffect(() => { load(); }, [filter, page]); // eslint-disable-line
  useEffect(() => setPage(0), [filter, search]);
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [search]); // eslint-disable-line

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from("submission_reviewers").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Review ${status}`); load(); loadStats();
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const statusStyle = (s: string) => s === "completed" ? "bg-emerald-100 text-emerald-800" : s === "declined" ? "bg-rose-100 text-rose-800" : s === "in_progress" ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div><h1 className="font-display text-3xl font-bold text-primary">Review Management</h1><p className="mt-1 text-sm text-muted-foreground">Track and manage peer review assignments and progress.</p></div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <RStatCard icon={<Users className="text-blue-500" size={20} />} label="Total Assignments" value={stats?.total ?? "—"} bg="bg-blue-50" />
        <RStatCard icon={<Clock className="text-amber-500" size={20} />} label="Pending" value={stats?.pending ?? "—"} bg="bg-amber-50" />
        <RStatCard icon={<CheckCircle2 className="text-emerald-500" size={20} />} label="Completed" value={stats?.completed ?? "—"} bg="bg-emerald-50" />
        <RStatCard icon={<AlertCircle className="text-rose-500" size={20} />} label="Declined" value={stats?.declined ?? "—"} bg="bg-rose-50" />
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border/60 bg-card p-3">
        <div className="flex items-center gap-1.5">
          {["all", "pending", "in_progress", "completed", "declined"].map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={`rounded-full px-3 py-1 text-xs capitalize ${filter === s ? "bg-primary text-primary-foreground" : "border border-border text-foreground/80 hover:border-primary"}`}>{s.replace("_", " ")}</button>
          ))}
        </div>
      </div>

      {rows === null ? (<div className="rounded-2xl border border-border/60 bg-card p-8"><p className="text-sm text-muted-foreground">Loading…</p></div>) : rows.length === 0 ? (<div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center text-sm text-muted-foreground">No review assignments found.</div>) : (
        <ul className="space-y-3">{rows.map((r) => (
          <li key={r.id} className="rounded-2xl border border-border/60 bg-card p-5 transition-all hover:shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-display text-base font-semibold text-foreground">{r.submission_title}</p>
                <p className="mt-1 text-xs text-muted-foreground">Reviewer: <span className="font-medium text-foreground/80">{r.reviewer_name || r.reviewer_email || r.reviewer_id.slice(0, 8)}</span></p>
                <p className="text-[11px] text-muted-foreground">Assigned {new Date(r.created_at).toLocaleDateString()}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-wide ${statusStyle(r.status)}`}>{r.status.replace("_", " ")}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {r.status !== "completed" && <button onClick={() => updateStatus(r.id, "completed")} className="rounded-full border border-emerald-300 px-3 py-1 text-xs text-emerald-700 hover:bg-emerald-50">Mark Completed</button>}
              {r.status !== "in_progress" && r.status !== "completed" && <button onClick={() => updateStatus(r.id, "in_progress")} className="rounded-full border border-blue-300 px-3 py-1 text-xs text-blue-700 hover:bg-blue-50">In Progress</button>}
              {r.status !== "declined" && <button onClick={() => updateStatus(r.id, "declined")} className="rounded-full border border-rose-300 px-3 py-1 text-xs text-rose-700 hover:bg-rose-50">Decline</button>}
              {r.status !== "pending" && <button onClick={() => updateStatus(r.id, "pending")} className="rounded-full border border-border px-3 py-1 text-xs text-foreground/70 hover:border-primary">Reset</button>}
            </div>
          </li>
        ))}</ul>
      )}

      <div className="flex items-center justify-between text-sm">
        <p className="text-muted-foreground">{total} total</p>
        <div className="flex items-center gap-2">
          <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs disabled:opacity-40"><ChevronLeft size={14} /> Prev</button>
          <span className="text-xs text-muted-foreground">Page {page + 1} / {totalPages}</span>
          <button onClick={() => setPage((p) => (p + 1 < totalPages ? p + 1 : p))} disabled={page + 1 >= totalPages} className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs disabled:opacity-40">Next <ChevronRight size={14} /></button>
        </div>
      </div>
    </div>
  );
}

function RStatCard({ icon, label, value, bg }: { icon: React.ReactNode; label: string; value: number | string; bg: string }) {
  return (<div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"><div className="flex items-center gap-3"><div className={`flex h-10 w-10 items-center justify-center rounded-full ${bg}`}>{icon}</div><div><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p><p className="font-display text-2xl font-bold text-foreground">{value}</p></div></div></div>);
}
