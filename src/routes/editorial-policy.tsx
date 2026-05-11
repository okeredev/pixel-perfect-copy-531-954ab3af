import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Section } from "./journal";

export const Route = createFileRoute("/editorial-policy")({
  head: () => ({
    meta: [
      { title: "Editorial Policy — COOU Graduate Journal" },
      { name: "description", content: "Standards on integrity, fair review, ethics, accessibility and timeliness that guide every manuscript we handle." },
      { property: "og:title", content: "Editorial Policy — COOU Graduate Journal" },
      { property: "og:description", content: "How we handle every manuscript: integrity, double-blind peer review, ethics, accessibility." },
    ],
  }),
  component: PolicyPage,
});

const policies = [
  ["Commitment to Quality & Integrity", "We publish work that is clear, original, and well-researched. Authors must present their work truthfully, avoid plagiarism, and follow proper academic practice."],
  ["Fair & Objective Review", "All manuscripts undergo a fair, unbiased and confidential double-blind peer review — judged solely on quality, contribution, and clarity."],
  ["Ethical Conduct", "Studies involving humans or animals require approval from an appropriate ethics committee. Authors must disclose conflicts of interest and funding sources."],
  ["Plagiarism & AI-use Screening", "Every submission is screened for plagiarism and AI-generated content. Manuscripts may be rejected on these grounds before peer review."],
  ["Editorial Independence", "Editorial decisions are based on academic merit alone, free from commercial, political or institutional influence."],
  ["Confidentiality", "Manuscripts and all related correspondence are treated confidentially throughout the editorial process."],
  ["Authorship & Contribution", "All listed authors must have made a substantial contribution. Changes to authorship after submission require written agreement from all parties."],
  ["Corrections & Retractions", "We publish corrections, expressions of concern, and retractions where warranted, in line with international best practice."],
  ["Open & Responsible Dialogue", "We welcome scholarly debate, including responses and rejoinders, conducted with rigour and respect."],
  ["Postgraduate Scholarship", "Postgraduate submissions are treated with the same seriousness as all others, while we encourage clarity, sound methodology and responsible scholarship."],
  ["Timeliness & Efficiency", "Peer review takes time, but we make every effort to avoid unnecessary delays. Authors are kept informed throughout."],
  ["Inclusivity & Accessibility", "We welcome scholars from all institutions, regions and backgrounds, and aim to keep submission and access barriers low."],
];

function PolicyPage() {
  return (
    <>
      <PageHero
        kicker="Editorial Policy"
        title="The standards behind every paper we publish."
        body="A clear set of commitments that guide editors, reviewers and authors alike."
      />
      <Section eyebrow="Our Standards" title="Twelve principles that shape our process.">
        <div className="grid gap-8 md:grid-cols-2 reveal-anim">
          {policies.map(([t, d], i) => (
            <div key={t} className="group glass-card p-10 rounded-[2.5rem] transition-all duration-500 hover:border-primary">
              <div className="flex items-center gap-4 mb-6">
                <span className="font-display text-4xl font-black text-primary/10 group-hover:text-primary transition-colors tracking-tighter">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="font-display text-2xl font-black text-primary tracking-tight leading-none">{t}</h3>
              </div>
              <p className="text-foreground/70 font-medium leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
