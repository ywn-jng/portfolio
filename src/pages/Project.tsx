import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { projects } from "../data/projects";
import Media from "../components/Media";

const ArrowLeft = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M19 12H5M5 12L12 19M5 12L12 5"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ArrowRight = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M5 12H19M19 12L12 5M19 12L12 19"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function MediaBlock({
  item,
  priority,
}: {
  item: Parameters<typeof Media>[0]["item"];
  priority?: boolean;
}) {
  return (
    <div className="media-block">
      <Media item={item} fit="flow" priority={priority} zoomable />
    </div>
  );
}

export default function Project() {
  const { slug } = useParams();
  const index = projects.findIndex((p) => p.slug === slug);
  const project = index >= 0 ? projects[index] : undefined;
  const prev = index > 0 ? projects[index - 1] : undefined;
  const next =
    index >= 0 && index < projects.length - 1
      ? projects[index + 1]
      : undefined;

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

  return (
    <main className="project">
      <div className="project-grid">
        {/* Column 1 — information */}
        <aside className="project-info">
          <h1>{project.title}</h1>

          <div className="info-table">
            {project.year && <div className="meta-line">{project.year}</div>}
            {project.category && (
              <div className="meta-line">{project.category}</div>
            )}
            {project.info?.map((row) => (
              <div className="meta-line" key={row.label}>
                {row.value}
              </div>
            ))}
          </div>

          <p className="project-desc">{project.description}</p>

          <Link to={`/${project.slug}/process`} className="project-back">
            Process
          </Link>
        </aside>

        {/* Columns 2–4 — continuous, full-width media */}
        <section className="project-media">
          {project.media.map((item, i) => (
            <MediaBlock key={i} item={item} priority={i === 0} />
          ))}
        </section>
      </div>

      {/* Fixed prev/next — consistent across every project page */}
      <nav className="project-nav" aria-label="Project navigation">
        {prev ? (
          <Link
            to={`/${prev.slug}`}
            className="nav-btn"
            aria-label={`Previous project: ${prev.title}`}
            title={prev.title}
          >
            <ArrowLeft />
          </Link>
        ) : (
          <span className="nav-btn disabled" aria-hidden="true">
            <ArrowLeft />
          </span>
        )}
        {next ? (
          <Link
            to={`/${next.slug}`}
            className="nav-btn"
            aria-label={`Next project: ${next.title}`}
            title={next.title}
          >
            <ArrowRight />
          </Link>
        ) : (
          <span className="nav-btn disabled" aria-hidden="true">
            <ArrowRight />
          </span>
        )}
      </nav>
    </main>
  );
}
