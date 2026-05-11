import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Section } from "./journal";

export const Route = createFileRoute("/editorial-board")({
  head: () => ({
    meta: [
      { title: "Editorial Board — COOU Graduate Journal" },
      { name: "description", content: "The editors and associate editors guiding the COOU Graduate Journal across every discipline." },
      { property: "og:title", content: "Editorial Board — COOU Graduate Journal" },
      { property: "og:description", content: "Meet the scholars guiding peer review and editorial direction at the COOU Graduate Journal." },
    ],
  }),
  component: BoardPage,
});

const leadership: { role: string; name: string }[] = [
  { role: "Editorial Board Chair", name: "Kate Azuka Omenugha PhD" },
  { role: "Editor-in-Chief", name: "Osita Chiaghanam PhD" },
  { role: "Managing Editor", name: "Chukwunonso Ekesiobi PhD" },
  { role: "Online Editor", name: "JohnPaul Iloh PhD" },
  { role: "Publicity Editor", name: "Madumelu H. C. Madubueze PhD" },
];

const groups: { discipline: string; members: string[] }[] = [
  { discipline: "Agricultural Sciences", members: ["Ebele Offiah PhD", "Margret Okeke PhD", "Ikechukwu Nweke"] },
  { discipline: "Arts and Humanities", members: ["Cyril Ofoegbu PhD", "Obiageli Okpala PhD", "Chisom M. Okafor PhD", "Anthony Nnalue PhD"] },
  { discipline: "College of Medicine", members: ["Chukwuemeka Azikiwe PhD", "Peter Ughachukwu PhD", "Ifeanyichukwu Ezebialu PhD"] },
  { discipline: "Education", members: ["Zita Obi PhD", "Patrick Okafor PhD", "Josephine Morah PhD", "Chinonso Ofozoba PhD", "Ngozika Ekwe PhD"] },
  { discipline: "Engineering and Technology", members: ["Chukwuemeka Ezechukwu PhD", "Ifeanyi Nzeife PhD", "Chidi Muoghalu PhD", "Joseph Ezeugo PhD"] },
  { discipline: "Health Sciences", members: ["Ada Ibekwe PhD", "Blessing Onyeje PhD", "Chika Obi-Ezeani PhD", "Ike Amaka PhD"] },
  { discipline: "Law and Policy Studies", members: ["Ikenna Ibe PhD", "Chinwe Iloka PhD", "Emilia Mgbemena PhD", "Ifeoma Nwakoby", "Rev. Sr. Anne Obiora PhD"] },
  { discipline: "Pharmaceutical Sciences", members: ["Afunwa Emmanuel PhD", "Oranu Emmanuel PhD", "Amobi Emmanuel PhD", "Ezeonyi Ebere PhD", "Ernest Erhirhie PhD", "Onwuzuligbo Chukwunonso PhD"] },
  { discipline: "Management and Business", members: ["Chioma F. Okeke PhD", "Joyce Ifeyinwa Odieli PhD", "Bernard Alajekwu PhD", "Jacinta Nwangwu PhD", "Chineze Justina Ifechukwu-Jacobs PhD", "Ifeoma Orjinta PhD"] },
  { discipline: "Natural Sciences", members: ["Andrew Nwaka PhD", "Jonathan Ifemeje PhD", "Chiamaka Ejimofor PhD", "Bright Uba PhD", "Nnamdi Nwakoby PhD", "Chukwujekwu Ukpaka PhD", "Mary-Jude Igbodika PhD"] },
  { discipline: "Social Sciences", members: ["Bruno Ibekilo PhD", "Njideka Ebisi PhD", "Agary Nwokoye PhD", "Rev. Sr. YvesMary Obi PhD", "Dominic Nwankwo PhD"] },
  { discipline: "Physical Sciences", members: ["Chika Onwuchukwu PhD", "Okechukwu Ikegwuonu PhD", "Ike Mgbeafolike PhD", "Johnbosco Egbueri PhD", "Christian Okoli", "Emmanuel Onyebueke PhD", "Charles Aronu PhD"] },
  { discipline: "Environmental Sciences", members: ["Oluchi Ifebi PhD", "Okamaka Okonkwo PhD", "Kelechi Ezeji PhD", "Ndidi Okolo PhD", "Chinwe Odimegwu PhD"] },
  { discipline: "Basic Medical Sciences", members: ["Izuchukwu Ifedi PhD", "Obioma Nweke PhD", "Chinedu Olisah PhD", "Agnes Nwakamma PhD", "Frances Oguwike PhD"] },
];

