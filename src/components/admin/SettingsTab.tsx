import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Pricing = { journal_amount: number; conference_amount: number; currency: string; note: string; };
type PaymentAccount = { bank_name: string; account_name: string; account_number: string; instructions: string; };

export function SettingsTab() {
  const [pricing, setPricing] = useState<Pricing | null>(null);
  const [account, setAccount] = useState<PaymentAccount | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    const { data } = await supabase.from("app_settings").select("key, value").in("key", ["submission_pricing", "payment_account"]);
    (data ?? []).forEach((d) => {
      if (d.key === "submission_pricing") setPricing(d.value as Pricing);
      if (d.key === "payment_account") setAccount(d.value as PaymentAccount);
    });
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!pricing || !account) return; setSaving(true);
    const { error: e1 } = await supabase.from("app_settings").upsert({ key: "submission_pricing", value: pricing as never, updated_at: new Date().toISOString() });
    const { error: e2 } = await supabase.from("app_settings").upsert({ key: "payment_account", value: account as never, updated_at: new Date().toISOString() });
    setSaving(false); if (e1 || e2) return toast.error(e1?.message ?? e2?.message ?? "Save failed");
    toast.success("Settings saved");
  }

  if (!pricing || !account) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className="rounded-2xl border border-border/60 bg-card p-6">
        <h2 className="font-display text-lg font-semibold text-primary">Submission pricing</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field label="Journal amount"><input type="number" value={pricing.journal_amount} onChange={(e) => setPricing({ ...pricing, journal_amount: Number(e.target.value) })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" /></Field>
          <Field label="Conference amount"><input type="number" value={pricing.conference_amount} onChange={(e) => setPricing({ ...pricing, conference_amount: Number(e.target.value) })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" /></Field>
          <Field label="Currency"><input value={pricing.currency} onChange={(e) => setPricing({ ...pricing, currency: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" /></Field>
          <Field label="Public note"><input value={pricing.note} onChange={(e) => setPricing({ ...pricing, note: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" /></Field>
        </div>
      </section>
      <section className="rounded-2xl border border-border/60 bg-card p-6">
        <h2 className="font-display text-lg font-semibold text-primary">Payment account</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field label="Bank name"><input value={account.bank_name} onChange={(e) => setAccount({ ...account, bank_name: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" /></Field>
          <Field label="Account name"><input value={account.account_name} onChange={(e) => setAccount({ ...account, account_name: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" /></Field>
          <Field label="Account number"><input value={account.account_number} onChange={(e) => setAccount({ ...account, account_number: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" /></Field>
          <Field label="Instructions"><textarea value={account.instructions} onChange={(e) => setAccount({ ...account, instructions: e.target.value })} rows={3} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" /></Field>
        </div>
      </section>
      <button onClick={save} disabled={saving} className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60">{saving ? "Saving…" : "Save settings"}</button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (<label className="block text-xs"><span className="mb-1 block uppercase tracking-wide text-muted-foreground">{label}</span>{children}</label>);
}
