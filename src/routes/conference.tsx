import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Section } from "./journal";
import { CalendarDays, MapPin, Coins, FileText } from "lucide-react";

export const Route = createFileRoute("/conference")({
  head: () => ({
    meta: [
      { title: "Inaugural Postgraduate Conference — COOU" },
      { name: "description", content: "The inaugural postgraduate conference of the School of Postgraduate Studies, COOU. Theme, committee, abstracts and registration." },
      { property: "og:title", content: "Inaugural Postgraduate Conference — COOU" },
      { property: "og:description", content: "Graduate Research and National Development — the inaugural COOU postgraduate conference." },
    ],
  }),
  component: ConferencePage,
});

const committee = [
  ["Chairman", "Prof. Bruno Ibekilo"],
  ["Co-Chair (Igbariam)", "Dr. Agary Nwokoye"],
  ["Co-Chair (Awka)", "Dr. Amaechi Nwachukwu"],
  ["Co-Chair (Uli)", "Dr. Emmanuel Onyebueke"],
  ["Co-Chair (Registration and Publications)", "Dr. Chukwunonso Ekesiobi"],
  ["Co-Chair (Media and Publicity)", "Dr. Harrison Madubueze"],
  ["Secretary", "Dr. Eboh Obinna"],
  ["Online Coordinator", "Prof. John Paul Iloh"],
];

const facultyRepresentatives = [
  ["Faculty of Basic Medical Sciences", "Dr. Agnes A. Nwakanma"],
  ["Faculty of Environmental Sciences", "Dr. Innocent C. Ezemedo"],
  ["Faculty of Engineering", "Dr. Chidi Moughalu"],
  ["Faculty of Natural Sciences", "Dr. Bright Uba"],
  ["Faculty of Physical Sciences", "Prof. C. C. Onwuchukwu"],
  ["Faculty of Agriculture", "Prof. A. M. Ugboaja"],
  ["Faculty of Arts", "Dr. Ikechukwu Asika"],
  ["Faculty of Clinical Medicine", "Dr. B. C. Ochiogu"],
  ["Faculty of Education", "Dr. Stella Ezeaku"],
  ["Faculty of Health Sciences", "Dr. Chika Obi-Ezeani"],
  ["Faculty of Management Sciences", "Dr. Nkechi Ofor"],
  ["Faculty of Pharmaceutical Sciences", "Dr. Ruth Afunwa"],
  ["Faculty of Social Sciences", "Dr. Yves-Mary Obi"],
  ["Faculty of Law", "Dr. Chinwe Iloka"],
];

const members = [
  "Prof. Dominic Nwankwo", "Prof. Theophine Akunne", "Prof. Onyema Ilo", "Dr. Angela Ibekwe",
  "Dr. Ebele Offiah", "Dr. Nnalue Anthony Odikpo", "Dr. Chinelo Ohanyere", "Dr. Ofoegbu Cyril",
  "Dr. Chinonso Ofozoba", "Dr. Bernard Alajekwu", "Dr. Peter Ikegbunam", "Dr. Jacinta Nwangwu",
  "Dr. Ikenna Ibe", "Dr. Chidimma Odira", "Dr. Goodfaith Dike", "Dr. Gideon Nwafor",
  "Dr. Chinwe Obananya", "Dr. Chioma Okeke", "Dr. Godfrey Afamnede", "Dr. Blessing Chugo Idigo",
  "Dr. Cosmas Nwankwo", "Dr. Nonye Ezeaka", "Dr. Ndubuisi Emegha", "Dr. Chijioke Okoye",
  "Dr. Josephine Ngozi Morah", "Dr. Nwokolo Echezona", "Dr. Obiageli Akamobi", "Dr. Onyekachukwu Ebenebe",
  "Dr. Ngozika Ekwe", "Nnaemena Ugochukwu George", "Chibuzor Wilson Iteke", "Azubuike JohnPaul",
  "Collins Okelue", "Ifeanyi Emesiani", "Mbanefo Obioma D.", "Okwuenu Ezebuilo", "Nnatuanya Felix Obinna",
];

const termsOfReference = [
  "Plan, organise, and coordinate the annual Postgraduate Research Conference to maintain high academic standards.",
  "Develop and review conference themes, sub-themes, and participation guidelines.",
  "Oversee the call for papers, abstract review, and selection process.",
  "Handle all logistical and administrative arrangements including venue, scheduling, and publicity.",
  "Secure resources, partnerships, sponsorships, and technical support.",
  "Produce a comprehensive post-conference report and support publication of proceedings.",
  "Co-opt individuals into subcommittees for specialised expertise.",
];

