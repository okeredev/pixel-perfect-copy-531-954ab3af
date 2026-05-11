import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

type Profile = {
  id: string;
  full_name: string;
  email: string | null;
  affiliation: string | null;
  country: string | null;
  orcid: string | null;
  phone: string | null;
  bio: string | null;
};

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user, roles, isProfileComplete, refreshProfile } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data, error: err }) => {
        if (err) {
          console.error("[Profile]", err.message);
          setError(err.message);
          return;
        }
        setProfile((data as Profile) ?? null);
      });
  }, [user]);

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    const fd = new FormData(e.currentTarget);
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: String(fd.get("full_name") ?? "").trim(),
        affiliation: String(fd.get("affiliation") ?? "").trim() || null,
        country: String(fd.get("country") ?? "").trim() || null,
        orcid: String(fd.get("orcid") ?? "").trim() || null,
        phone: String(fd.get("phone") ?? "").trim() || null,
        bio: String(fd.get("bio") ?? "").trim() || null,
      })
      .eq("id", user.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Profile updated");
    await refreshProfile();
  }

  if (error) {
    return (
      <section>
        <header className="mb-6">
          <h1 className="font-display text-3xl font-bold text-primary">Profile</h1>
        </header>
        <div className="rounded-2xl border border-rose-300 bg-rose-50 p-6 text-center">
          <p className="text-sm font-medium text-rose-900">Could not load your profile</p>
          <p className="mt-1 text-xs text-rose-700">{error}</p>
        </div>
      </section>
    );
  }

  if (!profile) return <p className="py-20 text-center animate-pulse text-sm font-black uppercase tracking-widest text-primary/40">Loading your profile…</p>;

  return (
    <section>
      <header className="mb-6">
        <h1 className="font-display text-3xl font-bold text-primary tracking-tight">User Profile</h1>
        <p className="text-sm text-muted-foreground">
          Your personal and academic details are used for submissions and peer review.
        </p>
        
        {!isProfileComplete && (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 animate-in fade-in slide-in-from-top-2">
            <p className="text-xs font-bold text-amber-800">
              ⚠️ Profile Incomplete: Please fill in your affiliation, country, and phone number to enable new submissions.
            </p>
          </div>
        )}

        {roles.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {roles.map((r) => (
              <span key={r} className="rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
                {r}
              </span>
            ))}
          </div>
        )}
      </header>

      <form onSubmit={save} className="space-y-4 rounded-2xl border border-border/60 bg-card p-6">
        <Field label="Full name" name="full_name" defaultValue={profile.full_name} required />
        <Field label="Email" name="email" defaultValue={profile.email ?? ""} disabled />
        <Field label="Affiliation" name="affiliation" defaultValue={profile.affiliation ?? ""} required placeholder="University or Institution" />
        <Field label="Country" name="country" defaultValue={profile.country ?? ""} required />
        <div>
          <Field label="ORCID iD" name="orcid" defaultValue={profile.orcid ?? ""} placeholder="0000-0000-0000-0000" />
          <p className="mt-1 text-[10px] text-muted-foreground">Optional but highly recommended for researchers.</p>
        </div>
        <Field label="Phone number" name="phone" defaultValue={profile.phone ?? ""} required />
        <div>
          <label className="mb-2 block text-sm font-medium">Short bio</label>
          <textarea
            name="bio"
            rows={5}
            placeholder="Brief professional background…"
            defaultValue={profile.bio ?? ""}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </section>
  );
}

function Field({
  label,
  name,
  defaultValue,
  placeholder,
  required,
  disabled,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium">{label}</label>
      <input
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none disabled:bg-muted disabled:text-muted-foreground"
      />
    </div>
  );
}
