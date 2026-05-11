import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Upload, FileText, Trash2, Send, UserPlus, Banknote, Receipt, MessageSquare, CheckCircle2, XCircle, Clock } from "lucide-react";
import { AdminCommentsThread } from "@/components/admin/AdminCommentsThread";
import { ReviewersAssign } from "@/components/admin/ReviewersAssign";
import { AdminReviewConsole } from "@/components/admin/AdminReviewConsole";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

type Pricing = { journal_amount: number; conference_amount: number; currency: string; note: string };
type PaymentAccount = { bank_name: string; account_name: string; account_number: string; instructions: string };

type Submission = {
  id: string;
  owner_id: string;
  type: "journal" | "conference";
  status: string;
  payment_status: "pending" | "confirmed" | "rejected";
  conference_stage: string | null;
  title: string;
  abstract: string;
  keywords: string[];
  track: string | null;
  created_at: string;
  updated_at: string;
  submitted_at: string | null;
};

type FileRow = {
  id: string;
  kind: string;
  filename: string;
  storage_path: string;
  size_bytes: number | null;
  created_at: string;
};

type AuthorRow = {
  id: string;
  position: number;
  full_name: string;
  email: string;
  affiliation: string | null;
  orcid: string | null;
  is_corresponding: boolean;
};

type StatusRow = {
  id: string;
  from_status: string | null;
  to_status: string;
  note: string | null;
  created_at: string;
};

// Manuscript-side categories. Payment evidence is uploaded from its own
// dedicated panel, so we don't list it here.
const FILE_KINDS = [
  {
    value: "manuscript",
    label: "Manuscript / full paper",
    hint: "Main document. PDF or DOCX, max ~50 MB.",
    accept: ".pdf,.doc,.docx",
  },
  {
    value: "cover_letter",
    label: "Cover letter",
    hint: "Optional letter to the editor. PDF or DOCX.",
    accept: ".pdf,.doc,.docx",
  },
  {
    value: "supplementary",
    label: "Supplementary materials",
    hint: "Datasets, figures, appendices. PDF / DOCX / images / ZIP.",
    accept: ".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip,.csv,.xlsx",
  },
] as const;

type FileKindValue = (typeof FILE_KINDS)[number]["value"];

export const Route = createFileRoute("/_authenticated/submissions/$id")({
  component: SubmissionDetailPage,
});

