import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Search, Filter, ChevronLeft, ChevronRight, MessageSquare, UserCog, CreditCard, FileStack, Clock, CheckCircle2, Trash2 } from "lucide-react";
import { AdminCommentsThread } from "./AdminCommentsThread";
import { ReviewersAssign } from "./ReviewersAssign";

type SubmissionRow = {
  id: string; title: string; type: string; status: string; payment_status: string;
  conference_stage: string | null; owner_id: string; created_at: string;
  updated_at: string; submitted_at: string | null;
  owner_name?: string; owner_email?: string;
};

const PAGE_SIZE = 10;
const STATUSES = ["draft", "submitted", "under_review", "revisions_requested", "accepted", "rejected", "withdrawn", "published"];
const statusStyles: Record<string, string> = { draft: "bg-muted text-foreground/70", submitted: "bg-blue-100 text-blue-800", under_review: "bg-amber-100 text-amber-800", revisions_requested: "bg-orange-100 text-orange-800", accepted: "bg-emerald-100 text-emerald-800", rejected: "bg-rose-100 text-rose-800", withdrawn: "bg-slate-200 text-slate-700", published: "bg-primary/15 text-primary" };

export function SubmissionsTab({ onDetail }: { onDetail: (s: SubmissionRow) => void }) {
  const [rows, setRows] = useState<SubmissionRow[] | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"updated_at" | "created_at" | "title">("updated_at");
  const [dir, setDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [openId, setOpenId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { user } = useAuth();

  async function load() {
    let q = supabase.from("submissions")
      .select("id,title,type,status,payment_status,conference_stage,owner_id,created_at,updated_at,submitted_at", { count: "exact" })
      .order(sort, { ascending: dir === "asc" })
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);
    
    if (filter !== "all") q = q.eq("status", filter as never);
    
    if (search.trim()) {
      const s = search.trim();
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s) || s.length === 36) {
        q = q.eq("id", s);
      } else {
        // Search by title or type or author name
        const { data: profs } = await supabase.from("profiles").select("id").ilike("full_name", `%${s}%`);
        const pIds = (profs ?? []).map(p => p.id);
        if (pIds.length) {
          q = q.or(`title.ilike.%${s}%,owner_id.in.(${pIds.join(",")})`);
        } else {
          q = q.or(`title.ilike.%${s}%`);
        }
      }
    }
    const { data, error, count } = await q;
    if (error) { toast.error(error.message); setRows([]); return; }
    const subs = (data ?? []) as SubmissionRow[];
    
    // Fetch owner details
    const ownerIds = [...new Set(subs.map(s => s.owner_id))];
    if (ownerIds.length) {
      const { data: profs } = await supabase.from("profiles").select("id, full_name, email").in("id", ownerIds);
      const m = new Map((profs ?? []).map(p => [p.id, p]));
      subs.forEach(s => {
        const p = m.get(s.owner_id);
        s.owner_name = p?.full_name ?? "Unknown";
        s.owner_email = p?.email ?? "";
      });
    }

    setRows(subs);
    setTotal(count ?? 0);
  }

  useEffect(() => { load(); setSelectedIds([]); }, [filter, sort, dir, page]); // eslint-disable-line
  useEffect(() => { setPage(0); setSelectedIds([]); }, [filter, search]);
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [search]); // eslint-disable-line

  async function changeStatus(row: SubmissionRow, next: string) {
    const progressing = ["under_review", "revisions_requested", "accepted", "published"].includes(next);
    if (progressing && row.payment_status !== "confirmed") {
      return toast.error("Payment must be confirmed before proceeding.");
    }
    const { error } = await supabase.from("submissions").update({ status: next as never, ...(next === "published" ? { published_at: new Date().toISOString() } : {}) }).eq("id", row.id);
    if (error) return toast.error(error.message);
    toast.success(`Marked ${next.replaceAll("_", " ")}`); load();
  }

  async function changePayment(row: SubmissionRow, next: "pending" | "confirmed" | "rejected") {
    const { error } = await supabase.from("submissions").update({ payment_status: next as never }).eq("id", row.id);
    if (error) return toast.error(error.message);
    toast.success(`Payment ${next}`); load();
  }

  async function bulkUpdateStatus(next: string) {
    if (!selectedIds.length) return;
    
    const progressing = ["under_review", "revisions_requested", "accepted", "published"].includes(next);
    if (progressing) {
      const nonPaid = rows?.filter(r => selectedIds.includes(r.id) && r.payment_status !== "confirmed");
      if (nonPaid?.length) {
        return toast.error(`${nonPaid.length} selected items have unconfirmed payments. Please confirm them first.`);
      }
    }

    const { error } = await supabase.from("submissions").update({ status: next as any, ...(next === "published" ? { published_at: new Date().toISOString() } : {}) }).in("id", selectedIds);
    if (error) return toast.error(error.message);
    toast.success(`Updated ${selectedIds.length} items to ${next}`);
    setSelectedIds([]);
    load();
  }

  async function deleteSubmission(id: string, title: string) {
    if (!confirm(`Are you sure you want to PERMANENTLY delete "${title}"? This cannot be undone.`)) return;
    const { error } = await supabase.from("submissions").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Submission deleted permanently");
    load();
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === rows?.length) setSelectedIds([]);
    else setSelectedIds(rows?.map(r => r.id) ?? []);
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl glass-card p-4 reveal-anim">
        <div className="relative flex-1 min-w-[280px]">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" />
          <input 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            placeholder="Search by title, ID or author name…" 
            className="w-full rounded-xl border-none bg-primary/5 py-3 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all" 
          />
        </div>
        <select 
          value={`${sort}:${dir}`} 
          onChange={(e) => { const [s, d] = e.target.value.split(":") as [typeof sort, typeof dir]; setSort(s); setDir(d); }} 
          className="rounded-xl border border-border/60 bg-background px-4 py-3 text-xs font-bold uppercase tracking-wider text-primary/80 focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
        >
          <option value="updated_at:desc">Recently updated</option>
          <option value="created_at:desc">Newest first</option>
          <option value="created_at:asc">Oldest first</option>
          <option value="title:asc">Title A→Z</option>
          <option value="title:desc">Title Z→A</option>
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-2xl glass-card p-4 reveal-anim" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center gap-2 mr-2">
          <Filter size={14} className="text-primary/60" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40">Status</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Pill active={filter === "all"} onClick={() => setFilter("all")}>All</Pill>
          {STATUSES.map((s) => <Pill key={s} active={filter === s} onClick={() => setFilter(s)}>{s.replaceAll("_", " ")}</Pill>)}
        </div>
      </div>

      {rows === null ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground animate-pulse">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary mb-4" />
          <p className="text-sm font-bold uppercase tracking-widest">Loading Submissions…</p>
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-border/60 bg-card/50 p-20 text-center reveal-anim">
          <FileStack className="mx-auto mb-4 text-primary/20" size={48} />
          <p className="text-lg font-bold text-foreground">No submissions found</p>
          <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters or search query.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Bulk Action Bar */}
          {selectedIds.length > 0 && (
            <div className="sticky top-20 z-30 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-primary px-6 py-4 text-white shadow-2xl animate-in slide-in-from-top-4 duration-300">
              <div className="flex items-center gap-4">
                <input 
                  type="checkbox" 
                  checked={selectedIds.length === rows.length} 
                  onChange={toggleSelectAll}
                  className="h-5 w-5 rounded border-white/30 bg-white/20 text-white focus:ring-white/50"
                />
                <p className="text-sm font-black uppercase tracking-widest">{selectedIds.length} items selected</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <select 
                  onChange={(e) => e.target.value && bulkUpdateStatus(e.target.value)}
                  className="rounded-full bg-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white border border-white/20 hover:bg-white/20 transition-all cursor-pointer outline-none"
                >
                  <option value="" className="text-black">Change Status…</option>
                  {STATUSES.map(s => <option key={s} value={s} className="text-black">{s.replace('_', ' ')}</option>)}
                </select>
                <select 
                  onChange={(e) => e.target.value && bulkUpdatePayment(e.target.value)}
                  className="rounded-full bg-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white border border-white/20 hover:bg-white/20 transition-all cursor-pointer outline-none"
                >
                  <option value="" className="text-black">Payment Status…</option>
                  <option value="pending" className="text-black">Pending</option>
                  <option value="confirmed" className="text-black">Confirmed</option>
                  <option value="rejected" className="text-black">Rejected</option>
                </select>
                <button 
                  onClick={() => setSelectedIds([])}
                  className="rounded-full bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-white/90 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <ul className="grid gap-4 reveal-anim" style={{ animationDelay: '0.2s' }}>
            {rows.map((r, idx) => (
              <li 
                key={r.id} 
                className={`group relative rounded-3xl border transition-all duration-300 hover:scale-[1.01] cursor-pointer premium-shadow overflow-hidden ${
                  selectedIds.includes(r.id) 
                    ? "border-primary bg-primary/[0.03]" 
                    : "glass-card border-transparent hover:border-primary/50"
                }`} 
                onClick={() => onDetail(r)}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10 px-6 py-6">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="pt-1" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(r.id)} 
                        onChange={() => toggleSelect(r.id)}
                        className="h-5 w-5 rounded border-border bg-background text-primary focus:ring-primary/20 transition-all"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/50">
                          {r.type}{r.conference_stage ? ` · ${r.conference_stage.replaceAll("_", " ")}` : ""}
                        </span>
                        <span className="text-[10px] font-bold text-muted-foreground">ID: {r.id.slice(0, 8)}</span>
                        <span className="h-1 w-1 rounded-full bg-border" />
                        <span className="text-[10px] font-bold text-primary/70">{r.owner_name}</span>
                      </div>
                      <Link 
                        to="/submissions/$id" 
                        params={{ id: r.id }} 
                        onClick={(e) => e.stopPropagation()} 
                        className="block font-display text-xl font-black text-foreground group-hover:text-primary transition-colors tracking-tight leading-tight line-clamp-2"
                      >
                        {r.title}
                      </Link>
                      <div className="mt-3 flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                        <span className="flex items-center gap-1"><Clock size={12} /> {new Date(r.updated_at).toLocaleDateString()}</span>
                        {r.submitted_at && <span className="flex items-center gap-1"><CheckCircle2 size={12} /> {new Date(r.submitted_at).toLocaleDateString()}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center md:flex-col md:items-end gap-3 shrink-0 ml-9 md:ml-0">
                    <div className="flex flex-col items-end gap-1.5">
                      <span className={`rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest ${statusStyles[r.status] ?? "bg-muted text-foreground/70"} shadow-sm ring-1 ring-white/20`}>
                        {r.status.replaceAll("_", " ")}
                      </span>
                      {r.status === 'published' && (
                        <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] animate-pulse">Live on Archive</span>
                      )}
                    </div>
                    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest ${
                      r.payment_status === "confirmed" ? "bg-emerald-500/10 text-emerald-700" : 
                      r.payment_status === "rejected" ? "bg-rose-500/10 text-rose-700" : "bg-amber-500/10 text-amber-700"
                    } ring-1 ring-current/20`}>
                      <CreditCard size={10} /> {r.payment_status}
                    </span>
                  </div>
                </div>

                <div className="mt-2 mx-6 pb-6 border-t border-border/40 flex flex-wrap items-center justify-between gap-4 relative z-10 pt-6">
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setOpenId(openId === r.id + ":chat" ? null : r.id + ":chat"); }} 
                      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-wider transition-all ${openId === r.id + ":chat" ? "bg-primary text-white" : "bg-muted/40 text-foreground/60 hover:bg-primary/10 hover:text-primary"}`}
                    >
                      <MessageSquare size={14} /> {openId === r.id + ":chat" ? "Close Discussion" : "Discussion"}
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setOpenId(openId === r.id + ":rev" ? null : r.id + ":rev"); }} 
                      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-wider transition-all ${openId === r.id + ":rev" ? "bg-primary text-white" : "bg-muted/40 text-foreground/60 hover:bg-primary/10 hover:text-primary"}`}
                    >
                      <UserCog size={14} /> {openId === r.id + ":rev" ? "Close Reviewers" : "Reviewers"}
                    </button>
                  </div>
                  
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteSubmission(r.id, r.title); }}
                      className="text-[10px] font-black uppercase tracking-widest text-destructive hover:underline flex items-center gap-1"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                    <Link 
                      to="/submissions/$id" 
                      params={{ id: r.id }} 
                      onClick={(e) => e.stopPropagation()} 
                      className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline flex items-center gap-1"
                    >
                      Full Review <ChevronRight size={12} />
                    </Link>
                </div>

                {openId && openId.startsWith(r.id) && (
                  <div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-300 relative z-10">
                    {openId === r.id + ":chat" && user && <AdminCommentsThread submissionId={r.id} userId={user.id} />}
                    {openId === r.id + ":rev" && user && <ReviewersAssign submissionId={r.id} assignedBy={user.id} />}
                  </div>
                )}

                <div className={`absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-primary/5 opacity-0 group-hover:opacity-100 blur-2xl group-hover:scale-150 transition-all duration-700`} />
              </li>
          ))}
        </ul>
      </div>
      )}
      <div className="flex items-center justify-between text-sm"><p className="text-muted-foreground">{total === 0 ? "0" : `${page * PAGE_SIZE + 1}–${Math.min((page + 1) * PAGE_SIZE, total)} of ${total}`}</p><div className="flex items-center gap-2"><button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs disabled:opacity-40"><ChevronLeft size={14} /> Prev</button><span className="text-xs text-muted-foreground">Page {page + 1} / {totalPages}</span><button onClick={() => setPage((p) => (p + 1 < totalPages ? p + 1 : p))} disabled={page + 1 >= totalPages} className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs disabled:opacity-40">Next <ChevronRight size={14} /></button></div></div>
    </div>
  );
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button 
      onClick={onClick} 
      className={`rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
        active 
          ? "bg-primary text-white shadow-lg shadow-primary/25 scale-105" 
          : "bg-muted/40 text-foreground/60 hover:bg-primary/5 hover:text-primary"
      }`}
    >
      {children}
    </button>
  );
}
