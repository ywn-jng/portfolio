import { useEffect } from "react";
import { Link } from "react-router-dom";
import ArrowLeft from "../components/ArrowLeft";
import ParticleSpring, { type TimelineEntry } from "../components/ParticleSpring";
import { SITE } from "../data/projects";

const contacts = [
  {
    label: "Email",
    href: `mailto:${SITE.email}`,
    icon: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></>,
  },
  {
    label: "Instagram",
    href: SITE.instagram.url,
    icon: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" /></>,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/yewonjang/",
    icon: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M7.5 10v7m4-7v7m0-4a2.5 2.5 0 0 1 5 0v4" /><circle cx="7.5" cy="7" r="0.85" fill="currentColor" stroke="none" /></>,
  },
];

const timeline: TimelineEntry[] = [
  { category: "experience", name: "Stink Films", url: "https://stinkfilms.com/united-kingdom", detail: "3D Artist", date: "2026, London" },
  { category: "exhibition", name: "M.I.E.A.U.", url: "https://www.instagram.com/p/Dd1PiMJOzBr/", detail: "Gorvy Theatre", date: "2026, London" },
  { category: "exhibition", name: "RCA 2026", url: "https://www.rca.ac.uk/news-and-events/news/announcing-rca2026-festival-of-communication/", detail: "Dorando Garden", date: "2026, London" },
  { category: "education", name: "Royal College of Art", url: "https://www.rca.ac.uk/study/programme-finder/visual-communication-ma/", detail: "MA Visual Communication", date: "2025–2026, London" },
  { category: "exhibition", name: "Phreaking Collective", url: "https://www.instagram.com/p/DafPNEDojXN/", detail: "Kennington", date: "2026, London" },
  { category: "education", name: "UAL London College of Communication", url: "https://www.arts.ac.uk/subjects/creative-computing/short-courses/creative-coding/creative-coding-online-short-course-creative-computing", detail: "Short Course Creative Coding", date: "2026, London" },
  { category: "exhibition", name: "EDGE", url: "https://edgearchive.com", detail: "Daesan Gallery", date: "2024, Seoul" },
  { category: "education", name: "Ewha Womans University", url: "https://artndesign.ewha.ac.kr/en/", detail: "BFA Design Department", date: "2020–2025, Seoul" },
  { category: "experience", name: "LG Uplus", url: "https://www.instagram.com/lguplus_/", detail: "Graphic Designer", date: "2022, Seoul" },
  { category: "exhibition", name: "Biennale internationale d’affiches", url: "https://ecolededesign.fr/nos-etudiants-exposent-au-signe-a-chaumont/", detail: "Le Signe", date: "2023, Chaumont" },
  { category: "education", name: "L’École Supérieure de Design", url: "https://ecolededesign.fr", detail: "Exchange Student", date: "2023, Troyes" },
  { category: "experience", name: "Ewhaian", url: "https://www.instagram.com/ewhaian_2001/", detail: "Designer", date: "2021–2022, Seoul" },
];

export default function About() {
  useEffect(() => {
    document.title = `About — ${SITE.name}`;
  }, []);

  return (
    <main className="about-page">
      <div className="about-intro">
        <Link target="_blank" rel="noopener noreferrer" to="/" className="nav-btn page-back-arrow" aria-label="Back to Work">
          <ArrowLeft />
        </Link>
        <p className="about-bio">
          {SITE.name} is a London-based visual maker originally from Korea.
          She recently graduated from the <a target="_blank" rel="noopener noreferrer" href="https://2026.rca.ac.uk/school-of-communication/visual-communication-ma/profile/yewon-jang/">RCA</a> with an MA in
          Visual Communication, where she worked across forms of visual experimentation.
          Her practice explores ways of making images through digital media, including creative
          coding, graphic design and moving image.
        </p>
      </div>
      <ParticleSpring entries={timeline} />
      <nav className="project-nav about-cv-download" aria-label="Contact and CV">
        {contacts.map(({ label, href, icon }) => (
          <a target="_blank" rel="noopener noreferrer" key={label} className="nav-btn" href={href} aria-label={label} title={label}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {icon}
            </svg>
          </a>
        ))}
        <a target="_blank" rel="noopener noreferrer" className="project-process-link" href="/yewon-jang-cv.pdf?v=d94ff3cb" download="CV (yewon jang).pdf">Download CV</a>
      </nav>
    </main>
  );
}
