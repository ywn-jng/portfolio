import { useEffect } from "react";
import { SITE } from "../data/projects";
import Footer from "../components/Footer";

export default function About() {
  useEffect(() => {
    document.title = `Info — ${SITE.name}`;
  }, []);

  return (
    <main className="project info-page">
      <div className="project-grid">
        {/* Column 1 — statement + contact */}
        <div className="about">
          <p className="about-statement">{SITE.about}</p>

          <div className="about-contact">
            <div className="about-ig">
              <span>Instagram</span>
              <a
                href={SITE.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {SITE.instagram.handle}
              </a>
            </div>
          </div>
        </div>

        {/* Column 2 — work & education */}
        <div className="about-cv">
          <section className="cv-block">
            <h2 className="cv-head">Work Experience</h2>
            {SITE.work.map((item) => (
              <div className="cv-item" key={item.org}>
                <div className="cv-org">{item.org}</div>
                <div className="cv-when">{item.when}</div>
              </div>
            ))}
          </section>

          <section className="cv-block">
            <h2 className="cv-head">Education</h2>
            {SITE.education.map((item) => (
              <div className="cv-item" key={item.org}>
                <div className="cv-org">{item.org}</div>
                <div className="cv-detail">{item.detail}</div>
                <div className="cv-when">{item.when}</div>
              </div>
            ))}
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
