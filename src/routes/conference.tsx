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
  ["Co-Chair (Registration & Publications)", "Dr. Chukwunonso Ekesiobi"],
  ["Co-Chair (Media & Publicity)", "Dr. Harrison Madubueze"],
  ["Secretary", "Dr. Eboh Obinna"],
  ["Online Coordinator", "Prof. John Paul Iloh"],
];

const members = [
  "Prof. Dominic Nwankwo", "Prof. Theophine Akunne", "Prof. Onyema Ilo", "Dr. Angela Ibekwe",
  "Dr. Ebele Offiah", "Dr. Nnalue Anthony Odikpo", "Dr. Chinelo Ohanyere", "Dr. Ofoegbu Cyril",
  "Dr. Chinonso Ofozoba", "Dr. Bernard Alajekwu", "Dr. Peter Ikegbunam", "Dr. Jacinta Nwangwu",
  "Dr. Ikenna Ibe", "Dr. Chidimma Odira", "Dr. Goodfaith Dike", "Dr. Gideon Nwafor",
  "Dr. Chinwe Obananya", "Dr. Chioma Okeke", "Dr. Godfrey Afamnede", "Dr. Blessing Chugo Idigo",
  "Dr. Cosmas Nwankwo", "Dr. Nonye Ezeaka", "Dr. Ndubuisi Emegha", "Dr. Chijioke Okoye",
  "Dr. Josephine Ngozi Morah", "Dr. Nwokolo Echezona", "Dr. Obiageli Akamobi",
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
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/50">Supporting Staff</p>
            <h3 className="mt-4 text-4xl font-black text-primary tracking-tighter">Conference Members</h3>
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
