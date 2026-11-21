import { useEffect, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { SITE } from "../data/projects";

type Entry = {
  name: string;
  url: string;
  detail: string;
  date: string;
  x: number;
  y: number;
};

const experience: Entry[] = [
  { name: "Stink Films", url: "https://stinkfilms.com/united-kingdom", detail: "3D Artist", date: "2026, London", x: 0, y: 0 },
  { name: "LG Uplus", url: "https://www.instagram.com/lguplus_/", detail: "Graphic Designer", date: "2022, Seoul", x: 1, y: 4.75 },
  { name: "Ewhaian", url: "https://www.instagram.com/ewhaian_2001/", detail: "Designer", date: "2021–2022, Seoul", x: 0.125, y: 9.5 },
];

const education: Entry[] = [
  { name: "Royal College of Art", url: "https://www.rca.ac.uk/study/programme-finder/visual-communication-ma/", detail: "MA Visual Communication", date: "2025–2026, London", x: 1.625, y: 0 },
  { name: "Ewha Womans University", url: "https://artndesign.ewha.ac.kr/en/", detail: "BFA Design Department", date: "2020–2025, Seoul", x: 3, y: 4.75 },
  { name: "UAL London College of Communication", url: "https://www.arts.ac.uk/subjects/creative-computing/short-courses/creative-coding/creative-coding-online-short-course-creative-computing", detail: "Short Course Creative Coding", date: "2026, London", x: 0, y: 9.25 },
  { name: "L’École Supérieure de Design", url: "https://ecolededesign.fr", detail: "Exchange Student", date: "2023, Troyes", x: 1, y: 14 },
];

const exhibitions: Entry[] = [
  { name: "RCA2026", url: "https://www.rca.ac.uk/news-and-events/news/announcing-rca2026-festival-of-communication/", detail: "Dorando Garden", date: "2026, London", x: 0, y: 0 },
  { name: "M.I.E.A.U.", url: "https://www.instagram.com/p/Dd1PiMJOzBr/", detail: "Gorvy Theatre", date: "2026, London", x: 1, y: 4.5 },
  { name: "EDGE", url: "https://edgearchive.com", detail: "Daesan Gallery", date: "2024, Seoul", x: 0.5, y: 9.25 },
  { name: "Phreaking Collective", url: "https://www.instagram.com/p/DafPNEDojXN/", detail: "Kennington", date: "2026, London", x: 2, y: 9.25 },
  { name: "Biennale internationale d’affiches", url: "https://ecolededesign.fr/nos-etudiants-exposent-au-signe-a-chaumont/", detail: "Le Signe", date: "2023, Chaumont", x: 3, y: 14 },
];

function Credits({ group, label, entries }: { group: string; label: string; entries: Entry[] }) {
  return (
    <section className={`about-credits about-credits--${group}`} aria-label={label}>
      <span className="about-marker" aria-hidden="true" />
      <ul>
        {entries.map(({ name, url, detail, date, x, y }) => (
          <li key={name} style={{ "--entry-x": `${x}`, "--entry-y": `${y}` } as CSSProperties}>
            <a className="about-credit-name" href={url}>{name}</a>
            <div><em>{detail}</em></div>
            <div>{date}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function About() {
  useEffect(() => {
    document.title = `About — ${SITE.name}`;
  }, []);

  return (
    <main className="about-page">
      <p className="about-bio">
        <Link to="/">{SITE.name}</Link> is a London-based visual maker originally from Korea.
        She recently graduated from the <a href="https://www.rca.ac.uk/study/programme-finder/visual-communication-ma/">RCA</a> with an MA in
        Visual Communication, where she worked across forms of visual experimentation.
        Her practice explores ways of making images through digital media, including creative
        coding, graphic design and moving image.
      </p>
      <Credits group="experience" label="Work experience" entries={experience} />
      <Credits group="education" label="Education" entries={education} />
      <Credits group="exhibitions" label="Exhibitions and screenings" entries={exhibitions} />
    </main>
  );
}
