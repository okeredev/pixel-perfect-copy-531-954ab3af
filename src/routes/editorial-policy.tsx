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
  ["Commitment to Quality and Integrity", "The journal is committed to publishing work that is clear, original, and well-researched. We value honesty, accuracy, and careful scholarship. All manuscripts submitted to the journal must reflect these standards."],
  ["Fair and Objective Review Process", "All manuscripts undergo a fair, unbiased, and confidential review process. Judged solely on quality, contribution to knowledge, and clarity of presentation."],
  ["Editorial Independence", "The editorial team exercises independent judgement. Decisions are not influenced by personal relationships, political interests, or external pressures."],
  ["Plagiarism and Ethical Conduct", "The journal does not tolerate plagiarism or any form of academic dishonesty. All submissions must be the author’s original work. Where the work of others is used, it must be properly acknowledged."],
  ["Respectful and Professional Communication", "The journal maintains courteous and professional communication with authors, reviewers, and all partners involved in the editorial process."],
  ["Confidentiality", "All manuscripts submitted are treated as confidential documents. Reviewers and editors must not share or discuss any manuscript with others."],
  ["Conflict of Interest", "Editors and reviewers must declare any conflict of interest. If an editor feels unable to handle a manuscript fairly, they must step aside."],
  ["Editorial Decision-Making", "Decisions are based on the comments of reviewers, the judgment of the editorial team, and the overall relevance of the topic to the journal."],
  ["Corrections, Retractions, and Withdrawals", "If a published paper is later found to contain errors or misleading information, the journal will take appropriate action, including corrections or retractions."],
  ["Freedom of Thought and Scholarly Diversity", "The journal welcomes a range of academic perspectives. We encourage research that challenges existing ideas or introduces new viewpoints."],
  ["Encouraging Postgraduate Scholarship", "We are committed to supporting the growth of young scholars, treating postgraduate submissions with the same seriousness as all others."],
  ["Timeliness and Efficiency", "The editorial team is committed to handling manuscripts promptly. While peer review takes time, we make every effort to avoid unnecessary delays."],
  ["Inclusivity and Accessibility", "The journal aims to provide an inclusive platform for researchers from different disciplines, backgrounds, and experiences."],
  ["Continuous Improvement", "The editorial policy is reviewed regularly to reflect changes in academic standards, technological advancement, and the needs of researchers."],
];

const peerReviewPoints = [
  ["Double-blind review", "Both the authors and the reviewers remain anonymous to promote impartiality and fairness."],
  ["Initial assessment", "Submissions are initially assessed by the editorial team for scope, basic standards, language, and ethical conduct."],
  ["Independent expert review", "Suitable manuscripts are sent to at least two independent reviewers with expertise in the subject area."],
  ["Constructive feedback", "Reviewers provide feedback on clarity, methodology, originality, and relevance to help determine the manuscript's fate."],
  ["Conflict disclosure", "Reviewers are required to disclose potential conflicts of interest and maintain strict confidentiality."],
  ["Final board decision", "The final responsibility for acceptance or rejection rests with the editorial board based on quality and originality."],
];

function PolicyPage() {
  return (
    <>
      <PageHero
        kicker="Editorial Policy"
        title="The standards behind every paper we publish."
        body="A clear set of commitments that guide editors, reviewers and authors alike."
      />
      <Section eyebrow="Editorial Policy" title="Fourteen principles that shape our integrity.">
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

      <Section eyebrow="Peer Review Policy" title="A rigorous, double-blind process." muted>
        <div className="grid gap-8 md:grid-cols-2 reveal-anim">
          {peerReviewPoints.map(([t, d], i) => (
            <div key={t} className="group glass-card p-10 rounded-[2.5rem] transition-all duration-500 hover:border-primary bg-white/40">
              <div className="font-display text-[10px] font-black uppercase tracking-[0.3em] text-primary/40 group-hover:text-primary transition-colors mb-4">Step 0{i + 1}</div>
              <h3 className="font-display text-2xl font-black text-primary tracking-tight mb-4">{t}</h3>
              <p className="text-foreground/70 font-medium leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
