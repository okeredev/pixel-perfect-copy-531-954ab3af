import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Users, FileStack, TrendingUp, Calendar, Clock, CheckCircle2, AlertCircle, BookOpen, CreditCard, ClipboardCheck, X, ExternalLink } from "lucide-react";
import type { Tab } from "./AdminSidebar";

const STATUS_COLORS: Record<string, string> = { draft: "#94a3b8", submitted: "#3b82f6", under_review: "#f59e0b", revisions_requested: "#f97316", accepted: "#10b981", rejected: "#ef4444", withdrawn: "#64748b", published: "#8b5cf6" };

type OverviewProps = { onNavigate?: (tab: Tab) => void };

type DetailPopup = null | "users" | "submissions" | "recent" | "payments";
type PopupUser = { id: string; full_name: string; email: string | null; created_at: string };
type PopupSub = { id: string; title: string; status: string; type: string; created_at: string; owner_name?: string };

export function AdminOverview({ onNavigate }: OverviewProps) {
  const [stats, setStats] = useState<{ totalUsers: number; totalSubmissions: number; recentSubmissions: number; pendingPayments: number; revenue: number; currency: string } | null>(null);
  const [chartData, setChartData] = useState<{ name: string; submissions: number }[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<{ name: string; value: number }[]>([]);
  const [recentActivity, setRecentActivity] = useState<{ id: string; action: string; entity: string; created_at: string; metadata: Record<string, unknown> }[]>([]);

  // Detail popup state
  const [popup, setPopup] = useState<DetailPopup>(null);
  const [popupUsers, setPopupUsers] = useState<PopupUser[]>([]);
  const [popupSubs, setPopupSubs] = useState<PopupSub[]>([]);
  const [popupLoading, setPopupLoading] = useState(false);

  useEffect(() => {
    async function loadStats() {
      const [usersRes, subsRes, recentRes, pendingRes, allSubs, last30, logs, pricingRes] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("submissions").select("id", { count: "exact", head: true }),
        supabase.from("submissions").select("id", { count: "exact", head: true }).gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from("submissions").select("id", { count: "exact", head: true }).eq("payment_status", "pending").neq("status", "draft"),
        supabase.from("submissions").select("status, type, payment_status"),
        supabase.from("submissions").select("created_at").gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from("audit_logs").select("id, action, entity, created_at, metadata").order("created_at", { ascending: false }).limit(8),
        supabase.from("app_settings").select("value").eq("key", "submission_pricing").single(),
      ]);

      const pricing = pricingRes.data?.value as any;
      const confirmed = (allSubs.data ?? []).filter(s => s.payment_status === 'confirmed');
      const rev = confirmed.reduce((acc, s) => {
        if (!pricing) return acc;
        return acc + (s.type === 'journal' ? pricing.journal_amount : pricing.conference_amount);
      }, 0);

      setStats({ 
        totalUsers: usersRes.count ?? 0, 
        totalSubmissions: subsRes.count ?? 0, 
        recentSubmissions: recentRes.count ?? 0, 
        pendingPayments: pendingRes.count ?? 0,
        revenue: rev,
        currency: pricing?.currency || "$"
      });
      setRecentActivity((logs.data ?? []) as typeof recentActivity);

      const statusCounts: Record<string, number> = {};
      (allSubs.data ?? []).forEach((s) => { statusCounts[s.status] = (statusCounts[s.status] || 0) + 1; });
      setStatusDistribution(Object.entries(statusCounts).map(([name, value]) => ({ name, value })));

      const days = Array.from({ length: 30 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (29 - i)); return d.toISOString().split("T")[0]; });
      const counts = days.reduce((acc, date) => ({ ...acc, [date]: 0 }), {} as Record<string, number>);
      (last30.data ?? []).forEach((sub) => { const d = sub.created_at.split("T")[0]; if (counts[d] !== undefined) counts[d]++; });
      setChartData(days.map((d) => ({ name: new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" }), submissions: counts[d] })));
    }
    loadStats();
  }, []);

  // Popup data loaders
  async function openPopup(type: DetailPopup) {
    setPopup(type); setPopupLoading(true);
    if (type === "users") {
      const { data } = await supabase.from("profiles").select("id, full_name, email, created_at").order("created_at", { ascending: false }).limit(20);
      setPopupUsers((data ?? []) as PopupUser[]);
    } else if (type === "submissions" || type === "recent") {
      let q = supabase.from("submissions").select("id, title, status, type, created_at, owner_id").order("created_at", { ascending: false }).limit(20);
      if (type === "recent") q = q.gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
      const { data } = await q;
      const subs = (data ?? []) as (PopupSub & { owner_id: string })[];
      const ids = [...new Set(subs.map((s) => s.owner_id))];
      if (ids.length) {
        const { data: profs } = await supabase.from("profiles").select("id, full_name").in("id", ids);
        const m = new Map((profs ?? []).map((p) => [p.id, p.full_name]));
        subs.forEach((s) => { s.owner_name = m.get(s.owner_id) ?? ""; });
      }
      setPopupSubs(subs);
    } else if (type === "payments") {
      const { data } = await supabase.from("submissions").select("id, title, status, type, created_at, owner_id").eq("payment_status", "pending").neq("status", "draft").order("created_at", { ascending: false }).limit(20);
      const subs = (data ?? []) as (PopupSub & { owner_id: string })[];
      const ids = [...new Set(subs.map((s) => s.owner_id))];
      if (ids.length) {
        const { data: profs } = await supabase.from("profiles").select("id, full_name").in("id", ids);
        const m = new Map((profs ?? []).map((p) => [p.id, p.full_name]));
        subs.forEach((s) => { s.owner_name = m.get(s.owner_id) ?? ""; });
      }
      setPopupSubs(subs);
    }
    setPopupLoading(false);
  }

  const statusStyle = (s: string) => {
    const m: Record<string, string> = { draft: "bg-muted text-foreground/70", submitted: "bg-blue-100 text-blue-800", under_review: "bg-amber-100 text-amber-800", revisions_requested: "bg-orange-100 text-orange-800", accepted: "bg-emerald-100 text-emerald-800", rejected: "bg-rose-100 text-rose-800", withdrawn: "bg-slate-200 text-slate-700", published: "bg-primary/15 text-primary" };
    return m[s] ?? "bg-muted text-foreground/70";
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="reveal-anim">
        <h1 className="font-display text-4xl font-black text-primary tracking-tight">Dashboard Overview</h1>
        <p className="mt-2 text-sm text-muted-foreground">Real-time insights into your journal platform activity and growth.</p>
      </div>

      {/* Stats Grid — Clickable */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 reveal-anim" style={{ animationDelay: '0.1s' }}>
        <StatCard icon={<Users className="text-blue-600" size={24} />} label="Total Users" value={stats?.totalUsers ?? "—"} bg="bg-blue-600/10" onClick={() => openPopup("users")} />
        <StatCard icon={<CreditCard className="text-emerald-600" size={24} />} label="Revenue" value={stats ? `${stats.currency}${stats.revenue.toLocaleString()}` : "—"} bg="bg-emerald-600/10" onClick={() => onNavigate?.("payments")} />
        <StatCard icon={<TrendingUp className="text-violet-600" size={24} />} label="This Week" value={stats?.recentSubmissions ?? "—"} bg="bg-violet-600/10" onClick={() => openPopup("recent")} />
        <StatCard icon={<Clock className="text-amber-600" size={24} />} label="Pending" value={stats?.pendingPayments ?? "—"} bg="bg-amber-600/10" onClick={() => openPopup("payments")} />
      </div>

      {/* Detail Popup Modal */}
      {popup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-in fade-in duration-200" onClick={() => setPopup(null)}>
          <div className="relative mx-4 w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
              <h3 className="font-display text-lg font-semibold text-foreground">
                {popup === "users" && "Recent Users"}
                {popup === "submissions" && "All Submissions"}
                {popup === "recent" && "This Week's Submissions"}
                {popup === "payments" && "Pending Payments"}
              </h3>
              <div className="flex items-center gap-2">
                {onNavigate && (
                  <button onClick={() => { setPopup(null); onNavigate(popup === "users" ? "users" : popup === "payments" ? "payments" : "submissions"); }} className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs text-foreground/80 hover:border-primary hover:text-primary"><ExternalLink size={12} /> View All</button>
                )}
                <button onClick={() => setPopup(null)} className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"><X size={16} /></button>
              </div>
            </div>
            <div className="max-h-[60vh] overflow-y-auto px-6 py-4">
              {popupLoading ? (<div className="flex items-center gap-3 py-8"><div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" /><p className="text-sm text-muted-foreground">Loading…</p></div>) : popup === "users" ? (
                <ul className="space-y-2">{popupUsers.length === 0 ? <li className="text-sm text-muted-foreground py-4">No users found.</li> : popupUsers.map((u) => (
                  <li key={u.id} className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-background px-4 py-3">
                    <div className="min-w-0"><p className="truncate text-sm font-medium text-foreground">{u.full_name || "(no name)"}</p><p className="truncate text-xs text-muted-foreground">{u.email}</p></div>
                    <span className="text-[11px] text-muted-foreground whitespace-nowrap">Joined {new Date(u.created_at).toLocaleDateString()}</span>
                  </li>
                ))}</ul>
              ) : (
                <ul className="space-y-2">{popupSubs.length === 0 ? <li className="text-sm text-muted-foreground py-4">No submissions found.</li> : popupSubs.map((s) => (
                  <li key={s.id} className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-background px-4 py-3">
                    <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-foreground">{s.title}</p><p className="text-xs text-muted-foreground">{s.owner_name || "Unknown"} · {s.type} · {new Date(s.created_at).toLocaleDateString()}</p></div>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${statusStyle(s.status)}`}>{s.status.replace(/_/g, " ")}</span>
                  </li>
                ))}</ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3 reveal-anim" style={{ animationDelay: '0.2s' }}>
        <div className="rounded-3xl glass-card p-8 lg:col-span-2">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h3 className="font-display text-xl font-bold text-foreground">Submission Activity</h3>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60">Past 30 days performance</p>
            </div>
            <div className="p-3 rounded-2xl bg-primary/5 text-primary">
              <Calendar size={24} />
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSubs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.34 0.08 155)" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="oklch(0.34 0.08 155)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.9 0.01 85)" opacity={0.5} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: "oklch(0.45 0.02 155)" }} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: "oklch(0.45 0.02 155)" }} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: "16px", border: "1px solid oklch(0.9 0.01 85)", backgroundColor: "oklch(1 0 0 / 0.95)", backdropFilter: "blur(8px)", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }} 
                  labelStyle={{ fontWeight: 800, color: "oklch(0.34 0.08 155)", marginBottom: "4px" }}
                  itemStyle={{ fontSize: "12px", fontWeight: 700 }} 
                />
                <Area type="monotone" dataKey="submissions" stroke="oklch(0.34 0.08 155)" strokeWidth={3} fillOpacity={1} fill="url(#colorSubs)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl glass-card p-8">
          <div className="mb-6">
            <h3 className="font-display text-xl font-bold text-foreground tracking-tight">Status Mix</h3>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60">Current queue</p>
          </div>
          {statusDistribution.length === 0 ? (
            <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground italic">No submissions yet</div>
          ) : (
            <>
              <div className="mx-auto h-[200px] w-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value" stroke="none">
                      {statusDistribution.map((entry) => <Cell key={entry.name} fill={STATUS_COLORS[entry.name] ?? "#94a3b8"} />)}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: "12px", border: "none", backgroundColor: "oklch(0.18 0.02 160)", color: "white", fontSize: "10px", fontWeight: 700 }} 
                      itemStyle={{ color: "white" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 space-y-2">
                {statusDistribution.map((s) => (
                  <div key={s.name} className="flex items-center justify-between">
                    <span className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full ring-2 ring-offset-2 ring-offset-card" style={{ backgroundColor: STATUS_COLORS[s.name] ?? "#94a3b8", "--tw-ring-color": STATUS_COLORS[s.name] ?? "#94a3b8" } as React.CSSProperties} />
                      <span className="text-[10px] font-black uppercase tracking-wider text-foreground/70">{s.name.replace(/_/g, " ")}</span>
                    </span>
                    <span className="text-[10px] font-black text-foreground">{s.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Recent Activity + Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity Feed */}
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <h3 className="mb-4 font-display text-lg font-semibold text-foreground">Recent Activity</h3>
          {recentActivity.length === 0 ? (<p className="text-sm text-muted-foreground">No activity recorded yet.</p>) : (
            <ul className="space-y-2">{recentActivity.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-2 rounded-xl border border-border/40 bg-background px-3 py-2.5">
                <div className="min-w-0"><p className="truncate text-sm font-medium text-foreground">{a.action.replace(/_/g, " ")}</p><p className="text-[11px] text-muted-foreground">{a.entity}</p></div>
                <span className="text-[11px] text-muted-foreground whitespace-nowrap">{new Date(a.created_at).toLocaleString()}</span>
              </li>
            ))}</ul>
          )}
        </div>

        {/* Quick Actions — Now functional */}
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <h3 className="mb-4 font-display text-lg font-semibold text-foreground">Quick Actions</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <QuickAction icon={<AlertCircle className="text-amber-500" size={18} />} label="Review Pending" description="Submissions awaiting review" onClick={() => onNavigate?.("submissions")} />
            <QuickAction icon={<CreditCard className="text-emerald-500" size={18} />} label="Confirm Payments" description="Verify payment receipts" onClick={() => onNavigate?.("payments")} />
            <QuickAction icon={<BookOpen className="text-blue-500" size={18} />} label="Published Content" description="Manage articles & DOIs" onClick={() => onNavigate?.("content")} />
            <QuickAction icon={<ClipboardCheck className="text-violet-500" size={18} />} label="Manage Reviews" description="Assign & track reviewers" onClick={() => onNavigate?.("reviews")} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, bg, onClick }: { icon: React.ReactNode; label: string; value: number | string; bg: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="w-full rounded-3xl glass-card p-6 premium-shadow transition-all duration-500 hover:scale-[1.03] hover:border-primary active:scale-[0.98] cursor-pointer text-left group overflow-hidden relative">
      <div className="relative z-10 flex items-center gap-5">
        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${bg} transition-all duration-500 group-hover:rotate-12 group-hover:scale-110`}>{icon}</div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{label}</p>
          <p className="font-display text-3xl font-black text-foreground tracking-tight">{value}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between relative z-10">
        <p className="text-[10px] font-bold text-muted-foreground group-hover:text-primary transition-colors uppercase tracking-widest">Details</p>
        <TrendingUp size={12} className="text-primary/40 group-hover:text-primary transition-colors" />
      </div>
      <div className={`absolute -right-4 -bottom-4 h-24 w-24 rounded-full ${bg} opacity-10 blur-2xl group-hover:scale-150 transition-transform duration-700`} />
    </button>
  );
}

function QuickAction({ icon, label, description, onClick }: { icon: React.ReactNode; label: string; description: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="group w-full cursor-pointer rounded-xl border border-border/60 bg-background p-4 text-left transition-all duration-200 hover:border-primary/50 hover:shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/50 transition-colors group-hover:bg-primary/10">{icon}</div>
        <div><p className="text-sm font-medium text-foreground group-hover:text-primary">{label}</p><p className="text-[11px] text-muted-foreground">{description}</p></div>
      </div>
    </button>
  );
}
