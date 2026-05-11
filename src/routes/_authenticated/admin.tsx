import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { AdminSidebar, type Tab } from "@/components/admin/AdminSidebar";
import { AdminOverview } from "@/components/admin/AdminOverview";
import { AdminPayments } from "@/components/admin/AdminPayments";
import { AdminReviews } from "@/components/admin/AdminReviews";
import { AdminContent } from "@/components/admin/AdminContent";
import { AdminAnnouncements } from "@/components/admin/AdminAnnouncements";
import { AdminAnalytics } from "@/components/admin/AdminAnalytics";
import { SubmissionsTab } from "@/components/admin/SubmissionsTab";
import { UsersTab } from "@/components/admin/UsersTab";
import { SettingsTab } from "@/components/admin/SettingsTab";
import { AuditTab } from "@/components/admin/AuditTab";
import { X, ClipboardCheck, FileText, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminPage,
});

function AdminPage() {
  const { roles, loading } = useAuth();
  const [tab, setTab] = useState<Tab>("overview");
  const [detailItem, setDetailItem] = useState<{ type: "submission" | "user"; data: any } | null>(null);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const isStaff = roles.includes("admin") || roles.includes("editor");
  const isAdmin = roles.includes("admin");

  if (!isStaff) {
    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center">
        <h2 className="font-display text-xl font-bold text-destructive">Access Denied</h2>
        <p className="mt-2 text-muted-foreground">You do not have permission to view the administrative console.</p>
        <p className="mt-4 text-[10px] uppercase tracking-widest text-muted-foreground/50">
          Your roles: {roles.length ? roles.join(", ") : "author"}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 md:flex-row">
      <AdminSidebar activeTab={tab} setTab={setTab} isAdmin={isAdmin} />
      
      <main className="flex-1 min-w-0">
        {tab === "overview" && <AdminOverview onNavigate={(t) => setTab(t)} />}
        {tab === "submissions" && <SubmissionsTab onDetail={(d) => setDetailItem({ type: "submission", data: d })} />}
        {tab === "users" && <UsersTab isAdmin={isAdmin} onDetail={(u) => setDetailItem({ type: "user", data: u })} />}
        {tab === "payments" && <AdminPayments />}
        {tab === "reviews" && <AdminReviews />}
        {tab === "content" && <AdminContent />}
        {tab === "announcements" && isAdmin && <AdminAnnouncements />}
        {tab === "analytics" && isAdmin && <AdminAnalytics />}
        {tab === "settings" && isAdmin && <SettingsTab />}
        {tab === "audit" && isAdmin && <AuditTab />}
      </main>

      {/* Shared Detail Popup */}
      {detailItem && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setDetailItem(null)}>
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-[2.5rem] border border-border/60 bg-card shadow-2xl animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-border/60 px-8 py-6">
              <div>
                <h3 className="font-display text-xl font-black text-primary tracking-tight">
                  {detailItem.type === "submission" ? "Manuscript Intel" : "User Profile"}
                </h3>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                  {detailItem.type === "submission" ? `ID: ${detailItem.data.id}` : `ID: ${detailItem.data.id.slice(0, 8)}`}
                </p>
              </div>
              <button onClick={() => setDetailItem(null)} className="rounded-full p-3 text-muted-foreground hover:bg-primary/5 hover:text-primary transition-all">
                <X size={24} />
              </button>
            </div>
            
            <div className="overflow-y-auto p-8 custom-scrollbar">
              {detailItem.type === "submission" ? (
                <SubmissionDetailContent sub={detailItem.data} />
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary text-3xl font-black shadow-inner">
                      {detailItem.data.full_name?.[0] || "?"}
                    </div>
                    <div>
                      <p className="text-2xl font-black text-foreground tracking-tight">{detailItem.data.full_name || "Anonymous User"}</p>
                      <p className="text-sm font-medium text-muted-foreground">{detailItem.data.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6 p-6 rounded-3xl bg-muted/30 border border-border/40">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary/40 mb-1">Affiliation</p>
                      <p className="text-sm font-bold text-foreground">{detailItem.data.affiliation || "None provided"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary/40 mb-1">Joined</p>
                      <p className="text-sm font-bold text-foreground">{new Date(detailItem.data.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary/40 mb-3">Roles & Permissions</p>
                    <div className="flex flex-wrap gap-2">
                      {detailItem.data.roles.length === 0 ? (
                        <span className="text-xs text-muted-foreground italic">No roles assigned</span>
                      ) : (
                        detailItem.data.roles.map((r: string) => (
                          <span key={r} className="rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-[10px] font-black text-primary uppercase tracking-widest shadow-sm">
                            {r}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SubmissionDetailContent({ sub }: { sub: any }) {
  const [extra, setExtra] = useState<{ abstract: string; keywords: string[]; authors: any[]; files: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(sub.status);
  const [paymentStatus, setPaymentStatus] = useState(sub.payment_status);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const [sData, aData, fData] = await Promise.all([
        supabase.from("submissions").select("abstract, keywords").eq("id", sub.id).single(),
        supabase.from("submission_authors").select("*").eq("submission_id", sub.id).order("position"),
        supabase.from("submission_files").select("*").eq("submission_id", sub.id),
      ]);
      setExtra({
        abstract: sData.data?.abstract || "",
        keywords: sData.data?.keywords || [],
        authors: aData.data || [],
        files: fData.data || [],
      });
      setLoading(false);
    })();
  }, [sub.id]);

  async function updateStatus(next: string) {
    // Basic validation: must be confirmed to move past submitted
    const progressing = ["under_review", "revisions_requested", "accepted", "published"].includes(next);
    if (progressing && paymentStatus !== "confirmed") {
      return toast.error("Payment must be confirmed before proceeding with this manuscript.");
    }

    setBusy(true);
    const { error } = await supabase.from("submissions").update({ status: next as any, ...(next === "published" ? { published_at: new Date().toISOString() } : {}) }).eq("id", sub.id);
    setBusy(false);
    if (error) return toast.error(error.message);
    setStatus(next);
    toast.success(`Marked as ${next.replace('_', ' ')}`);
  }

  async function updatePayment(next: string) {
    setBusy(true);
    const { error } = await supabase.from("submissions").update({ payment_status: next as any }).eq("id", sub.id);
    setBusy(false);
    if (error) return toast.error(error.message);
    setPaymentStatus(next);
    toast.success(`Payment ${next}`);
  }

  if (loading) return <div className="py-10 text-center animate-pulse text-sm font-black uppercase tracking-[0.2em] text-primary/40">Fetching manuscript data…</div>;

  return (
    <div className="space-y-8 pb-10">
      <section>
        <p className="text-[10px] font-black uppercase tracking-widest text-primary/40 mb-2">Manuscript Title</p>
        <h4 className="text-2xl font-black text-foreground tracking-tight leading-tight">{sub.title}</h4>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-primary/5 border border-primary/10 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-primary">
            {sub.type}
          </span>
          <span className={`rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest shadow-sm ${
            status === 'published' ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'
          }`}>
            {status.replace(/_/g, ' ')}
          </span>
          <span className={`rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest shadow-sm ${
            paymentStatus === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
          }`}>
            Payment: {paymentStatus}
          </span>
        </div>
      </section>

      {/* Admin Quick Actions */}
      <section className="p-6 rounded-[2rem] bg-primary/5 border border-primary/10">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40 mb-4 flex items-center gap-2">
          <ClipboardCheck size={14} /> Quick Management
        </p>
        <div className="flex flex-wrap gap-4">
          <div className="space-y-2 flex-1 min-w-[200px]">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Workflow Status</p>
            <select 
              value={status} 
              disabled={busy}
              onChange={(e) => updateStatus(e.target.value)}
              className="w-full rounded-xl border border-border/60 bg-background px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer"
            >
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="revisions_requested">Revisions Requested</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="withdrawn">Withdrawn</option>
              <option value="published">Published (Live)</option>
            </select>
          </div>
          <div className="space-y-2 flex-1 min-w-[200px]">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Payment Evidence</p>
            <div className="flex gap-2">
              <button 
                onClick={() => updatePayment('confirmed')} 
                disabled={busy || paymentStatus === 'confirmed'}
                className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-white hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-lg shadow-emerald-600/10"
              >
                Verify
              </button>
              <button 
                onClick={() => updatePayment('rejected')} 
                disabled={busy || paymentStatus === 'rejected'}
                className="flex-1 rounded-xl border border-rose-300 bg-rose-50 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-rose-700 hover:bg-rose-100 disabled:opacity-50 transition-all"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      </section>

      {extra?.abstract && (
        <section>
          <p className="text-[10px] font-black uppercase tracking-widest text-primary/40 mb-2">Abstract</p>
          <div className="p-6 rounded-3xl bg-muted/30 border border-border/40">
            <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">{extra.abstract}</p>
          </div>
        </section>
      )}

      {extra?.keywords && extra.keywords.length > 0 && (
        <section>
          <p className="text-[10px] font-black uppercase tracking-widest text-primary/40 mb-2">Keywords</p>
          <div className="flex flex-wrap gap-2">
            {extra.keywords.map(k => (
              <span key={k} className="px-3 py-1 rounded-full border border-border bg-background text-[10px] font-bold text-muted-foreground">{k}</span>
            ))}
          </div>
        </section>
      )}

      <section>
        <p className="text-[10px] font-black uppercase tracking-widest text-primary/40 mb-3">Authorship</p>
        <div className="grid gap-3">
          {extra?.authors.map(a => (
            <div key={a.id} className="p-4 rounded-2xl border border-border/40 bg-background flex items-center justify-between group hover:border-primary/30 transition-all">
              <div>
                <p className="text-sm font-black text-foreground">{a.full_name}</p>
                <p className="text-[10px] font-medium text-muted-foreground">{a.email} · {a.affiliation || 'No Affiliation'}</p>
              </div>
              {a.is_corresponding && <span className="text-[8px] font-black uppercase tracking-widest bg-primary/10 text-primary px-2 py-1 rounded">Corresponding</span>}
            </div>
          ))}
        </div>
      </section>

      <section>
        <p className="text-[10px] font-black uppercase tracking-widest text-primary/40 mb-3">Manuscript Documents</p>
        <div className="grid gap-2">
          {extra?.files.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">No files uploaded yet.</p>
          ) : (
            extra?.files.map(f => (
              <button 
                key={f.id} 
                onClick={() => {
                  const [b, ...rest] = f.storage_path.split("/");
                  supabase.storage.from(b).createSignedUrl(rest.join("/"), 60).then(({ data }: { data: { signedUrl: string } | null }) => {
                    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
                  });
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-border/40 bg-background hover:border-primary/30 hover:bg-primary/5 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <FileText size={16} />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-black text-foreground uppercase tracking-wider">{f.kind.replace(/_/g, ' ')}</p>
                    <p className="text-[10px] text-muted-foreground truncate max-w-[200px]">{f.name || f.storage_path.split('/').pop()}</p>
                  </div>
                </div>
                <ExternalLink size={14} className="text-muted-foreground group-hover:text-primary" />
              </button>
            ))
          )}
        </div>
      </section>

      <section className="pt-4 border-t border-border/40">
        <Link 
          to="/submissions/$id" 
          params={{ id: sub.id }} 
          className="flex items-center justify-center gap-3 w-full rounded-2xl bg-primary py-4 text-xs font-black uppercase tracking-[0.2em] text-white hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-primary/20"
        >
          Enter Full Review Console
        </Link>
      </section>
    </div>
  );
}