function SubmissionDetailPage() {
  const { id } = Route.useParams();
  const { user, roles } = useAuth();
  const isAdmin = roles.includes("admin") || roles.includes("editor");
  const [pricing, setPricing] = useState<Pricing | null>(null);
  const [account, setAccount] = useState<PaymentAccount | null>(null);
  const [sub, setSub] = useState<Submission | null>(null);
  const [files, setFiles] = useState<FileRow[]>([]);
  const [authors, setAuthors] = useState<AuthorRow[]>([]);
  const [history, setHistory] = useState<StatusRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function reload() {
    const [s, f, a, h, settings] = await Promise.all([
      supabase.from("submissions").select("*").eq("id", id).maybeSingle(),
      supabase.from("submission_files").select("*").eq("submission_id", id).order("created_at"),
      supabase.from("submission_authors").select("*").eq("submission_id", id).order("position"),
      supabase.from("submission_status_history").select("*").eq("submission_id", id).order("created_at"),
      supabase.from("app_settings").select("key, value").in("key", ["submission_pricing", "payment_account"]),
    ]);
    setSub((s.data as Submission) ?? null);
    setFiles((f.data ?? []) as FileRow[]);
    setAuthors((a.data ?? []) as AuthorRow[]);
    setHistory((h.data ?? []) as StatusRow[]);
    (settings.data ?? []).forEach((row) => {
      if (row.key === "submission_pricing") setPricing(row.value as Pricing);
      if (row.key === "payment_account") setAccount(row.value as PaymentAccount);
    });
    setLoading(false);
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }
  if (!sub) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">Submission not found.</p>
        <Link to="/dashboard" className="mt-3 inline-block text-sm text-primary underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const editable = ["draft", "submitted", "revisions_requested", "rejected"].includes(sub.status);
  const isRejected = sub.status === "rejected";

  const hasManuscript = files.some((f) => f.kind !== "payment_evidence");
  const hasPayment = files.some((f) => f.kind === "payment_evidence");

  async function submitForReview() {
    if (!sub) return;
    if (!hasManuscript) {
      toast.error("Upload your manuscript before submitting.");
      return;
    }
    if (!hasPayment) {
      toast.error("Upload your payment evidence before submitting.");
      return;
    }
    const { error } = await supabase
      .from("submissions")
      .update({ status: "submitted", submitted_at: new Date().toISOString() })
      .eq("id", sub.id);
    if (error) return toast.error(error.message);
    toast.success("Submitted for editorial review");
    reload();
  }

  async function withdraw() {
    if (!sub) return;
    if (!confirm("Withdraw this submission? This cannot be undone.")) return;
    const { error } = await supabase
      .from("submissions")
      .update({ status: "withdrawn" })
      .eq("id", sub.id);
    if (error) return toast.error(error.message);
    toast.success("Submission withdrawn");
    reload();
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center animate-pulse">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Retrieving Manuscript…</p>
      </div>
    );
  }

  if (!sub) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 rounded-[3rem] border-2 border-dashed border-border/60 bg-card p-12 text-center animate-in fade-in zoom-in-95 duration-500">
        <XCircle size={64} className="text-destructive/20" />
        <div>
          <h1 className="font-display text-3xl font-black text-primary">Submission not found</h1>
          <p className="mt-2 text-muted-foreground max-w-sm mx-auto">
            The submission you are looking for does not exist or you don't have permission to view it.
          </p>
        </div>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-all hover:scale-105"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft size={14} /> Back
        </Link>
        <div className="flex items-center gap-2">
          <PaymentBadge status={sub.payment_status} />
          <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-primary">
            {sub.status.replaceAll("_", " ")}
          </span>
        </div>
      </div>

      {isRejected && (
        <div className="rounded-2xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-900">
          <p className="font-semibold">This submission was rejected.</p>
          <p className="mt-1 text-rose-800/90">
            You can edit your manuscript, files and authors below, then resubmit when ready. Please review the editor's
            comments at the bottom of this page.
          </p>
        </div>
      )}

      <header className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all hover:shadow-md animate-in fade-in slide-in-from-top-4 duration-500">
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {sub.type}
          {sub.conference_stage ? ` · ${sub.conference_stage.replaceAll("_", " ")}` : ""}
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold text-primary">{sub.title}</h1>
        {sub.track && <p className="mt-1 text-xs text-muted-foreground">Track: {sub.track}</p>}
        <p className="mt-4 whitespace-pre-wrap text-sm text-foreground/85 leading-relaxed">{sub.abstract}</p>
        {sub.keywords.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {sub.keywords.map((k) => (
              <span
                key={k}
                className="rounded-full border border-border bg-background px-3 py-1 text-xs text-foreground/80 hover:border-primary/50 transition-colors"
              >
                {k}
              </span>
            ))}
          </div>
        )}

        {editable && !isAdmin && (
          <div className="mt-6 flex flex-wrap gap-2">
            {(sub.status === "draft" || sub.status === "rejected") && (
              <button
                onClick={submitForReview}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
              >
                <Send size={14} /> {sub.status === "rejected" ? "Resubmit" : "Submit for review"}
              </button>
            )}
            <button
              onClick={withdraw}
              className="rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:border-destructive hover:text-destructive transition-colors"
            >
              Withdraw
            </button>
          </div>
        )}
      </header>

      {isAdmin ? (
        <AdminReviewConsole 
          sub={sub} 
          files={files} 
          authors={authors} 
          history={history} 
          userId={user!.id}
          onChange={reload} 
        />
      ) : (
        <>
          {editable && pricing && account && (
            <PaymentInfoPanel
              type={sub.type}
              pricing={pricing}
              account={account}
              hasPayment={hasPayment}
              submissionId={sub.id}
              userId={user!.id}
              paymentFiles={files.filter((f) => f.kind === "payment_evidence")}
              onChange={reload}
            />
          )}

          <FilesPanel
            submissionId={sub.id}
            userId={user!.id}
            editable={editable}
            hasPayment={hasPayment}
            files={files.filter((f) => f.kind !== "payment_evidence")}
            onChange={reload}
          />

          <AuthorsPanel
            submissionId={sub.id}
            editable={editable}
            authors={authors}
            onChange={reload}
          />

          <CommentsPanel submissionId={sub.id} userId={user!.id} />

          <HistoryPanel history={history} />
        </>
      )}
    </section>
  );
}
function FilesPanel({
  submissionId,
  userId,
  editable,
  hasPayment,
  files,
  onChange,
}: {
  submissionId: string;
  userId: string;
  editable: boolean;
  hasPayment: boolean;
  files: FileRow[];
  onChange: () => void;
}) {
  const locked = editable && !hasPayment;

  return (
    <section className="rounded-2xl border border-border/60 bg-card p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-primary">Manuscript files</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Upload your manuscript and supporting documents in the slots below.
          </p>
        </div>
        {locked && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-amber-800">
            Payment required
          </span>
        )}
      </div>

      {locked && (
        <div className="mt-4 rounded-xl border border-dashed border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          File uploads unlock once you upload your payment evidence in the section above.
        </div>
      )}

      <div className="mt-5 space-y-5">
        {FILE_KINDS.map((k) => (
          <FileSlot
            key={k.value}
            kind={k.value}
            label={k.label}
            hint={k.hint}
            accept={k.accept}
            multiple={k.value === "supplementary"}
            submissionId={submissionId}
            userId={userId}
            bucket="submissions"
            editable={editable && hasPayment}
            files={files.filter((f) => f.kind === k.value)}
            onChange={onChange}
          />
        ))}
      </div>
    </section>
  );
}

