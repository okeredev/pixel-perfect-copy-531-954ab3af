import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from "recharts";
import { TrendingUp, BarChart3, PieChart as PieIcon, Activity } from "lucide-react";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#64748b", "#06b6d4"];
const STATUS_COLORS: Record<string, string> = { draft: "#94a3b8", submitted: "#3b82f6", under_review: "#f59e0b", revisions_requested: "#f97316", accepted: "#10b981", rejected: "#ef4444", withdrawn: "#64748b", published: "#8b5cf6" };

export function AdminAnalytics() {
  const [monthlyData, setMonthlyData] = useState<{ name: string; journal: number; conference: number }[]>([]);
  const [statusDist, setStatusDist] = useState<{ name: string; value: number }[]>([]);
  const [paymentDist, setPaymentDist] = useState<{ name: string; value: number }[]>([]);
  const [weeklyTrend, setWeeklyTrend] = useState<{ name: string; submissions: number }[]>([]);
  const [topKeywords, setTopKeywords] = useState<{ name: string; count: number }[]>([]);
  const [stats, setStats] = useState<{ avgReviewDays: number; acceptRate: number; totalAuthors: number; totalFiles: number } | null>(null);

  useEffect(() => {
    async function loadAll() {
      // All submissions for analysis
      const { data: allSubs } = await supabase.from("submissions").select("status, type, payment_status, created_at, keywords, published_at");
      const subs = allSubs ?? [];

      // Monthly breakdown (last 12 months)
      const months: Record<string, { journal: number; conference: number }> = {};
      for (let i = 11; i >= 0; i--) {
        const d = new Date(); d.setMonth(d.getMonth() - i);
        const key = d.toLocaleDateString(undefined, { month: "short", year: "2-digit" });
        months[key] = { journal: 0, conference: 0 };
      }
      subs.forEach((s) => {
        const d = new Date(s.created_at);
        const key = d.toLocaleDateString(undefined, { month: "short", year: "2-digit" });
        if (months[key]) months[key][s.type as "journal" | "conference"]++;
      });
      setMonthlyData(Object.entries(months).map(([name, v]) => ({ name, ...v })));

      // Status distribution
      const sc: Record<string, number> = {};
      subs.forEach((s) => { sc[s.status] = (sc[s.status] || 0) + 1; });
      setStatusDist(Object.entries(sc).map(([name, value]) => ({ name, value })));

      // Payment distribution
      const pc: Record<string, number> = {};
      subs.filter((s) => s.status !== "draft").forEach((s) => { pc[s.payment_status] = (pc[s.payment_status] || 0) + 1; });
      setPaymentDist(Object.entries(pc).map(([name, value]) => ({ name, value })));

      // Weekly trend (last 8 weeks)
      const weeks: { name: string; submissions: number }[] = [];
      for (let i = 7; i >= 0; i--) {
        const start = new Date(); start.setDate(start.getDate() - (i + 1) * 7);
        const end = new Date(); end.setDate(end.getDate() - i * 7);
        const count = subs.filter((s) => { const d = new Date(s.created_at); return d >= start && d < end; }).length;
        weeks.push({ name: `W${8 - i}`, submissions: count });
      }
      setWeeklyTrend(weeks);

      // Top keywords
      const kw: Record<string, number> = {};
      subs.forEach((s) => { (s.keywords ?? []).forEach((k: string) => { kw[k] = (kw[k] || 0) + 1; }); });
      setTopKeywords(Object.entries(kw).sort(([, a], [, b]) => b - a).slice(0, 10).map(([name, count]) => ({ name, count })));

      // Accept rate
      const decided = subs.filter((s) => s.status === "accepted" || s.status === "published" || s.status === "rejected");
      const accepted = decided.filter((s) => s.status === "accepted" || s.status === "published");
      const acceptRate = decided.length > 0 ? Math.round((accepted.length / decided.length) * 100) : 0;

      // Total unique authors & files
      const [authRes, fileRes] = await Promise.all([
        supabase.from("submission_authors").select("id", { count: "exact", head: true }),
        supabase.from("submission_files").select("id", { count: "exact", head: true }),
      ]);

      setStats({ avgReviewDays: 0, acceptRate, totalAuthors: authRes.count ?? 0, totalFiles: fileRes.count ?? 0 });
    }
    loadAll();
  }, []);

  const tooltipStyle = { borderRadius: "12px", border: "1px solid hsl(var(--border))", backgroundColor: "hsl(var(--card))", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" };
  const tickStyle = { fontSize: 11, fill: "hsl(var(--muted-foreground))" };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div><h1 className="font-display text-3xl font-bold text-primary">Analytics</h1><p className="mt-1 text-sm text-muted-foreground">Deep insights into submissions, reviews, and platform activity.</p></div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AStatCard icon={<TrendingUp className="text-emerald-500" size={20} />} label="Acceptance Rate" value={stats ? `${stats.acceptRate}%` : "—"} bg="bg-emerald-50" />
        <AStatCard icon={<BarChart3 className="text-blue-500" size={20} />} label="Total Authors" value={stats?.totalAuthors ?? "—"} bg="bg-blue-50" />
        <AStatCard icon={<Activity className="text-violet-500" size={20} />} label="Total Files" value={stats?.totalFiles ?? "—"} bg="bg-violet-50" />
        <AStatCard icon={<PieIcon className="text-amber-500" size={20} />} label="Keywords Tracked" value={topKeywords.length > 0 ? topKeywords.reduce((a, k) => a + k.count, 0) : "—"} bg="bg-amber-50" />
      </div>

      {/* Charts Row 1: Monthly + Status */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm lg:col-span-2">
          <h3 className="mb-1 font-display text-lg font-semibold text-foreground">Monthly Submissions</h3>
          <p className="mb-4 text-sm text-muted-foreground">Journal vs Conference papers over the last 12 months</p>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={tickStyle} />
                <YAxis axisLine={false} tickLine={false} tick={tickStyle} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="journal" name="Journal" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="conference" name="Conference" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <h3 className="mb-1 font-display text-lg font-semibold text-foreground">Payment Status</h3>
          <p className="mb-4 text-sm text-muted-foreground">Distribution of payment statuses</p>
          {paymentDist.length === 0 ? <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">No data</div> : (
            <>
              <div className="mx-auto h-[180px] w-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart><Pie data={paymentDist} cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={3} dataKey="value">{paymentDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip contentStyle={{ ...tooltipStyle, fontSize: "12px" }} /></PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 space-y-1.5">{paymentDist.map((s, i) => (<div key={s.name} className="flex items-center justify-between text-xs"><span className="flex items-center gap-2"><span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} /><span className="capitalize text-foreground/80">{s.name}</span></span><span className="font-medium text-foreground">{s.value}</span></div>))}</div>
            </>
          )}
        </div>
      </div>

      {/* Charts Row 2: Weekly Trend + Top Keywords */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <h3 className="mb-1 font-display text-lg font-semibold text-foreground">Weekly Trend</h3>
          <p className="mb-4 text-sm text-muted-foreground">Submissions over the last 8 weeks</p>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs><linearGradient id="wkGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} /><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={tickStyle} />
                <YAxis axisLine={false} tickLine={false} tick={tickStyle} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="submissions" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#wkGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <h3 className="mb-1 font-display text-lg font-semibold text-foreground">Top Keywords</h3>
          <p className="mb-4 text-sm text-muted-foreground">Most frequently used research keywords</p>
          {topKeywords.length === 0 ? <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">No keywords found</div> : (
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topKeywords} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={tickStyle} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ ...tickStyle, fontSize: 10 }} width={100} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Status breakdown */}
      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
        <h3 className="mb-4 font-display text-lg font-semibold text-foreground">Status Breakdown</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {statusDist.map((s) => (
            <div key={s.name} className="flex items-center gap-3 rounded-xl border border-border/60 bg-background p-3">
              <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: STATUS_COLORS[s.name] ?? "#94a3b8" }} />
              <div><p className="text-xs font-medium capitalize text-foreground">{s.name.replace(/_/g, " ")}</p><p className="font-display text-xl font-bold text-foreground">{s.value}</p></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AStatCard({ icon, label, value, bg }: { icon: React.ReactNode; label: string; value: number | string; bg: string }) {
  return (<div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"><div className="flex items-center gap-3"><div className={`flex h-10 w-10 items-center justify-center rounded-full ${bg}`}>{icon}</div><div><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p><p className="font-display text-2xl font-bold text-foreground">{value}</p></div></div></div>);
}
