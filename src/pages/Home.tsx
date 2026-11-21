import { useEffect } from "react";
import { Link } from "react-router-dom";
import { projects } from "../data/projects";
import FeedItem from "../components/FeedItem";
import Footer from "../components/Footer";

const featured = [
  { slug: "what-could-you-be", image: "home.webp" },
  { slug: "lets-hug", image: "home.webp" },
  { slug: "makuly", image: "home.webp" },
  { slug: "you-look-the-same", image: "01.webp" },
  { slug: "recreatures", image: "01.webp" },
  { slug: "make-choice-fate", image: "home.webp" },
];

export default function Home({ work = false }: { work?: boolean }) {
  useEffect(() => {
    document.title = work ? "Work — Yewon Jang" : "Yewon Jang";
  }, [work]);

  useEffect(() => {
    if (work) return;

    const targets = ".home-gallery__tile, .site-nav a, .site-footer a";
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)");
    let highlighted: Element | null = null;

    function updateHighlight(event: PointerEvent) {
      if (!canHover.matches || event.pointerType !== "mouse") return;
      const next = event.target instanceof Element ? event.target.closest(targets) : null;
      if (!next) {
        delete document.body.dataset.homeDimming;
        return;
      }

      if (highlighted !== next) {
        highlighted?.removeAttribute("data-hover-highlight");
        next.setAttribute("data-hover-highlight", "");
        highlighted = next;
      }
      document.body.dataset.homeDimming = "";
    }

    function clearOnExit(event: PointerEvent) {
      if (!event.relatedTarget) delete document.body.dataset.homeDimming;
    }

    function reset() {
      delete document.body.dataset.homeDimming;
      highlighted?.removeAttribute("data-hover-highlight");
      highlighted = null;
    }

    document.addEventListener("pointerover", updateHighlight);
    document.addEventListener("pointerout", clearOnExit);
    window.addEventListener("blur", reset);
    canHover.addEventListener("change", reset);
    return () => {
      document.removeEventListener("pointerover", updateHighlight);
      document.removeEventListener("pointerout", clearOnExit);
      window.removeEventListener("blur", reset);
      canHover.removeEventListener("change", reset);
      reset();
    };
  }, [work]);

  return (
    <main>
      {work ? (
        <section className="feed" aria-label="Work">
          {projects.map((project, i) => (
            <FeedItem key={project.slug} project={project} priority={i === 0} />
          ))}
        </section>
      ) : (
        <section className="home-gallery" aria-label="Selected work">
          {featured.map(({ slug, image }, index) => {
            const project = projects.find((item) => item.slug === slug);
            if (!project) return null;

            return (
              <Link
                key={slug}
                to={`/${slug}`}
                className={`home-gallery__tile home-gallery__tile--${slug}`}
                aria-label={project.title}
              >
                <img
                  src={`/media/${slug}/${image}`}
                  alt=""
                  loading={index < 2 ? "eager" : "lazy"}
                  decoding="async"
                />
              </Link>
            );
          })}
        </section>
      )}
      <Footer />
    </main>
  );
}