function FileSlot({
  kind,
  label,
  hint,
  accept,
  multiple,
  submissionId,
  userId,
  bucket,
  editable,
  files,
  onChange,
}: {
  kind: FileKindValue | "payment_evidence";
  label: string;
  hint: string;
  accept: string;
  multiple?: boolean;
  submissionId: string;
  userId: string;
  bucket: "submissions" | "payment-evidence";
  editable: boolean;
  files: FileRow[];
  onChange: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      toast.error("File is larger than 50 MB.");
      return;
    }
    setUploading(true);
    const path = `${userId}/${submissionId}/${kind}/${Date.now()}-${file.name}`;
    const up = await supabase.storage.from(bucket).upload(path, file, {
      upsert: false,
      contentType: file.type,
    });
    if (up.error) {
      setUploading(false);
      toast.error(up.error.message);
      return;
    }
    const { error } = await supabase.from("submission_files").insert({
      submission_id: submissionId,
      uploaded_by: userId,
      kind: kind as never,
      storage_path: `${bucket}/${path}`,
      filename: file.name,
      mime_type: file.type,
      size_bytes: file.size,
    });
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
    if (error) return toast.error(error.message);
    toast.success(`${label} uploaded`);
    onChange();
  }

  async function download(f: FileRow) {
    const [b, ...rest] = f.storage_path.split("/");
    const { data, error } = await supabase.storage.from(b).createSignedUrl(rest.join("/"), 60);
    if (error || !data) return toast.error(error?.message ?? "Could not generate link");
    window.open(data.signedUrl, "_blank");
  }

  async function remove(f: FileRow) {
    if (!confirm(`Delete ${f.filename}?`)) return;
    const [b, ...rest] = f.storage_path.split("/");
    await supabase.storage.from(b).remove([rest.join("/")]);
    const { error } = await supabase.from("submission_files").delete().eq("id", f.id);
    if (error) return toast.error(error.message);
    toast.success("File removed");
    onChange();
  }

  const canUpload = editable && (multiple || files.length === 0);
  const isEmpty = files.length === 0;

  return (
    <div className="rounded-xl border border-border/60 bg-background p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">
          {label}
          {!multiple && <span className="ml-2 text-[10px] font-normal uppercase tracking-wide text-muted-foreground">Single file</span>}
          {multiple && <span className="ml-2 text-[10px] font-normal uppercase tracking-wide text-muted-foreground">Multiple allowed</span>}
        </h3>
        {!isEmpty && (
          <span className="text-[11px] text-emerald-700">{files.length} uploaded</span>
        )}
      </div>
      <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>

      {canUpload && (
        <label
          className={`mt-3 flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed px-4 py-5 text-center transition ${
            uploading
              ? "border-primary/40 bg-primary/5"
              : isEmpty
                ? "border-primary/50 bg-primary/5 hover:border-primary hover:bg-primary/10"
                : "border-border bg-background hover:border-primary/60 hover:bg-primary/5"
          }`}
        >
          <Upload size={18} className="text-primary" />
          <span className="text-sm font-medium text-foreground">
            {uploading ? "Uploading…" : isEmpty ? `Click to upload ${label.toLowerCase()}` : `Add another ${label.toLowerCase()} file`}
          </span>
          <span className="text-[11px] text-muted-foreground">{accept.replaceAll(",", ", ")} · max 50 MB</span>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={handleFile}
            disabled={uploading}
          />
        </label>
      )}

      {!canUpload && isEmpty && (
        <div className="mt-3 rounded-xl border border-dashed border-border/60 bg-muted/30 px-4 py-5 text-center text-xs text-muted-foreground">
          Locked
        </div>
      )}

      {files.length > 0 && (
        <ul className="mt-3 divide-y divide-border/60">
          {files.map((f) => (
            <li key={f.id} className="flex items-center justify-between gap-3 py-2">
              <button
                onClick={() => download(f)}
                className="flex min-w-0 items-center gap-2 text-left text-sm text-foreground hover:text-primary"
              >
                <FileText size={14} className="shrink-0 text-muted-foreground" />
                <span className="truncate">{f.filename}</span>
                {f.size_bytes != null && (
                  <span className="text-[11px] text-muted-foreground">
                    {(f.size_bytes / 1024 / 1024).toFixed(2)} MB
                  </span>
                )}
              </button>
              {editable && (
                <button
                  onClick={() => remove(f)}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label="Delete"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AuthorsPanel({
  submissionId,
  editable,
  authors,
  onChange,
}: {
  submissionId: string;
  editable: boolean;
  authors: AuthorRow[];
  onChange: () => void;
}) {
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);

  async function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    const { error } = await supabase.from("submission_authors").insert({
      submission_id: submissionId,
      position: authors.length + 1,
      full_name: String(fd.get("full_name") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim(),
      affiliation: String(fd.get("affiliation") ?? "").trim() || null,
      orcid: String(fd.get("orcid") ?? "").trim() || null,
      is_corresponding: fd.get("is_corresponding") === "on",
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Author added");
    setAdding(false);
    onChange();
  }

  async function remove(a: AuthorRow) {
    if (!confirm(`Remove ${a.full_name}?`)) return;
    const { error } = await supabase.from("submission_authors").delete().eq("id", a.id);
    if (error) return toast.error(error.message);
    onChange();
  }

  return (
    <section className="rounded-2xl border border-border/60 bg-card p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-primary">Authors</h2>
        {editable && !adding && (
          <button
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <UserPlus size={14} /> Add author
          </button>
        )}
      </div>

      <ul className="mt-4 divide-y divide-border/60">
        {authors.length === 0 && (
          <li className="py-3 text-sm text-muted-foreground">No co-authors added yet.</li>
        )}
        {authors.map((a) => (
          <li key={a.id} className="flex items-start justify-between gap-3 py-3">
            <div>
              <p className="text-sm font-medium text-foreground">
                {a.full_name}
                {a.is_corresponding && (
                  <span className="ml-2 rounded bg-primary/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-primary">
                    Corresponding
                  </span>
                )}
              </p>
              <p className="text-xs text-muted-foreground">{a.email}</p>
              {a.affiliation && <p className="text-xs text-muted-foreground">{a.affiliation}</p>}
              {a.orcid && <p className="text-xs text-muted-foreground">ORCID: {a.orcid}</p>}
            </div>
            {editable && (
              <button
                onClick={() => remove(a)}
                className="text-muted-foreground hover:text-destructive"
                aria-label="Remove"
              >
                <Trash2 size={15} />
              </button>
            )}
          </li>
        ))}
      </ul>

      {adding && (
        <form
          onSubmit={add}
          className="mt-4 grid gap-3 rounded-xl border border-dashed border-border bg-background p-4 sm:grid-cols-2"
        >
          <input name="full_name" required placeholder="Full name" className="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          <input name="email" required type="email" placeholder="Email" className="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          <input name="affiliation" placeholder="Affiliation" className="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          <input name="orcid" placeholder="ORCID (optional)" className="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          <label className="inline-flex items-center gap-2 text-sm text-foreground/80 sm:col-span-2">
            <input type="checkbox" name="is_corresponding" /> Corresponding author
          </label>
          <div className="flex gap-2 sm:col-span-2">
            <button
              type="submit"
              disabled={busy}
              className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              {busy ? "Saving…" : "Add"}
            </button>
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="rounded-full border border-border px-4 py-2 text-sm hover:border-primary"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

function HistoryPanel({ history }: { history: StatusRow[] }) {
  if (history.length === 0) return null;
  return (
    <section className="rounded-2xl border border-border/60 bg-card p-6">
      <h2 className="font-display text-lg font-semibold text-primary">Status history</h2>
      <ol className="mt-4 space-y-3 border-l border-border pl-4">
        {history.map((h) => (
          <li key={h.id} className="text-sm">
            <p className="text-foreground">
              {h.from_status ? `${h.from_status.replaceAll("_", " ")} → ` : ""}
              <span className="font-medium text-primary">{h.to_status.replaceAll("_", " ")}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              {new Date(h.created_at).toLocaleString()}
            </p>
            {h.note && <p className="mt-1 text-xs text-foreground/80">{h.note}</p>}
          </li>
        ))}
      </ol>
    </section>
  );
}

function PaymentInfoPanel({
  type,
  pricing,
  account,
  hasPayment,
  submissionId,
  userId,
  paymentFiles,
  onChange,
}: {
  type: "journal" | "conference";
  pricing: Pricing;
  account: PaymentAccount;
  hasPayment: boolean;
  submissionId: string;
  userId: string;
  paymentFiles: FileRow[];
  onChange: () => void;
}) {
  const amount = type === "journal" ? pricing.journal_amount : pricing.conference_amount;
  const formatted = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: pricing.currency || "NGN",
    maximumFractionDigits: 0,
  }).format(amount);

  return (
    <section className="rounded-2xl border border-primary/30 bg-primary/5 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-primary">
            <Receipt size={14} /> Step 1 — Submission fee
          </div>
          <p className="mt-1 font-display text-2xl font-bold text-primary">{formatted}</p>
          {pricing.note && (
            <p className="mt-1 text-xs text-muted-foreground">{pricing.note}</p>
          )}
        </div>
        <span
          className={`rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-wide ${
            hasPayment ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
          }`}
        >
          {hasPayment ? "Payment received" : "Awaiting payment"}
        </span>
      </div>

      <div className="mt-4 grid gap-3 rounded-xl border border-border/60 bg-background p-4 sm:grid-cols-2">
        <Detail icon={<Banknote size={14} />} label="Bank" value={account.bank_name} />
        <Detail label="Account name" value={account.account_name} />
        <Detail label="Account number" value={account.account_number} />
        <Detail label="Reference" value="Use your submission title" />
      </div>

      {account.instructions && (
        <p className="mt-3 text-xs text-muted-foreground">{account.instructions}</p>
      )}

      <div className="mt-4">
        <FileSlot
          kind="payment_evidence"
          label="Payment evidence"
          hint="Upload your bank receipt, transfer screenshot, or transaction reference. PDF or image."
          accept=".pdf,.png,.jpg,.jpeg"
          submissionId={submissionId}
          userId={userId}
          bucket="payment-evidence"
          editable={true}
          files={paymentFiles}
          onChange={onChange}
        />
      </div>
    </section>
  );
}

function Detail({
  icon,
  label,
  value,
}: {
  icon?: import("react").ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className="text-sm font-medium text-foreground">{value || "—"}</p>
    </div>
  );
}

function PaymentBadge({ status }: { status: "pending" | "confirmed" | "rejected" }) {
  const map = {
    pending: { label: "Payment pending", cls: "bg-amber-100 text-amber-800", Icon: Clock },
    confirmed: { label: "Payment confirmed", cls: "bg-emerald-100 text-emerald-800", Icon: CheckCircle2 },
    rejected: { label: "Payment rejected", cls: "bg-rose-100 text-rose-800", Icon: XCircle },
  } as const;
  const { label, cls, Icon } = map[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-wide ${cls}`}>
      <Icon size={12} /> {label}
    </span>
  );
}

type Comment = {
  id: string;
  author_id: string;
  is_staff: boolean;
  body: string;
  created_at: string;
  author?: { full_name: string | null; email: string | null } | null;
};

function CommentsPanel({ submissionId, userId }: { submissionId: string; userId: string }) {
  const { isStaff } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    const { data } = await supabase
      .from("submission_comments")
      .select("id, author_id, is_staff, body, created_at")
      .eq("submission_id", submissionId)
      .order("created_at", { ascending: true });
    const rows = (data ?? []) as Comment[];
    const ids = Array.from(new Set(rows.map((r) => r.author_id)));
    if (ids.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", ids);
      const map = new Map((profs ?? []).map((p) => [p.id, p]));
      rows.forEach((r) => {
        r.author = map.get(r.author_id) ?? null;
      });
    }
    setComments(rows);
    setLoading(false);
  }

  useEffect(() => {
    load();
    const ch = supabase
      .channel(`comments:${submissionId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "submission_comments", filter: `submission_id=eq.${submissionId}` },
        () => load(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submissionId]);

  async function send() {
    if (!body.trim()) return;
    setBusy(true);
    const { error } = await supabase.from("submission_comments").insert({
      submission_id: submissionId,
      author_id: userId,
      is_staff: isStaff,
      body: body.trim(),
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    setBody("");
    load();
  }

  return (
    <section className="rounded-2xl border border-border/60 bg-card p-6">
      <div className="flex items-center gap-2">
        <MessageSquare size={16} className="text-primary" />
        <h2 className="font-display text-lg font-semibold text-primary">Discussion</h2>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Messages between you and the editorial team. Use this thread for clarifications, payment notes, or revision requests.
      </p>

      <div className="mt-4 space-y-3">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : comments.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border/60 bg-background px-4 py-6 text-center text-sm text-muted-foreground">
            No messages yet. Start the conversation below.
          </p>
        ) : (
          comments.map((c) => {
            const mine = c.author_id === userId;
            return (
              <div
                key={c.id}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                    c.is_staff
                      ? "border border-primary/30 bg-primary/10 text-foreground"
                      : "border border-border bg-background text-foreground"
                  }`}
                >
                  <div className="mb-1 flex items-center gap-2 text-[10px] uppercase tracking-wide text-muted-foreground">
                    <span className="font-semibold text-foreground/80">
                      {c.is_staff ? "Editorial" : c.author?.full_name || "Author"}
                    </span>
                    <span>·</span>
                    <span>{new Date(c.created_at).toLocaleString()}</span>
                  </div>
                  <p className="whitespace-pre-wrap">{c.body}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={2}
          placeholder={isStaff ? "Reply to the author…" : "Send a message to the editorial team…"}
          className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm"
        />
        <button
          onClick={send}
          disabled={busy || !body.trim()}
          className="inline-flex items-center justify-center gap-2 self-end rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          <Send size={14} /> Send
        </button>
      </div>
    </section>
  );
}
