import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type AdminComment = {
  id: string; author_id: string; is_staff: boolean; body: string; created_at: string;
  author?: { full_name: string | null; email: string | null } | null;
};

export function AdminCommentsThread({ submissionId, userId }: { submissionId: string; userId: string }) {
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    const { data } = await supabase.from("submission_comments").select("id, author_id, is_staff, body, created_at").eq("submission_id", submissionId).order("created_at", { ascending: true });
    const rows = (data ?? []) as AdminComment[];
    const ids = Array.from(new Set(rows.map((r) => r.author_id)));
    if (ids.length) {
      const { data: profs } = await supabase.from("profiles").select("id, full_name, email").in("id", ids);
      const map = new Map((profs ?? []).map((p) => [p.id, p]));
      rows.forEach((r) => { r.author = map.get(r.author_id) as any; });
    }
    setComments(rows); setLoading(false);
  }

  useEffect(() => { load(); }, [submissionId]);

  async function send() {
    if (!body.trim()) return; setBusy(true);
    const { error } = await supabase.from("submission_comments").insert({ submission_id: submissionId, author_id: userId, is_staff: true, body: body.trim() });
    setBusy(false); if (error) return toast.error(error.message); setBody(""); load();
  }

  return (
    <div className="rounded-xl border border-border/60 bg-background p-4" onClick={(e) => e.stopPropagation()}>
      <div className="space-y-2 max-h-72 overflow-y-auto">
        {loading ? <p className="text-xs text-muted-foreground">Loading…</p> : comments.length === 0 ? <p className="text-xs text-muted-foreground">No messages yet.</p> : comments.map((c) => (
          <div key={c.id} className={`rounded-lg px-3 py-2 text-sm ${c.is_staff ? "bg-primary/10 border border-primary/20" : "bg-muted/40 border border-border"}`}>
            <div className="mb-0.5 text-[10px] uppercase tracking-wide text-muted-foreground"><span className="font-semibold text-foreground/80">{c.is_staff ? "Editorial" : c.author?.full_name || c.author?.email || "Author"}</span><span className="ml-2">{new Date(c.created_at).toLocaleString()}</span></div>
            <p className="whitespace-pre-wrap text-foreground/90">{c.body}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row"><textarea value={body} onChange={(e) => setBody(e.target.value)} rows={2} placeholder="Reply to the author…" className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm" /><button onClick={send} disabled={busy || !body.trim()} className="self-end rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60">Send</button></div>
    </div>
  );
}
