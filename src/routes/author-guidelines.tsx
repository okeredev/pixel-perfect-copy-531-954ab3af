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
            ["Title Page", "Includes full title, author names, institutional affiliations, ORCiD Number, and corresponding author contact information."],
            ["Abstract", "Summarise the study in no more than 250 words: purpose, methodology, main findings, and conclusion."],
            ["Keywords", "Include 3–6 keywords that represent the main topics of the study."],
            ["Introduction", "Introduce the research problem and explain its significance; state the study’s objectives clearly."],
            ["Literature", "Clearly review relevant literature related to the study."],
            ["Methodology", "Detailed information on research design, participants, data collection, and analysis methods."],
            ["Results / Findings", "Present the findings clearly, using tables and figures where necessary without repetition."],
            ["Discussion", "Interpret results, explaining significance and relationship to previous research; highlight limitations."],
            ["Conclusion", "Summarise key findings, implications, and suggest recommendations or future research directions."],
            ["References", "Must follow a consistent academic style, preferably APA 7th edition or Harvard style."],
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
          <Spec label="Research Articles" value="Up to 9,000 words" />
          <Spec label="Other Submissions" value="Up to 4,500 words" />
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
