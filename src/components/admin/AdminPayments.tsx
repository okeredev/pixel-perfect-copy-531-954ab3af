import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CreditCard, Search, Filter, CheckCircle2, XCircle, Clock, DollarSign, ChevronLeft, ChevronRight, AlertTriangle, Eye, TrendingUp } from "lucide-react";

type PaymentRow = {
  id: string; title: string; type: "journal" | "conference"; status: string;
  payment_status: "pending" | "confirmed" | "rejected"; owner_id: string;
  created_at: string; updated_at: string;
  owner_name?: string; owner_email?: string; receipt_url?: string;
};

const PAGE_SIZE = 12;

export function AdminPayments() {
  const [rows, setRows] = useState<PaymentRow[] | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "confirmed" | "rejected">("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [pricing, setPricing] = useState<{ journal_amount: number; conference_amount: number; currency: string } | null>(null);
  const [stats, setStats] = useState<{ pending: number; confirmed: number; rejected: number; total: number; revenue: number; projected: number } | null>(null);

  async function loadStats(prices?: any) {
    const p = prices || pricing;
    const [pend, conf, reje, all] = await Promise.all([
      supabase.from("submissions").select("id, type").eq("payment_status", "pending").neq("status", "draft"),
      supabase.from("submissions").select("id, type").eq("payment_status", "confirmed"),
      supabase.from("submissions").select("id, type").eq("payment_status", "rejected"),
      supabase.from("submissions").select("id", { count: "exact", head: true }).neq("status", "draft"),
    ]);

    const calcRevenue = (rows: any[]) => rows.reduce((acc, r) => {
      if (!p) return acc;
      return acc + (r.type === 'journal' ? p.journal_amount : p.conference_amount);
    }, 0);

    const rev = calcRevenue(conf.data || []);
    const proj = rev + calcRevenue(pend.data || []);

    setStats({ 
      pending: pend.data?.length ?? 0, 
      confirmed: conf.data?.length ?? 0, 
      rejected: reje.data?.length ?? 0, 
      total: all.count ?? 0,
      revenue: rev,
      projected: proj
    });
  }

  async function loadPricing() {
    const { data } = await supabase.from("app_settings").select("value").eq("key", "submission_pricing").single();
    if (data) {
      const p = data.value as any;
      setPricing(p);
      loadStats(p);
    }
  }

  async function load() {
    let q = supabase.from("submissions")
      .select("id,title,type,status,payment_status,owner_id,created_at,updated_at", { count: "exact" })
      .neq("status", "draft").order("updated_at", { ascending: false })
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);
    if (filter !== "all") q = q.eq("payment_status", filter as never);
    if (search.trim()) q = q.ilike("title", `%${search.trim()}%`);
    const { data, error, count } = await q;
    if (error) { toast.error(error.message); setRows([]); return; }
    const subs = (data ?? []) as PaymentRow[];
    const ownerIds = [...new Set(subs.map((s) => s.owner_id))];
    if (ownerIds.length) {
      const { data: profs } = await supabase.from("profiles").select("id, full_name, email").in("id", ownerIds);
      const m = new Map((profs ?? []).map((p) => [p.id, p]));
      subs.forEach((s) => { const p = m.get(s.owner_id); s.owner_name = p?.full_name ?? ""; s.owner_email = p?.email ?? ""; });
    }
    const subIds = subs.map((s) => s.id);
    if (subIds.length) {
      const { data: files } = await supabase.from("submission_files").select("submission_id, storage_path").in("submission_id", subIds).eq("kind", "payment_evidence");
      const fm = new Map((files ?? []).map((f) => [f.submission_id, f.storage_path]));
      subs.forEach((s) => { s.receipt_url = fm.get(s.id); });
    }
    setRows(subs); setTotal(count ?? 0);
  }

  useEffect(() => { loadPricing(); }, []);
  useEffect(() => { load(); }, [filter, page]); // eslint-disable-line
  useEffect(() => setPage(0), [filter, search]);
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [search]); // eslint-disable-line

  async function changePayment(id: string, next: "pending" | "confirmed" | "rejected") {
    const { error } = await supabase.from("submissions").update({ payment_status: next as never }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Payment ${next}`); load(); loadStats();
  }

  async function bulkAction(action: "confirmed" | "rejected") {
    if (selected.size === 0) return;
    setBulkBusy(true);
    const { error } = await supabase.from("submissions").update({ payment_status: action as never }).in("id", [...selected]);
    setBulkBusy(false);
    if (error) return toast.error(error.message);
    toast.success(`${selected.size} payment(s) ${action}`);
    setSelected(new Set()); load(); loadStats();
  }

  const toggleSelect = (id: string) => setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleSelectAll = () => { if (!rows) return; setSelected(selected.size === rows.length ? new Set() : new Set(rows.map((r) => r.id))); };
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const psIcon = (s: string) => s === "confirmed" ? <CheckCircle2 size={14} className="text-emerald-600" /> : s === "rejected" ? <XCircle size={14} className="text-rose-600" /> : <Clock size={14} className="text-amber-600" />;
  const psStyle = (s: string) => s === "confirmed" ? "bg-emerald-100 text-emerald-800 border-emerald-200" : s === "rejected" ? "bg-rose-100 text-rose-800 border-rose-200" : "bg-amber-100 text-amber-800 border-amber-200";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="reveal-anim">
        <h1 className="font-display text-4xl font-black text-primary tracking-tighter leading-none">Payment Console</h1>
        <p className="mt-3 text-sm font-medium text-muted-foreground/70">Verify receipts and manage submission finance records.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 reveal-anim" style={{ animationDelay: '0.1s' }}>
        <StatBox 
          icon={<DollarSign className="text-emerald-600" size={24} />} 
          label="Total Revenue" 
          value={`${pricing?.currency || "$"} ${stats?.revenue.toLocaleString() ?? "0"}`} 
          bg="bg-emerald-50" 
        />
        <StatBox 
          icon={<TrendingUp className="text-blue-600" size={24} />} 
          label="Projected" 
          value={`${pricing?.currency || "$"} ${stats?.projected.toLocaleString() ?? "0"}`} 
          bg="bg-blue-50" 
        />
        <StatBox 
          icon={<Clock className="text-amber-500" size={24} />} 
          label="Pending Items" 
          value={stats?.pending ?? "—"} 
          bg="bg-amber-50" 
          highlight={!!stats && stats.pending > 0} 
        />
        <StatBox 
          icon={<CheckCircle2 className="text-emerald-500" size={24} />} 
          label="Confirmed Items" 
          value={stats?.confirmed ?? "—"} 
          bg="bg-emerald-50" 
        />
      </div>

      <div className="flex flex-wrap items-center gap-4 rounded-[2rem] glass-card p-4 reveal-anim" style={{ animationDelay: '0.2s' }}>
        <div className="relative flex-1 min-w-[280px]">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" />
          <input 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            placeholder="Search by title or author…" 
            className="w-full rounded-xl border-none bg-primary/5 py-3.5 pl-10 pr-4 text-sm font-bold text-foreground focus:ring-2 focus:ring-primary/20 transition-all" 
          />
        </div>
        <div className="flex items-center gap-2 p-1 bg-primary/5 rounded-xl border border-primary/10">
          {(["all", "pending", "confirmed", "rejected"] as const).map((s) => (
            <button 
              key={s} 
              onClick={() => setFilter(s)} 
              className={`rounded-lg px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                filter === s 
                  ? "bg-white text-primary shadow-sm" 
                  : "text-foreground/40 hover:text-primary hover:bg-white/40"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {selected.size > 0 && (
        <div className="flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-3 animate-in slide-in-from-top-2 duration-200">
          <span className="text-sm font-medium text-primary">{selected.size} selected</span>
          <button onClick={() => bulkAction("confirmed")} disabled={bulkBusy} className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-60"><CheckCircle2 size={12} /> Confirm All</button>
          <button onClick={() => bulkAction("rejected")} disabled={bulkBusy} className="inline-flex items-center gap-1.5 rounded-full border border-rose-300 bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100 disabled:opacity-60"><XCircle size={12} /> Reject All</button>
          <button onClick={() => setSelected(new Set())} className="ml-auto text-xs text-muted-foreground hover:text-foreground">Clear</button>
        </div>
      )}

      {rows === null ? (<div className="rounded-2xl border border-border/60 bg-card p-8"><div className="flex items-center gap-3"><div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" /><p className="text-sm text-muted-foreground">Loading…</p></div></div>) : rows.length === 0 ? (<div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center text-sm text-muted-foreground">No payments match this filter.</div>) : (
        <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
          <div className="hidden md:grid md:grid-cols-[40px_1fr_140px_140px_120px_160px] items-center gap-3 border-b border-border/60 bg-muted/30 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground"><div><input type="checkbox" checked={selected.size === rows.length && rows.length > 0} onChange={toggleSelectAll} className="rounded border-border" /></div><div>Submission</div><div>Author</div><div>Status</div><div>Receipt</div><div>Actions</div></div>
          <ul className="divide-y divide-border/40">{rows.map((r) => (
            <li key={r.id} className={`group grid items-center gap-3 px-5 py-4 transition-colors hover:bg-muted/20 md:grid-cols-[40px_1fr_140px_140px_120px_160px] ${selected.has(r.id) ? "bg-primary/5" : ""}`}>
              <div><input type="checkbox" checked={selected.has(r.id)} onChange={() => toggleSelect(r.id)} className="rounded border-border" /></div>
              <div className="min-w-0"><p className="truncate font-display text-sm font-semibold text-foreground">{r.title}</p><p className="text-[11px] text-muted-foreground">{r.type} · {new Date(r.updated_at).toLocaleDateString()}</p></div>
              <div className="min-w-0"><p className="truncate text-xs font-medium text-foreground">{r.owner_name || "—"}</p><p className="truncate text-[11px] text-muted-foreground">{r.owner_email || "—"}</p></div>
              <div><span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide ${psStyle(r.payment_status)}`}>{psIcon(r.payment_status)}{r.payment_status}</span></div>
              <div>{r.receipt_url ? <span className="inline-flex items-center gap-1 text-xs text-emerald-700"><Eye size={12} /> Uploaded</span> : <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><AlertTriangle size={12} /> None</span>}</div>
              <div className="flex gap-1.5">{r.payment_status !== "confirmed" && <button onClick={() => changePayment(r.id, "confirmed")} className="rounded-full border border-emerald-300 px-2.5 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-50">Confirm</button>}{r.payment_status !== "rejected" && <button onClick={() => changePayment(r.id, "rejected")} className="rounded-full border border-rose-300 px-2.5 py-1 text-[11px] font-medium text-rose-700 hover:bg-rose-50">Reject</button>}{r.payment_status !== "pending" && <button onClick={() => changePayment(r.id, "pending")} className="rounded-full border border-border px-2.5 py-1 text-[11px] text-foreground/70 hover:border-primary">Reset</button>}</div>
            </li>
          ))}</ul>
        </div>
      )}

      <div className="flex items-center justify-between text-sm">
        <p className="text-muted-foreground">{total === 0 ? "0" : `${page * PAGE_SIZE + 1}–${Math.min((page + 1) * PAGE_SIZE, total)} of ${total}`}</p>
        <div className="flex items-center gap-2">
          <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs disabled:opacity-40"><ChevronLeft size={14} /> Prev</button>
          <span className="text-xs text-muted-foreground">Page {page + 1} / {totalPages}</span>
          <button onClick={() => setPage((p) => (p + 1 < totalPages ? p + 1 : p))} disabled={page + 1 >= totalPages} className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs disabled:opacity-40">Next <ChevronRight size={14} /></button>
        </div>
      </div>
    </div>
  );
}

function StatBox({ icon, label, value, bg, highlight }: { icon: React.ReactNode; label: string; value: number | string; bg: string; highlight?: boolean }) {
  return (
    <div className={`rounded-[2rem] glass-card p-6 transition-all duration-500 hover:scale-[1.02] premium-shadow ${highlight ? "border-amber-400/50 bg-amber-50/50" : "bg-white"}`}>
      <div className="flex items-center gap-5">
        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg transition-transform hover:rotate-6 ${bg}`}>
          {icon}
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40 mb-1">{label}</p>
          <p className="font-display text-3xl font-black text-primary tracking-tighter leading-none">{value}</p>
        </div>
      </div>
    </div>
  );
}