function ConferencePage() {
  return (
    <>
      <PageHero
        kicker="Inaugural Conference"
        title="Graduate Research and National Development."
        body="The inaugural postgraduate conference of the School of Postgraduate Studies, COOU — a new annual gathering for postgraduate scholars and researchers across Nigeria and beyond."
      />

      <Section eyebrow="At a Glance" title="The essentials.">
        <div className="grid gap-6 md:grid-cols-4 reveal-anim">
          <Tile icon={<FileText size={20} />} label="Theme" value="Graduate Research and National Development" />
          <Tile icon={<CalendarDays size={20} />} label="Dates" value="To be confirmed" />
          <Tile icon={<MapPin size={20} />} label="Venue" value="COOU — to be confirmed" />
          <Tile icon={<Coins size={20} />} label="Indicative fee" value="₦40,000 – ₦50,000" />
        </div>
        <div className="mt-10 max-w-4xl rounded-3xl glass-card p-6 border-primary/20 bg-primary/5 reveal-anim" style={{ animationDelay: '0.2s' }}>
          <p className="text-sm font-medium text-foreground/70 leading-relaxed flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-widest shrink-0">NB</span>
            Final theme, dates, venue and registration fee will be confirmed by the Conference Committee. Indicative values shown for planning only.
          </p>
        </div>
      </Section>

      <Section eyebrow="How it works" title="From abstract to proceedings." muted>
        <div className="grid gap-8 md:grid-cols-4 reveal-anim">
          {[
            ["Submit your abstract", "Register and submit a structured abstract through the conference platform."],
            ["Receive notification", "The conference committee reviews submissions and notifies authors of acceptance."],
            ["Present your work", "Accepted authors present at the conference in their assigned track."],
            ["Publish in proceedings", "Optionally submit a full paper for peer review and inclusion in the conference proceedings."],
          ].map(([t, d], i) => (
            <div key={t} className="group glass-card p-8 rounded-[2rem] transition-all duration-500 hover:scale-[1.05] hover:border-primary">
              <div className="font-display text-4xl font-black text-primary/10 group-hover:text-primary transition-colors tracking-tighter mb-4">0{i + 1}</div>
              <h3 className="font-display text-xl font-black text-primary tracking-tight">{t}</h3>
              <p className="mt-3 text-sm font-medium text-muted-foreground/70 leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Conference Committee" title="The leadership team.">
        <div className="grid gap-6 md:grid-cols-2 reveal-anim">
          {committee.map(([role, name]) => (
            <div key={role} className="flex flex-col gap-1 border-b border-border/40 pb-6 transition-all hover:border-primary group">
              <div className="text-[9px] font-black uppercase tracking-[0.3em] text-primary/40 group-hover:text-primary transition-colors">{role}</div>
              <div className="font-display text-2xl font-black text-primary tracking-tight">{name}</div>
            </div>
          ))}
        </div>

        <div className="mt-32 reveal-anim">
          <div className="max-w-3xl mb-12">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/50">Faculty Liaisons</p>
            <h3 className="mt-4 text-4xl font-black text-primary tracking-tighter">Faculty Representatives</h3>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {facultyRepresentatives.map(([faculty, name]) => (
              <div key={faculty} className="flex items-center justify-between border-b border-border/40 pb-4 group">
                <span className="text-sm font-bold text-foreground/50 group-hover:text-primary transition-colors">{faculty}</span>
                <span className="text-sm font-black text-primary">{name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-32 reveal-anim">
          <div className="max-w-3xl mb-12">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/50">Supporting Staff</p>
            <h3 className="mt-4 text-4xl font-black text-primary tracking-tighter">Committee Members</h3>
          </div>
          <ul className="grid gap-x-12 gap-y-4 text-sm font-bold text-foreground/60 md:grid-cols-3">
            {members.map((m) => (
              <li key={m} className="flex items-center gap-3 group">
                <span className="h-1.5 w-1.5 rounded-full bg-primary/30 group-hover:bg-primary transition-colors" />
                <span className="group-hover:text-primary transition-colors">{m}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section eyebrow="Terms of Reference" title="Our mandate." muted>
        <div className="grid gap-8 md:grid-cols-2 reveal-anim">
          {termsOfReference.map((text, i) => (
            <div key={i} className="group glass-card p-10 rounded-[2.5rem] transition-all duration-500 hover:border-primary bg-white/40">
              <div className="flex gap-6">
                <span className="font-display text-4xl font-black text-primary/10 group-hover:text-primary transition-colors tracking-tighter shrink-0">{String(i + 1).padStart(2, "0")}</span>
                <p className="text-foreground/70 font-medium leading-relaxed mt-2">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}

function Tile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="glass-card p-8 rounded-[2rem] transition-all duration-500 hover:scale-[1.05] hover:border-primary premium-shadow">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/5 text-primary">
        {icon}
      </div>
      <div className="mt-8 text-[9px] font-black uppercase tracking-[0.3em] text-primary/40">{label}</div>
      <div className="mt-2 font-display text-xl font-black text-primary leading-tight tracking-tight">{value}</div>
    </div>
  );
}
