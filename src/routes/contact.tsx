import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Section } from "./journal";
import { Mail, MapPin, Building2 } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — COOU Graduate Journal" },
      { name: "description", content: "Get in touch with the editorial office of the COOU Graduate Journal of Interdisciplinary Research and Development." },
      { property: "og:title", content: "Contact — COOU Graduate Journal" },
      { property: "og:description", content: "Reach the editorial office of the COOU Graduate Journal." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <>
      <PageHero
        kicker="Contact"
        title="Talk to the editorial office."
        body="For submission queries, editorial correspondence, or conference enquiries, the team is here to help."
      />

      <Section eyebrow="Get in touch" title="How to reach us.">
        <div className="grid gap-6 md:grid-cols-3 reveal-anim">
          <Card icon={<Mail size={22} />} title="Email" body="editor@coougraduatejournal.org" />
          <Card icon={<Building2 size={22} />} title="Editorial office" body="School of Postgraduate Studies, Office of the Dean" />
          <Card icon={<MapPin size={22} />} title="Address" body="Chukwuemeka Odumegwu Ojukwu University, Anambra State, Nigeria" />
        </div>

        <form className="mt-20 grid gap-8 rounded-[3rem] glass-card p-12 md:grid-cols-2 reveal-anim premium-shadow" style={{ animationDelay: '0.2s' }}>
          <Field label="Your name" type="text" name="name" />
          <Field label="Email address" type="email" name="email" />
          <div className="md:col-span-2">
            <Field label="Subject" type="text" name="subject" />
          </div>
          <div className="md:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 mb-2 block">Message</label>
            <textarea
              rows={5}
              className="w-full rounded-2xl border-none bg-primary/5 px-5 py-4 text-sm font-bold text-foreground outline-none transition-all focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/40"
              placeholder="How can we help you?"
            />
          </div>
          <div className="md:col-span-2 flex flex-col items-start gap-4">
            <button
              type="button"
              className="inline-flex items-center justify-center gap-3 rounded-full bg-primary px-10 py-5 text-sm font-black uppercase tracking-widest text-primary-foreground hover:bg-primary/90 hover:scale-[1.05] active:scale-95 transition-all shadow-2xl shadow-primary/20"
            >
              Send message
            </button>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 italic">
              Note: The contact form will be fully activated in the next phase.
            </p>
          </div>
        </form>
      </Section>
    </>
  );
}

function Card({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="group glass-card p-10 rounded-[2.5rem] transition-all duration-500 hover:scale-[1.05] hover:border-primary premium-shadow">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
        {icon}
      </div>
      <h3 className="mt-8 font-display text-2xl font-black text-primary tracking-tight">{title}</h3>
      <p className="mt-4 text-sm font-medium text-muted-foreground/70 leading-relaxed">{body}</p>
    </div>
  );
}

function Field({ label, type, name }: { label: string; type: string; name: string }) {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        className="w-full rounded-2xl border-none bg-primary/5 px-5 py-4 text-sm font-bold text-foreground outline-none transition-all focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/40"
      />
    </div>
  );
}
