import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Section } from "./journal";

export const Route = createFileRoute("/author-guidelines")({
  head: () => ({
    meta: [
      { title: "Author Guidelines — COOU Graduate Journal" },
      { name: "description", content: "Manuscript formatting, structure, ethics, and submission requirements for the COOU Graduate Journal." },
      { property: "og:title", content: "Author Guidelines — COOU Graduate Journal" },
      { property: "og:description", content: "Everything you need to prepare and submit a manuscript to the COOU Graduate Journal." },
    ],
  }),
  component: GuidelinesPage,
});

function GuidelinesPage() {
  return (
    <>
      <PageHero
        kicker="Author Guidelines"
        title="Prepare your manuscript with confidence."
        body="Follow these guidelines to ensure clarity, consistency and adherence to academic standards."
      />

      <Section eyebrow="01 · General Requirements" title="Before you submit.">
        <div className="grid gap-8 md:grid-cols-2 reveal-anim">
          <ul className="space-y-6 text-foreground/70 font-medium">
            <li className="flex gap-4">
              <span className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
              Manuscripts must be written in English.
            </li>
            <li className="flex gap-4">
              <span className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
              Submissions must be the author's own original work.
            </li>
            <li className="flex gap-4">
              <span className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
              Not previously published; not under review elsewhere.
            </li>
          </ul>
          <ul className="space-y-6 text-foreground/70 font-medium">
            <li className="flex gap-4">
              <span className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
              All sources, data and references must be properly cited.
            </li>
            <li className="flex gap-4">
              <span className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
              Plagiarism results in immediate rejection.
            </li>
            <li className="flex gap-4">
              <span className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
              Manuscripts are screened for AI-generated content.
            </li>
          </ul>
        </div>
      </Section>

      <Section eyebrow="02 · Manuscript Structure" title="Standard sections." muted>
        <div className="grid gap-6 md:grid-cols-2 reveal-anim">
          {[
            ["Title & Abstract", "A concise title and a structured abstract of 200–300 words including purpose, method, findings and implications."],
            ["Introduction", "Establish the problem, objectives and significance of the study."],
            ["Literature Review", "A focused review of relevant scholarship that situates your contribution."],
            ["Methodology", "Detail the research design, participants, data collection and analysis."],
            ["Results / Findings", "Present findings clearly, using tables and figures where helpful."],
            ["Discussion", "Interpret your results, link to prior research, and acknowledge limitations."],
            ["Conclusion", "Summarise contributions and outline implications for theory, policy or practice."],
            ["References", "Use APA 7 style throughout for all citations and the reference list."],
          ].map(([t, d]) => (
            <div key={t} className="glass-card p-10 rounded-[2.5rem] transition-all duration-500 hover:border-primary">
              <h3 className="font-display text-2xl font-black text-primary tracking-tight">{t}</h3>
              <p className="mt-4 text-sm font-medium leading-relaxed text-muted-foreground/70">{d}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="03 · Formatting" title="Clarity and readability.">
        <div className="grid gap-6 md:grid-cols-3 reveal-anim">
          <Spec label="File format" value="Microsoft Word (.docx)" />
          <Spec label="Font" value="Times New Roman, 12 pt" />
          <Spec label="Line spacing" value="1.5 Spacing" />
          <Spec label="Margins" value="1 inch (2.54 cm)" />
          <Spec label="Length" value="6,000–8,000 words" />
          <Spec label="Tables" value="Embedded in text" />
        </div>
      </Section>

      <Section eyebrow="04 · Ethics" title="Research integrity." muted>
        <div className="glass-card p-12 rounded-[3rem] reveal-anim">
          <ul className="space-y-6 text-foreground/70 font-medium">
            <li className="flex gap-4">
              <span className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
              Studies involving humans must include approval from an ethics committee.
            </li>
            <li className="flex gap-4">
              <span className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
              Authors must disclose all conflicts of interest and sources of funding.
            </li>
            <li className="flex gap-4">
              <span className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
              All listed authors must have made a substantial contribution.
            </li>
          </ul>
        </div>
      </Section>
    </>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-card p-8 rounded-3xl transition-all duration-500 hover:scale-[1.05] hover:border-primary premium-shadow">
      <div className="text-[9px] font-black uppercase tracking-[0.3em] text-primary/40">{label}</div>
      <div className="mt-3 font-display text-lg font-black text-primary tracking-tight leading-tight">{value}</div>
    </div>
  );
}
