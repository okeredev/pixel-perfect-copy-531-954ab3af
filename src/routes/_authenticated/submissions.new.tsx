import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

const schema = z.object({
  type: z.enum(["journal", "conference"]),
  conference_stage: z.enum(["abstract", "full_paper"]).optional(),
  title: z.string().trim().min(8, "Title is too short").max(300),
  abstract: z.string().trim().min(80, "Abstract should be at least 80 characters").max(5000),
  keywords: z.string().trim().max(400),
  track: z.string().trim().max(120).optional(),
});

export const Route = createFileRoute("/_authenticated/submissions/new")({
  component: NewSubmissionPage,
});

function NewSubmissionPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [type, setType] = useState<"journal" | "conference">("journal");
  const [stage, setStage] = useState<"abstract" | "full_paper">("abstract");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      type,
      conference_stage: type === "conference" ? stage : undefined,
      title: String(fd.get("title") ?? ""),
      abstract: String(fd.get("abstract") ?? ""),
      keywords: String(fd.get("keywords") ?? ""),
      track: String(fd.get("track") ?? ""),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    const keywords = parsed.data.keywords
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    const { data, error } = await supabase
      .from("submissions")
      .insert({
        owner_id: user.id,
        type: parsed.data.type,
        conference_stage: parsed.data.conference_stage ?? null,
        title: parsed.data.title,
        abstract: parsed.data.abstract,
        keywords,
        track: parsed.data.track || null,
        status: "draft",
      })
      .select("id")
      .single();

    setSubmitting(false);
    if (error || !data) {
      const msg = error?.message ?? "Could not create submission";
      if (msg.includes("infinite recursion")) {
        toast.error("Database configuration issue — please contact the administrator to apply the latest migration.");
      } else {
        toast.error(msg);
      }
      return;
    }
    toast.success("Draft created");
    navigate({ to: "/submissions/$id", params: { id: data.id } });
  }

  return (
    <section>
      <header className="mb-6">
        <h1 className="font-display text-3xl font-bold text-primary">New Submission</h1>
        <p className="text-sm text-muted-foreground">
          Create a draft. You can upload files and add co-authors on the next step.
        </p>
      </header>

      <form onSubmit={onSubmit} className="space-y-6 rounded-2xl border border-border/60 bg-card p-6">
        <div>
          <label className="mb-2 block text-sm font-medium">Submission type</label>
          <div className="flex gap-2">
            {(["journal", "conference"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`rounded-full border px-4 py-2 text-sm capitalize ${
                  type === t
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:border-primary/50"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {type === "conference" && (
          <div>
            <label className="mb-2 block text-sm font-medium">Conference stage</label>
            <div className="flex gap-2">
              {(["abstract", "full_paper"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStage(s)}
                  className={`rounded-full border px-4 py-2 text-sm ${
                    stage === s
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:border-primary/50"
                  }`}
                >
                  {s.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>
        )}

        <Field label="Title" name="title" placeholder="Working title of the paper" required />
        <Field
          label="Track or thematic area"
          name="track"
          placeholder="e.g. Education, Public Health, Engineering"
        />
        <div>
          <label className="mb-2 block text-sm font-medium">Abstract</label>
          <textarea
            name="abstract"
            required
            rows={8}
            maxLength={5000}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
            placeholder="Background, methods, key findings, and contribution (max 5000 chars)."
          />
        </div>
        <Field
          label="Keywords"
          name="keywords"
          placeholder="Comma-separated, e.g. literacy, sub-Saharan, policy"
        />

        <div className="flex justify-end gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {submitting ? "Saving…" : "Save draft"}
          </button>
        </div>
      </form>
    </section>
  );
}

function Field({
  label,
  name,
  placeholder,
  required,
}: {
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      <input
        name={name}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
      />
    </div>
  );
}
