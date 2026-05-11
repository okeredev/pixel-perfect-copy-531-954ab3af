import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckCircle2, FileText, Upload, BookOpen, Clock, XCircle, CreditCard } from "lucide-react";
import { CommentsPanel } from "@/routes/_authenticated/submissions.$id"; // Wait, circular?
// Actually, it's better to pass CommentsPanel or just use the local one.
// I'll just use the local one or assume it's passed as children.

// For now, I'll just keep the logic and move the UI.
// But wait, the file already has a lot of dependencies.

export function AdminReviewConsole({
  sub,
  files,
  authors,
  history,
  userId,
  onChange,
}: {
  sub: any;
  files: any[];
  authors: any[];
  history: any[];
  userId: string;
  onChange: () => void;
}) {
  const [busy, setBusy] = useState(false);

  async function updateStatus(newStatus: string) {
    const progressing = ["under_review", "revisions_requested", "accepted", "published"].includes(newStatus);
    if (progressing && sub.payment_status !== "confirmed") {
      return toast.error("Payment must be confirmed before proceeding with this manuscript.");
    }

    const note = prompt("Optional note for this status change:");
    setBusy(true);
    const { error } = await supabase
      .from("submissions")
      .update({ 
        status: newStatus as any,
        ...(newStatus === 'published' ? { published_at: new Date().toISOString() } : {})
      })
      .eq("id", sub.id);
    
    if (error) {
      setBusy(false);
      return toast.error(error.message);
    }

    if (note) {
      await supabase.from("submission_status_history").insert({
        submission_id: sub.id,
        from_status: sub.status,
        to_status: newStatus,
        note
      });
    }

    setBusy(false);
    toast.success(`Status updated to ${newStatus.replace('_', ' ')}`);
    onChange();
  }

  async function updatePayment(newStatus: string) {
    const { error } = await supabase
      .from("submissions")
      .update({ payment_status: newStatus as any })
      .eq("id", sub.id);
    
    if (error) return toast.error(error.message);
    toast.success(`Payment marked as ${newStatus}`);
    onChange();
  }

  const groupedFiles = files.reduce((acc, f) => {
    if (!acc[f.kind]) acc[f.kind] = [];
    acc[f.kind].push(f);
    return acc;
  }, {} as Record<string, any[]>);

  const kindLabels: Record<string, string> = {
    manuscript: "Main Manuscript",
    cover_letter: "Cover Letter",
    supplementary: "Supplementary Material",
    payment_evidence: "Payment Receipt",
    ethical_approval: "Ethical Approval",
    conflict_interest: "Conflict of Interest",
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-2xl border border-primary/20 bg-primary/5 p-6 shadow-sm">
            <h2 className="font-display text-lg font-bold text-primary flex items-center gap-2">
              <CheckCircle2 size={20} /> Editorial Actions
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {['under_review', 'revisions_requested', 'accepted', 'rejected', 'published', 'withdrawn'].map((s) => (
                <button
                  key={s}
                  disabled={busy || sub.status === s}
                  onClick={() => updateStatus(s)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                    sub.status === s
                      ? "bg-primary text-primary-foreground opacity-100"
                      : "bg-background border border-border text-foreground/70 hover:border-primary hover:text-primary active:scale-95"
                  }`}
                >
                  {s.replace('_', ' ').toUpperCase()}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
            <h2 className="font-display text-lg font-bold text-primary mb-4 flex items-center gap-2">
              <FileText size={20} /> All Submission Files
            </h2>
            <div className="space-y-6">
              {Object.keys(groupedFiles).length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No files uploaded yet.</p>
              ) : (
                Object.entries(groupedFiles).map(([kind, kFiles]) => (
                  <div key={kind} className="space-y-3">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40 flex items-center gap-2">
                      <span className="h-1 w-4 bg-primary/20 rounded-full" />
                      {kindLabels[kind] || kind.replace('_', ' ')}
                    </h3>
                    <div className="grid gap-2">
                      {kFiles.map(f => (
                        <div key={f.id} className="flex items-center justify-between p-3 rounded-xl border border-border/40 bg-background/50 hover:bg-background transition-all group hover:scale-[1.01]">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/5 text-primary">
                              <FileText size={18} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold truncate max-w-[200px] md:max-w-md">{f.filename}</p>
                              <p className="text-[10px] font-medium text-muted-foreground">{(f.size_bytes! / 1024 / 1024).toFixed(2)} MB · {new Date(f.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => {
                              const [b, ...rest] = f.storage_path.split("/");
                              supabase.storage.from(b).createSignedUrl(rest.join("/"), 60).then(({ data }) => {
                                if (data?.signedUrl) window.open(data.signedUrl, "_blank");
                              });
                            }}
                            className="p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all shadow-sm"
                            title="Download/View"
                          >
                            <Upload size={16} className="rotate-180" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {['accepted', 'published'].includes(sub.status) && (
            <section className="rounded-[2.5rem] border-2 border-primary/20 bg-primary/5 p-10 shadow-2xl reveal-anim">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1">
                  <h2 className="font-display text-2xl font-black text-primary tracking-tight mb-2">Public Publication</h2>
                  <p className="text-sm font-medium text-foreground/60 leading-relaxed max-w-lg">
                    {sub.status === 'published' 
                      ? "This submission is currently live in the Journal Archive. You can retract it by changing the status above."
                      : "This submission has been accepted. You can now publish it to the front-end Archive for public viewing."}
                  </p>
                </div>
                {sub.status !== 'published' && (
                  <button 
                    onClick={() => updateStatus('published')}
                    disabled={busy}
                    className="inline-flex items-center gap-3 rounded-2xl bg-primary px-10 py-5 text-xs font-black uppercase tracking-widest text-white hover:bg-primary/90 transition-all hover:scale-[1.05] active:scale-95 shadow-2xl shadow-primary/20"
                  >
                    <BookOpen size={18} /> Publish to Archive
                  </button>
                )}
              </div>
            </section>
          )}
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
            <h2 className="font-display text-base font-bold text-primary mb-4 flex items-center gap-2">
              <CreditCard size={18} /> Payment Verification
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Status</span>
                <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  sub.payment_status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-700' :
                  sub.payment_status === 'rejected' ? 'bg-rose-500/10 text-rose-700' : 'bg-amber-500/10 text-amber-700'
                }`}>
                  {sub.payment_status}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <button onClick={() => updatePayment('confirmed')} className="w-full py-2 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-emerald-700 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/10 transition-all">Confirm Payment</button>
                <button onClick={() => updatePayment('rejected')} className="w-full py-2 rounded-xl border border-rose-500/30 bg-rose-500/5 text-rose-700 text-[10px] font-black uppercase tracking-widest hover:bg-rose-500/10 transition-all">Reject Payment</button>
                <button onClick={() => updatePayment('pending')} className="w-full py-2 rounded-xl border border-border bg-muted/20 text-muted-foreground text-[10px] font-black uppercase tracking-widest hover:bg-muted/30 transition-all">Reset to Pending</button>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
            <h2 className="font-display text-base font-bold text-primary mb-4 flex items-center gap-2">
              <Clock size={18} /> Timeline
            </h2>
            <div className="space-y-4 border-l-2 border-border/60 pl-4 ml-2">
              {history.map((h: any) => (
                <div key={h.id} className="relative">
                  <div className="absolute -left-[1.35rem] top-1.5 h-2.5 w-2.5 rounded-full bg-primary border-2 border-background" />
                  <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest">{new Date(h.created_at).toLocaleDateString()}</p>
                  <p className="text-xs font-bold text-foreground mt-0.5">{h.to_status.replace('_', ' ')}</p>
                  {h.note && <p className="text-[11px] text-muted-foreground italic mt-1 leading-relaxed">"{h.note}"</p>}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
