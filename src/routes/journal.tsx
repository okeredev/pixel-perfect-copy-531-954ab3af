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
  ["To promote high-quality postgraduate research", "The journal seeks to support research that is clear, well-structured, and relevant. We want to encourage postgraduate students and scholars to produce work that adds value to knowledge and responds to important questions in their fields."],
  ["To encourage interdisciplinary thinking", "Modern problems are rarely limited to a single discipline. The journal therefore aims to support research that connects ideas and methods from different fields, allowing for deeper understanding and more practical solutions."],
  ["To strengthen the research culture within COOU and beyond", "The journal aims to nurture a strong academic environment where postgraduate students and researchers feel encouraged to investigate issues, think critically, and engage with scholarly debates."],
  ["To support research that can lead to development", "The journal places emphasis on studies that offer practical insights, policy direction, or innovative approaches that can improve lives, strengthen institutions, and support community development."],
  ["To showcase local and African perspectives", "The journal aims to highlight research that draws from local realities, experiences, and knowledge systems, while still connecting with international academic conversations."],
  ["To encourage open and responsible academic dialogue", "We aim to create room for honest, constructive, and thoughtful academic discussion on matters that affect society, institutions, and everyday life."],
];

const scope = [
  ["Social Sciences", "Governance, public administration, sociology, anthropology, political studies, gender issues, rural development, and social change."],
  ["Education and Learning Studies", "Studies on teaching methods, school management, curriculum development, adult learning, and educational innovations."],
  ["Management and Business", "Entrepreneurship, finance, human resource management, organisational behaviour, leadership, and development management."],
  ["Natural and Applied Sciences", "Environmental studies, agriculture, biological sciences, climate change, technology adoption, and scientific innovations that support development."],
  ["Health and Behavioural Sciences", "Public health, mental health, behavioural patterns, health education, and community health issues."],
  ["Arts and Humanities", "Studies in culture, language, literature, communication, philosophy, religion, and creative industries."],
  ["Law, Policy, and Governance Studies", "Legal systems, policy formulation, justice administration, human rights, and institutional governance."],
  ["Environmental and Development Studies", "Sustainability, waste management, energy issues, urbanisation, community development, and environmental policy."],
  ["Interdisciplinary and Cross-cutting Research", "Any study that blends more than one discipline, introduces new ideas, or provides innovative solutions to social, economic, cultural, or environmental challenges."],
];

const sections = [
  ["Original Research Articles", "Full research papers that present new findings, fresh ideas, or original analysis. Usually follow a format: introduction, methods, results, and discussion."],
  ["Review Articles", "Papers that carefully examine existing literature. They bring together what other researchers have said, point out trends, highlight gaps, and suggest new directions."],
  ["Conceptual and Theoretical Papers", "Explore theories, models, and frameworks to help understand important concepts and offer new ways of thinking about issues."],
  ["Policy Papers and Briefs", "Analyse policies or recommend improvements to government programmes, laws, or institutional practices. Short, clear, and focused on practical solutions."],
  ["Case Studies", "Present real-life situations from communities or organisations to show how theories apply in practice."],
  ["Methodological Papers", "Focus on research methods, explaining new methods, comparing popular ones, or discussing best practices in design and analysis."],
  ["Field Reports", "Shorter pieces describing observations or lessons learnt from fieldwork or community engagements."],
  ["Interdisciplinary Insights", "Short papers that combine ideas from two or more fields to encourage creative thinking."],
  ["Book Reviews", "Reviews of newly published academic books, helping readers understand their main ideas and relevance."],
  ["Graduate Research Spotlight", "Celebrating excellent postgraduate work, including outstanding thesis summaries or student-led projects."],
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
