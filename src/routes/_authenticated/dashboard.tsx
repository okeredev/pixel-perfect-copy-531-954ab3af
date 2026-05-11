import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Plus, FileText } from "lucide-react";

type Submission = {
  id: string;
  title: string;
  type: "journal" | "conference";
  status: string;
  payment_status: "pending" | "confirmed" | "rejected";
  conference_stage: string | null;
  created_at: string;
  updated_at: string;
};

const statusStyles: Record<string, string> = {
  draft: "bg-muted text-foreground/70",
  submitted: "bg-blue-100 text-blue-800",
  under_review: "bg-amber-100 text-amber-800",
  revisions_requested: "bg-orange-100 text-orange-800",
  accepted: "bg-emerald-100 text-emerald-800",
  rejected: "bg-rose-100 text-rose-800",
  withdrawn: "bg-slate-200 text-slate-700",
  published: "bg-primary/15 text-primary",
};

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Submission[] | null>(null);
  const [filesByDraft, setFilesByDraft] = useState<Record<string, { manuscript: boolean; payment: boolean }>>({});

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("submissions")
        .select("id,title,type,status,payment_status,conference_stage,created_at,updated_at")
        .eq("owner_id", user.id)
        .order("updated_at", { ascending: false });
      const subs = (data ?? []) as Submission[];
      setItems(subs);

      const draftIds = subs.filter((s) => s.status === "draft").map((s) => s.id);
      if (draftIds.length) {
        const { data: f } = await supabase
          .from("submission_files")
          .select("submission_id, kind")
          .in("submission_id", draftIds);
        const map: Record<string, { manuscript: boolean; payment: boolean }> = {};
        draftIds.forEach((id) => (map[id] = { manuscript: false, payment: false }));
        (f ?? []).forEach((row) => {
          const m = map[row.submission_id];
          if (!m) return;
          if (row.kind === "payment_evidence") m.payment = true;
          else m.manuscript = true;
        });
        setFilesByDraft(map);
      }
    })();
  }, [user]);

  const stats = items ? {
    total: items.length,
    published: items.filter(s => s.status === 'published').length,
    underReview: items.filter(s => ['submitted', 'under_review', 'revisions_requested'].includes(s.status)).length,
    awaitingPayment: items.filter(s => s.status !== 'draft' && s.payment_status !== 'confirmed').length
  } : null;

  return (
    <section className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div className="reveal-anim">
          <h1 className="font-display text-4xl font-black text-primary tracking-tight">My Submissions</h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-md">
            Track manuscripts and conference papers from draft to publication in our peer-reviewed journal system.
          </p>
        </div>
        <Link
          to="/submissions/new"
          className="reveal-anim inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all hover:scale-[1.03] active:scale-95"
        >
          <Plus size={18} /> New submission
        </Link>
      </header>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 reveal-anim" style={{ animationDelay: '0.1s' }}>
          <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">Total</p>
            <p className="text-2xl font-black text-primary">{stats.total}</p>
          </div>
          <div className="rounded-2xl border border-emerald-500/10 bg-emerald-500/5 p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600/60">Published</p>
            <p className="text-2xl font-black text-emerald-600">{stats.published}</p>
          </div>
          <div className="col-span-2 md:col-span-1 rounded-2xl border border-amber-500/10 bg-amber-500/5 p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-600/60">In Process</p>
            <p className="text-2xl font-black text-amber-600">{stats.underReview}</p>
          </div>
        </div>
      )}

      {items === null ? (
        <div className="rounded-2xl border border-border/60 bg-card p-8 text-sm text-muted-foreground">
          Loading…
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
          <FileText className="mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            You haven't started any submissions yet.
          </p>
          <Link
            to="/submissions/new"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus size={15} /> Start a submission
          </Link>
        </div>
      ) : (
        <ul className="grid gap-4 reveal-anim" style={{ animationDelay: '0.2s' }}>
          {items.map((s) => (
            <li key={s.id}>
              <Link
                to="/submissions/$id"
                params={{ id: s.id }}
                className="group block rounded-2xl border border-border/60 bg-card p-6 premium-shadow transition-all hover:scale-[1.01] hover:border-primary/50"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">
                      {s.type}
                      {s.conference_stage ? ` · ${s.conference_stage.replaceAll("_", " ")}` : ""}
                    </p>
                    <h3 className="mt-1 font-display text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {s.title}
                    </h3>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest ${
                        statusStyles[s.status] ?? "bg-muted text-foreground/70"
                      } shadow-sm shadow-black/5 ring-1 ring-white/20`}
                    >
                      {s.status.replaceAll("_", " ")}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest ${
                      s.payment_status === "confirmed" ? "bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/20" : 
                      s.payment_status === "rejected" ? "bg-rose-500/10 text-rose-700 ring-1 ring-rose-500/20" : 
                      "bg-amber-500/10 text-amber-700 ring-1 ring-amber-500/20"
                    }`}>
                      {s.payment_status === "confirmed" ? "Payment Verified" : 
                       s.payment_status === "rejected" ? "Payment Rejected" : "Awaiting Verification"}
                    </span>
                  </div>
                </div>
                
                {s.status === "draft" && filesByDraft[s.id] && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <ChecklistPill ok={filesByDraft[s.id].payment} label="Payment evidence" />
                    <ChecklistPill ok={filesByDraft[s.id].manuscript} label="Manuscript" />
                  </div>
                )}

                <div className="mt-6 flex items-center justify-between border-t border-border/40 pt-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Last updated {new Date(s.updated_at).toLocaleDateString()}
                  </p>
                  <div className="text-primary opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                    <Plus className="rotate-45" size={20} />
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ChecklistPill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${
        ok
          ? "bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/20"
          : "bg-amber-500/5 border border-dashed border-amber-400/50 text-amber-800"
      }`}
    >
      <span aria-hidden className="text-xs">{ok ? "✓" : "○"}</span>
      {label}
    </span>
  );
}
