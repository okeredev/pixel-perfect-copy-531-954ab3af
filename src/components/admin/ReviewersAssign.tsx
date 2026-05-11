import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function ReviewersAssign({ submissionId, assignedBy }: { submissionId: string; assignedBy: string }) {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [assigned, setAssigned] = useState<any[]>([]);
  const [pickId, setPickId] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const { data: roles } = await supabase.from("user_roles").select("user_id, role").in("role", ["reviewer", "editor", "admin"]);
    const ids = Array.from(new Set((roles ?? []).map((r) => r.user_id)));
    const { data: profs } = ids.length ? await supabase.from("profiles").select("id, full_name, email").in("id", ids) : { data: [] };
    setCandidates((profs ?? []));
    const { data: rev } = await supabase.from("submission_reviewers").select("id, reviewer_id, status, created_at").eq("submission_id", submissionId).order("created_at");
    const rows = (rev ?? []); const map = new Map((profs ?? []).map((p: any) => [p.id, p]));
    rows.forEach((r: any) => { r.reviewer = map.get(r.reviewer_id) ?? null; });
    setAssigned(rows);
  }

  useEffect(() => { load(); }, [submissionId]);

  async function assign() {
    if (!pickId) return; setBusy(true);
    const { error } = await supabase.from("submission_reviewers").insert({ submission_id: submissionId, reviewer_id: pickId, assigned_by: assignedBy });
    setBusy(false); if (error) return toast.error(error.message); toast.success("Reviewer assigned"); setPickId(""); load();
  }

  async function unassign(id: string) { 
    const { error } = await supabase.from("submission_reviewers").delete().eq("id", id); 
    if (error) return toast.error(error.message); 
    toast.success("Reviewer removed"); load(); 
  }

  const available = candidates.filter((c) => !assigned.some((a) => a.reviewer_id === c.id));

  return (
    <div className="rounded-xl border border-border/60 bg-background p-4" onClick={(e) => e.stopPropagation()}>
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Assigned reviewers</p>
      {assigned.length === 0 ? <p className="text-xs text-muted-foreground">No reviewers assigned yet.</p> : (
        <ul className="space-y-2">{assigned.map((a) => (
          <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 bg-card px-3 py-2 text-sm">
            <div className="min-w-0"><p className="truncate font-medium text-foreground">{a.reviewer?.full_name || a.reviewer?.email || a.reviewer_id.slice(0, 8)}</p><p className="text-[11px] text-muted-foreground">{a.reviewer?.email} · {a.status} · {new Date(a.created_at).toLocaleDateString()}</p></div>
            <button onClick={() => unassign(a.id)} className="text-xs text-muted-foreground hover:text-destructive">Remove</button>
          </li>
        ))}</ul>
      )}
      <div className="mt-3 flex flex-col gap-2 sm:flex-row"><select value={pickId} onChange={(e) => setPickId(e.target.value)} className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm"><option value="">Select a reviewer…</option>{available.map((c) => <option key={c.id} value={c.id}>{c.full_name || c.email || c.id.slice(0, 8)} {c.email ? `— ${c.email}` : ""}</option>)}</select><button onClick={assign} disabled={!pickId || busy} className="rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60">Assign</button></div>
    </div>
  );
}
