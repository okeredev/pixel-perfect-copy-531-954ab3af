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
  { role: "Managing Editor", name: "Chukwunonso Ekesiobi, PhD" },
  { role: "Online Editor", name: "JohnPaul Iloh, PhD" },
  { role: "Publicity Editor", name: "Madumelu H. C. Madubueze, PhD" },
];

const groups: { discipline: string; members: string[] }[] = [
  { discipline: "Agricultural Sciences", members: ["Ebele Offiah, PhD", "Margret Okeke, PhD", "Ikechukwu Nweke"] },
  { discipline: "Arts & Humanities", members: ["Cyril Ofoegbu, PhD", "Obiageli Okpala, PhD", "Chisom M. Okafor, PhD", "Anthony Nnalue, PhD"] },
  { discipline: "College of Medicine", members: ["Chukwuemeka Azikiwe, PhD", "Peter Ughachukwu, PhD", "Ifeanyichukwu Ezebialu, PhD"] },
  { discipline: "Education", members: ["Zita Obi, PhD", "Patrick Okafor, PhD", "Josephine Morah, PhD", "Chinonso Ofozoba, PhD", "Ngozika Ekwe, PhD"] },
  { discipline: "Pharmaceutical Sciences", members: ["Afunwa Emmanuel, PhD", "Oranu Emmanuel, PhD", "Amobi Emmanuel, PhD", "Ezeonyi Ebere, PhD", "Ernest Erhirhie, PhD", "Onwuzuligbo Chukwunonso, PhD"] },
  { discipline: "Management & Business", members: ["Chioma F. Okeke, PhD", "Joyce Ifeyinwa Odieli, PhD", "Bernard Alajekwu, PhD", "Jacinta Nwangwu, PhD", "Chineze Justina Ifechukwu-Jacobs, PhD", "Ifeoma Orjinta, PhD"] },
  { discipline: "Natural Sciences", members: ["Andrew Nwaka, PhD", "Jonathan Ifemeje, PhD", "Chiamaka Ejimofor, PhD", "Bright Uba, PhD", "Charles Aronu, PhD"] },
  { discipline: "Environmental Sciences", members: ["Oluchi Ifebi, PhD", "Okamaka Okonkwo, PhD", "Kelechi Ezeji, PhD", "Ndidi Okolo, PhD", "Chinwe Odimegwu, PhD"] },
  { discipline: "Basic Medical Sciences", members: ["Izuchukwu Ifedi, PhD", "Obioma Nweke, PhD", "Chinedu Olisah, PhD", "Agnes Nwakamma, PhD", "Frances Oguwike, PhD"] },
  { discipline: "Law & Social Sciences", members: ["Chinwe Iloka, PhD", "Emilia Mgbemena, PhD", "Ifeoma Nwakoby", "Rev. Sr. Anne Obiora, PhD"] },
];

const advisory = [
  "Moses N. Chendo, PhD", "O. B. C. Nwankwo, PhD", "Lawrence Okoye, PhD", "Ogonna Ifebi, PhD",
  "Rose Onyekwelu, PhD", "M. N. Okeke, PhD", "Anne Maduka, PhD", "Onyema Ilo, PhD",
  "Chigbo Ngige, PhD", "Victoria Ibezue, PhD", "Pascal Oguno, PhD", "Kingsley Nwozor, PhD",
  "Chukwuemeka Odumodu, PhD", "Uche Favour Muogbo, PhD", "Goodfaith Dike, PhD", "Gideon Nwafor, PhD",
  "Azubuike JohnPaul", "Blessing Chugo Idigo, PhD", "Cosmas Nwankwo, PhD", "Onyekachukwu Ebenebe, PhD",
  "Chibuzor Wilson Iteke", "Mbanefo Obioma D.", "Eboh Obinna, PhD", "Chijioke Okoye, PhD",
  "Nnatuanya Felix Obinna", "Ogechukwu Ben Owope, PhD",
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
    </>
  );
}
