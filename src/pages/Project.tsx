import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { projects } from "../data/projects";
import Media from "../components/Media";
import ArrowLeft from "../components/ArrowLeft";

function MediaBlock({
  item,
  priority,
  soundToggle,
}: {
  item: Parameters<typeof Media>[0]["item"];
  priority?: boolean;
  soundToggle?: boolean;
}) {
  return (
    <div className="media-block">
      <Media item={item} fit="flow" priority={priority} soundToggle={soundToggle} zoomable />
    </div>
  );
}

export default function Project() {
  const { slug } = useParams();
  const index = projects.findIndex((item) => item.slug === slug);
  const project = projects[index];
  const neighbors = [
    { label: "Previous", project: projects[index - 1], reverse: false },
    { label: "Next", project: projects[index + 1], reverse: true },
  ];

  useEffect(() => {
    if (project) document.title = `${project.title} — Yewon Jang`;
    window.scrollTo(0, 0);
  }, [project]);

  if (!project) {
    return (
      <main className="project">
        <div className="project-grid">
          <div className="project-info">
            <h1>Not found</h1>
            <Link to="/" className="project-back">
              Index
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const soundVideo = ["recreatures", "lets-hug"].includes(project.slug)
    ? project.media.find((item) => item.type === "video")
    : undefined;

  return (
    <main className="project">
      <div className="project-grid">
        {/* Column 1 — information */}
        <aside className="project-info">
          <Link to="/" className="nav-btn page-back-arrow" aria-label="Back to Work">
            <ArrowLeft />
          </Link>
          <h1>{project.title}</h1>

          {project.description && (
            <p className="project-desc">
              {typeof project.description === "string" ? project.description : project.description.map((part) => (
                typeof part === "string" ? part : "href" in part ? (
                  <a key={part.href} href={part.href} target="_blank" rel="noopener noreferrer">{part.text}</a>
                ) : <em key={part.emphasis}>{part.emphasis}</em>
              ))}
            </p>
          )}
        </aside>

        {/* Columns 2–4 — continuous, full-width media */}
        <section className="project-media">
          {project.media.map((item, i) => (
            <MediaBlock
              key={item.src}
              item={item}
              priority={i === 0 || item === soundVideo}
              soundToggle={item === soundVideo}
            />
          ))}
        </section>
      </div>

      <nav className="project-nav" aria-label="Project navigation">
        {neighbors.map(({ label, project: neighbor, reverse }) => (
          neighbor ? (
            <Link key={label} className="nav-btn"
              to={`/${neighbor.slug}`} aria-label={`${label} project: ${neighbor.title}`} title={neighbor.title}>
              <span className={reverse ? "project-arrow-next" : undefined}><ArrowLeft /></span>
            </Link>
          ) : (
            <span key={label} className="nav-btn disabled" aria-hidden="true">
              <span className={reverse ? "project-arrow-next" : undefined}><ArrowLeft /></span>
            </span>
          )
        ))}
        {project.process.length > 0 && (
          <Link to={`/${project.slug}/process`} className="project-process-link">
            Process
          </Link>
        )}
      </nav>
    </main>
  );
}