const advisory = [
  "Moses N. Chendo PhD", "O.B.C Nwankwo PhD", "Lawrence Okoye PhD", "Ogonna Ifebi PhD",
  "Rose Onyekwelu PhD", "M. N. Okeke PhD", "Anne Maduka PhD", "Onyema Ilo PhD",
  "Chigbo Ngige PhD", "Victoria Ibezue PhD", "Pascal Oguno PhD", "Kingsley Nwozor PhD",
  "Chukwuemeka Odumodu PhD", "Lawrence Ikeakor PhD", "Walter Nwafia PhD", "Sylvia Okonkwo PhD",
  "Anselem Nweke PhD", "Obiora Ejiofo PhD",
];

const adminSupport = [
  "Elemuo Stanley PhD", "Angela Ibekwe PhD", "Asika Ikechukwu PhD", "Tochukwu Madu PhD",
  "Uche Favour Muogbo PhD", "Goodfaith Dike PhD", "Gideon Nwafor PhD", "Azubuike JohnPaul",
  "Blessing Chugo Idigo PhD", "Cosmas Nwankwo PhD", "Onyekachukwu Ebenebe PhD",
  "Chibuzor Wilson Iteke", "Mbanefo Obioma D.", "Eboh Obinna PhD", "Chijioke Okoye PhD",
  "Nnatuanya Felix Obinna", "Ogechukwu Ben Owope PhD",
];

function BoardPage() {
  return (
    <>
      <PageHero
        kicker="Editorial Board"
        title="The scholars guiding the journal."
        body="A diverse team of editors and associate editors across every major discipline at COOU and beyond."
      />

      <Section eyebrow="Editorial Leadership" title="The core team.">
        <div className="grid gap-6 md:grid-cols-3 reveal-anim">
          {leadership.map((p) => (
            <div key={p.name} className="group glass-card p-10 rounded-[2rem] transition-all duration-500 hover:scale-[1.05] hover:border-primary premium-shadow">
              <div className="text-[9px] font-black uppercase tracking-[0.3em] text-primary/40 group-hover:text-primary transition-colors mb-4">{p.role}</div>
              <div className="font-display text-2xl font-black text-primary tracking-tight">{p.name}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Associate Editors" title="Disciplines." muted>
        <div className="grid gap-8 md:grid-cols-2 reveal-anim">
          {groups.map((g) => (
            <div key={g.discipline} className="group glass-card p-10 rounded-[2.5rem] transition-all duration-500 hover:border-primary bg-white/40">
              <h3 className="font-display text-2xl font-black text-primary tracking-tight mb-6">{g.discipline}</h3>
              <ul className="space-y-4">
                {g.members.map((m) => (
                  <li key={m} className="flex items-center gap-4 text-sm font-bold text-foreground/60 group-hover:text-foreground/80 transition-colors">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary/20" />
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Advisory Board" title="Advisory board.">
        <ul className="grid gap-x-12 gap-y-4 text-sm font-bold text-foreground/50 md:grid-cols-3 reveal-anim">
          {advisory.map((m) => (
            <li key={m} className="flex items-center gap-3 group">
              <span className="h-1.5 w-1.5 rounded-full bg-primary/10 group-hover:bg-primary transition-colors" />
              <span className="group-hover:text-primary transition-colors">{m}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section eyebrow="Administrative Support" title="Administrative support members." muted>
        <ul className="grid gap-x-12 gap-y-4 text-sm font-bold text-foreground/50 md:grid-cols-3 reveal-anim">
          {adminSupport.map((m) => (
            <li key={m} className="flex items-center gap-3 group">
              <span className="h-1.5 w-1.5 rounded-full bg-primary/10 group-hover:bg-primary transition-colors" />
              <span className="group-hover:text-primary transition-colors">{m}</span>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
