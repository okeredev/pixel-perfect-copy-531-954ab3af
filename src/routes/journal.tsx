import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/journal")({
  head: () => ({
    meta: [
      { title: "About the Journal — COOU Graduate Journal" },
      { name: "description", content: "Aims, scope, vision and mission of the COOU Graduate Journal of Interdisciplinary Research and Development." },
      { property: "og:title", content: "About the Journal — COOU Graduate Journal" },
      { property: "og:description", content: "A peer-reviewed interdisciplinary journal of COOU's School of Postgraduate Studies." },
    ],
  }),
  component: JournalPage,
});

const aims = [
  ["Promote high-quality postgraduate research", "Support clear, well-structured, relevant work that adds value to knowledge and responds to important questions."],
  ["Encourage interdisciplinary thinking", "Modern problems are rarely confined to one discipline. We support work that connects ideas and methods across fields."],
  ["Strengthen the research culture", "Nurture an academic environment where postgraduate scholars are encouraged to investigate, think critically, and engage."],
  ["Support research that leads to development", "Emphasis on studies offering practical insights, policy direction, and innovations that improve lives."],
  ["Showcase local & African perspectives", "Highlight research grounded in local realities while engaging international academic conversations."],
  ["Encourage open and responsible dialogue", "Create room for honest, constructive, thoughtful academic discussion on matters that affect society."],
];

const scope = [
  ["Social Sciences", "Governance, public administration, sociology, anthropology, political studies, gender, rural development, social change."],
  ["Education & Learning Studies", "Teaching methods, school management, curriculum, adult learning, educational innovations."],
  ["Management & Business", "Entrepreneurship, finance, HR, organisational behaviour, leadership, development management."],
  ["Natural & Applied Sciences", "Environmental studies, agriculture, biological sciences, climate change, technology adoption."],
  ["Health & Behavioural Sciences", "Public health, mental health, behavioural patterns, health education, community health."],
  ["Arts & Humanities", "Culture, language, literature, communication, philosophy, religion, creative industries."],
  ["Law, Policy & Governance", "Legal systems, policy formulation, justice administration, human rights, institutional governance."],
  ["Environmental & Development", "Sustainability, waste management, energy, urbanisation, community development, environmental policy."],
  ["Interdisciplinary & Cross-cutting", "Studies that blend disciplines or introduce innovative solutions to complex challenges."],
];

const sections = [
  ["Original Research Articles", "Full research papers presenting new findings, fresh ideas, or original analysis — typically introduction, methods, results, discussion."],
  ["Review Articles", "Careful examinations of existing literature: trends, gaps, and new directions."],
  ["Conceptual & Theoretical Papers", "Explorations of theories, models and frameworks; new ways of thinking about issues in society."],
  ["Policy Papers & Briefs", "Concise, evidence-based commentary aimed at decision-makers."],
];

