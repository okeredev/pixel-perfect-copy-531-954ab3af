import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Filter, ChevronLeft, ChevronRight } from "lucide-react";

type LogRow = { id: string; actor_id: string | null; action: string; entity: string; entity_id: string | null; metadata: Record<string, unknown>; created_at: string; };

export function AuditTab() {
  const [logs, setLogs] = useState<LogRow[] | null>(null);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState<string>("all");

  async function load() {
    let q = supabase.from("audit_logs").select("*", { count: "exact" }).order("created_at", { ascending: false }).range(page * 25, page * 25 + 24);
    if (filter !== "all") q = q.eq("entity", filter);
    const { data, count, error } = await q;
    if (error) { toast.error(error.message); setLogs([]); return; }
    setLogs((data ?? []) as LogRow[]); setTotal(count ?? 0);
  }
  useEffect(() => { load(); }, [page, filter]); // eslint-disable-line
  const totalPages = Math.max(1, Math.ceil(total / 25));

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border/60 bg-card p-3"><Filter size={14} className="text-muted-foreground" />{["all", "user_roles", "submissions", "app_settings"].map((e) => (<Pill key={e} active={filter === e} onClick={() => setFilter(e)}>{e.replaceAll("_", " ")}</Pill>))}</div>
      {logs === null ? (<p className="text-sm text-muted-foreground">Loading…</p>) : logs.length === 0 ? (<div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center text-sm text-muted-foreground">No log entries yet.</div>) : (
        <ul className="space-y-2">{logs.map((l) => (
          <li key={l.id} className="rounded-xl border border-border/60 bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-medium text-foreground">{l.action.replace(/_/g, " ")}<span className="ml-2 text-xs text-muted-foreground">{l.entity}</span></p><p className="text-xs text-muted-foreground">{new Date(l.created_at).toLocaleString()}</p></div>
            <pre className="mt-2 overflow-x-auto rounded-md bg-muted/40 p-2 text-[11px] text-foreground/80">{JSON.stringify(l.metadata, null, 2)}</pre>
          </li>
        ))}</ul>
      )}
      <div className="flex items-center justify-between text-sm"><p className="text-muted-foreground">{total} total entries</p><div className="flex items-center gap-2"><button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs disabled:opacity-40"><ChevronLeft size={14} /> Prev</button><span className="text-xs text-muted-foreground">Page {page + 1} / {totalPages}</span><button onClick={() => setPage((p) => (p + 1 < totalPages ? p + 1 : p))} disabled={page + 1 >= totalPages} className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs disabled:opacity-40">Next <ChevronRight size={14} /></button></div></div>
    </div>
  );
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (<button onClick={onClick} className={`rounded-full px-3 py-1 text-xs ${active ? "bg-primary text-primary-foreground" : "border border-border text-foreground/80"}`}>{children}</button>);
}
