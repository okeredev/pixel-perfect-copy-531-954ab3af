import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Users, ScrollText, Award, FileCheck, Globe2, Sparkles } from "lucide-react";
import heroImage from "@/assets/coou-campus.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "COOU Graduate Journal — Interdisciplinary Research & Development" },
      { name: "description", content: "A peer-reviewed home for postgraduate scholarship from COOU and beyond. Submit to the journal, register for the inaugural conference, explore the editorial board." },
      { property: "og:title", content: "COOU Graduate Journal of Interdisciplinary Research and Development" },
      { property: "og:description", content: "Sound, well-grounded research that speaks to real issues — from postgraduate scholars across Nigeria, Africa and beyond." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden pt-10 md:pt-20">
        <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 py-20 md:grid-cols-12 md:py-32">
          <div className="md:col-span-7 reveal-anim">
            <div className="inline-flex items-center gap-3 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-primary backdrop-blur">
              <Sparkles size={14} className="text-primary animate-pulse" />
              Official COOU Graduate Journal
            </div>
            <h1 className="mt-8 text-6xl font-black leading-[0.95] text-primary md:text-8xl tracking-tighter">
              Scholarship <br />
              that <span className="accent-italic text-primary-foreground bg-primary px-4 py-1 rounded-2xl rotate-2 inline-block">speaks</span> <br />
              to society.
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-foreground/70 md:text-xl font-medium">
              The COOU Graduate Journal of Interdisciplinary Research and
              Development is a peer-reviewed home for sound, well-grounded
              research from postgraduate scholars, academics, and researchers 
              across Nigeria, Africa and the wider world.
            </p>
            <div className="mt-12 flex flex-wrap gap-4">
              <Link
                to="/journal"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-black uppercase tracking-widest text-primary-foreground shadow-2xl shadow-primary/30 transition-all hover:scale-[1.05] active:scale-95"
              >
                Explore the Journal <ArrowRight size={18} />
              </Link>
              <Link
                to="/conference"
                className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-white/50 px-8 py-4 text-sm font-black uppercase tracking-widest text-foreground transition-all hover:border-primary hover:text-primary hover:bg-white"
              >
                The Inaugural Conference
              </Link>
            </div>

            <div className="mt-16 grid max-w-md grid-cols-3 gap-8 border-t border-border/40 pt-10">
              <Stat top="100%" label="Open peer review" />
              <Stat top="12+" label="Disciplines" />
              <Stat top="2×/yr" label="Issues planned" />
            </div>
          </div>

          <div className="md:col-span-5 reveal-anim" style={{ animationDelay: '0.2s' }}>
            <div className="relative overflow-hidden rounded-[2.5rem] border border-border/60 glass-card premium-shadow rotate-2">
              <img
                src={heroImage}
                alt="Library reading hall"
                width={1600}
                height={1024}
                className="h-full w-full object-cover transition-transform duration-1000 hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 via-transparent to-transparent" />
              <div className="absolute left-6 top-6 rounded-2xl glass-card px-6 py-4 text-xs shadow-2xl">
                <div className="text-[9px] font-black uppercase tracking-[0.25em] text-primary/60">Call for Papers</div>
                <div className="mt-1 font-display text-base font-black text-primary tracking-tight">Now open for Vol. 1</div>
              </div>
              <div className="absolute bottom-6 right-6 rounded-2xl glass-card px-6 py-4 text-xs shadow-2xl">
                <div className="text-[9px] font-black uppercase tracking-[0.25em] text-primary/60">Peer Review</div>
                <div className="mt-1 font-display text-base font-black text-primary tracking-tight">Double-blind system</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAND — dark green with gold numbers (cooualumni style) */}
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-4">
          <BigStat value="9+" label="Disciplines covered" />
          <BigStat value="2" label="Annual issues" />
          <BigStat value="100%" label="Double-blind reviewed" />
          <BigStat value="1" label="Inaugural conference" />
        </div>
      </section>

      {/* TWIN PILLARS */}
      <section className="mx-auto max-w-7xl px-6 py-32 reveal-anim" style={{ animationDelay: '0.4s' }}>
        <div className="mb-16 max-w-3xl">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/50">Two paths, one platform</p>
          <h2 className="mt-4 text-5xl md:text-6xl font-black text-primary tracking-tighter">
            Publish, present, <br />
            <span className="accent-italic text-foreground">contribute.</span>
          </h2>
        </div>
        <div className="grid gap-8 md:grid-cols-2">
          <PillarCard
            kicker="The Journal"
            title="Publish original interdisciplinary research"
            body="Original articles, reviews, conceptual papers, and policy briefs across the social sciences, humanities, sciences, business, education, law and beyond — through transparent double-blind review."
            href="/journal"
            cta="Read the aims & scope"
            icon={<BookOpen size={24} />}
          />
          <PillarCard
            kicker="The Conference"
            title="Inaugural postgraduate conference"
            body="A new annual gathering of postgraduate scholars and researchers. Submit an abstract, present your work, and contribute to the conference proceedings."
            href="/conference"
            cta="Conference overview"
            icon={<Users size={24} />}
          />
        </div>
      </section>

      {/* CONVICTIONS */}
      <section className="bg-primary/5 py-32 reveal-anim">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl mb-20">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/50">What we stand for</p>
            <h2 className="mt-4 text-5xl md:text-6xl font-black text-primary tracking-tighter">
              A journal built on <br />
              six <span className="accent-italic text-foreground">convictions.</span>
            </h2>
          </div>
          <div className="grid gap-12 md:grid-cols-3">
            <Conviction icon={<ScrollText />} title="High-quality scholarship" body="Clear, well-structured research that adds genuine value to its field." />
            <Conviction icon={<Globe2 />} title="Interdisciplinary thinking" body="Modern problems rarely sit inside a single discipline — neither does our work." />
            <Conviction icon={<Award />} title="Rigorous review" body="Double-blind peer review, transparent editorial standards, and respectful dialogue." />
            <Conviction icon={<FileCheck />} title="Practical impact" body="Studies that inform policy, strengthen institutions, and improve everyday life." />
            <Conviction icon={<Globe2 />} title="Local perspectives" body="Research grounded in local realities while engaging international conversations." />
            <Conviction icon={<Users />} title="Postgraduate-first" body="A home that takes early-career scholarship seriously and helps it grow." />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid items-center gap-10 rounded-3xl border border-border bg-card p-10 shadow-sm md:grid-cols-2 md:p-14">
          <div>
            <h2 className="text-4xl md:text-5xl">
              Ready to <span className="accent-italic">submit?</span>
            </h2>
            <p className="mt-5 text-muted-foreground">
              Read our author guidelines, prepare your manuscript, and join a
              growing community of interdisciplinary scholars.
            </p>
          </div>
          <div className="flex flex-col gap-3 md:items-end">
            <Link to="/author-guidelines" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              Author guidelines <ArrowRight size={16} />
            </Link>
            <Link to="/editorial-policy" className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground transition hover:border-primary hover:text-primary">
              Editorial policy
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function Stat({ top, label }: { top: string; label: string }) {
  return (
    <div>
      <div className="font-display text-4xl font-black text-primary tracking-tighter">{top}</div>
      <div className="mt-2 text-[9px] font-black uppercase tracking-[0.25em] text-muted-foreground/60">{label}</div>
    </div>
  );
}

function BigStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center md:text-left">
      <div className="font-display text-6xl font-black text-gold md:text-7xl tracking-tighter shadow-gold/20 drop-shadow-xl">{value}</div>
      <div className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-primary-foreground/50">{label}</div>
    </div>
  );
}

function PillarCard({
  kicker, title, body, href, cta, icon,
}: { kicker: string; title: string; body: string; href: "/journal" | "/conference"; cta: string; icon: React.ReactNode }) {
  return (
    <Link
      to={href}
      className="group flex flex-col gap-6 rounded-[2.5rem] glass-card p-10 transition-all duration-500 hover:scale-[1.02] hover:border-primary premium-shadow"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-xl shadow-primary/20 group-hover:rotate-6 transition-transform">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/50 mb-3">{kicker}</p>
        <h3 className="text-3xl font-black text-primary leading-tight tracking-tight">{title}</h3>
      </div>
      <p className="text-foreground/70 font-medium leading-relaxed">{body}</p>
      <span className="mt-auto inline-flex items-center gap-3 text-xs font-black uppercase tracking-widest text-primary group-hover:gap-5 transition-all">
        {cta}
        <ArrowRight size={18} />
      </span>
    </Link>
  );
}

function Conviction({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="group">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-primary shadow-sm group-hover:bg-primary group-hover:text-white transition-all duration-500">
        {icon}
      </div>
      <h3 className="mt-8 font-display text-xl font-black text-primary tracking-tight">{title}</h3>
      <p className="mt-3 text-sm font-medium text-muted-foreground/80 leading-relaxed">{body}</p>
    </div>
  );
}