export default function JournalPage() {
  return (
    <>
      <PageHero
        kicker="The Journal"
        title="A home for serious, useful, interdisciplinary scholarship."
        body="Established to give postgraduate students, academics and researchers a respected platform to share work that contributes to development in Nigeria, Africa, and the wider world."
      />

      <Section id="aims" eyebrow="Our Aims" title="Six commitments that shape the journal.">
        <div className="grid gap-8 md:grid-cols-2 reveal-anim">
          {aims.map(([t, d], i) => (
            <div key={t} className="group relative border-l-4 border-primary/20 pl-8 transition-all hover:border-primary">
              <div className="absolute -left-[5px] top-0 h-4 w-4 rounded-full bg-primary shadow-lg shadow-primary/20 scale-0 group-hover:scale-100 transition-transform" />
              <h3 className="font-display text-2xl font-black text-primary tracking-tight">{t}</h3>
              <p className="mt-3 text-foreground/70 font-medium leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Scope" title="The full breadth of postgraduate inquiry." muted>
        <p className="mb-12 max-w-3xl text-lg font-medium text-muted-foreground/80 reveal-anim">
          We accept submissions from all fields, provided the work is original, clearly
          presented, and contributes to knowledge. We particularly welcome research that
          crosses traditional boundaries.
        </p>
        <div className="grid gap-6 md:grid-cols-3 reveal-anim" style={{ animationDelay: '0.2s' }}>
          {scope.map(([t, d]) => (
            <div key={t} className="glass-card p-8 rounded-3xl transition-all duration-500 hover:scale-[1.03] hover:border-primary premium-shadow">
              <h3 className="font-display text-lg font-black text-primary tracking-tight">{t}</h3>
              <p className="mt-4 text-[13px] font-medium leading-relaxed text-muted-foreground/70">{d}</p>
            </div>
          ))}
        </div>
      </Section>

      <div className="grid md:grid-cols-2 reveal-anim">
        <Section eyebrow="Vision" title="A trusted home for honest scholarship.">
          <p className="max-w-3xl text-xl font-medium leading-relaxed text-foreground/70 italic">
            "To build a respected and trusted academic journal that brings together strong,
            meaningful research from different fields — a leading platform where postgraduate
            students, academics and researchers share new ideas that support development."
          </p>
        </Section>

        <Section eyebrow="Mission" title="Open, supportive, rigorous." muted>
          <p className="max-w-3xl text-lg font-medium leading-relaxed text-foreground/70">
            To provide a simple, open and supportive space for the publication of
            high-quality postgraduate research; to encourage interdisciplinary work that
            connects ideas across fields and helps solve real problems.
          </p>
        </Section>
      </div>

      <Section eyebrow="Sections" title="Different formats. One standard of quality.">
        <div className="grid gap-8 md:grid-cols-2 reveal-anim">
          {sections.map(([t, d], i) => (
            <div key={t} className="group glass-card p-10 rounded-[2.5rem] transition-all duration-500 hover:border-primary">
              <div className="font-display text-xs font-black text-primary/30 group-hover:text-primary transition-colors tracking-widest uppercase mb-4">Paper Type 0{i + 1}</div>
              <h3 className="font-display text-2xl font-black text-primary tracking-tight">{t}</h3>
              <p className="mt-4 text-foreground/70 font-medium leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
      </Section>

      <div className="mx-auto max-w-7xl px-6 pb-32 reveal-anim">
        <div className="flex flex-wrap items-center justify-between gap-8 rounded-[3rem] glass-card p-12 premium-shadow bg-primary text-primary-foreground">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50 mb-2">Next Steps</p>
            <h2 className="font-display text-3xl font-black tracking-tight">Ready to prepare your manuscript?</h2>
          </div>
          <Link to="/author-guidelines" className="inline-flex items-center gap-3 rounded-full bg-white px-10 py-5 text-sm font-black uppercase tracking-widest text-primary hover:bg-white/90 shadow-2xl transition-all hover:scale-[1.05] active:scale-95">
            Author guidelines <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </>
  );
}

export function PageHero({ kicker, title, body }: { kicker: string; title: string; body?: string }) {
  return (
    <section className="relative overflow-hidden bg-primary py-24 md:py-32 reveal-anim">
      <div className="mx-auto max-w-7xl px-6 relative z-10">
        <div className="inline-block rounded-full bg-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.4em] text-white/70 backdrop-blur mb-8">
          {kicker}
        </div>
        <h1 className="max-w-4xl font-display text-5xl font-black leading-[1.05] text-white md:text-7xl tracking-tighter">
          {title}
        </h1>
        {body && <p className="mt-8 max-w-2xl text-xl font-medium leading-relaxed text-white/70">{body}</p>}
      </div>
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-black/20 to-transparent pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-white/5 blur-3xl pointer-events-none" />
    </section>
  );
}

export function Section({
  eyebrow, title, children, muted, id,
}: { eyebrow: string; title: string; children: React.ReactNode; muted?: boolean; id?: string }) {
  return (
    <section id={id} className={muted ? "bg-primary/5 py-32" : "py-32"}>
      <div className="mx-auto max-w-7xl px-6">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/50 mb-4">{eyebrow}</p>
        <h2 className="max-w-3xl text-4xl md:text-6xl font-black text-primary tracking-tighter leading-none mb-16">{title}</h2>
        <div className="relative">
          {children}
        </div>
      </div>
    </section>
  );
}
