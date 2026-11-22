import { useEffect } from "react";
import { Link } from "react-router-dom";
import { projects } from "../data/projects";
import Footer from "../components/Footer";
import Media from "../components/Media";

const featured = [
  "what-could-you-be",
  "lets-hug",
  "makuly",
  "you-look-the-same",
  "recreatures",
  "make-choice-fate",
];

export default function Home() {
  useEffect(() => {
    document.title = "Yewon Jang";
  }, []);

  useEffect(() => {
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
  }, []);

  return (
    <main>
      <section className="home-gallery" aria-label="Selected work">
        {featured.map((slug, index) => {
          const project = projects.find((item) => item.slug === slug);
          if (!project?.homeMedia) return null;

          return (
            <Link target="_blank" rel="noopener noreferrer"
              key={slug}
              to={`/${slug}`}
              className={`home-gallery__tile home-gallery__tile--${slug}`}
              aria-label={project.title}
            >
              <Media item={project.homeMedia} fit="cover" priority={index < 2 || project.homeMedia.type === "video"} />
            </Link>
          );
        })}
      </section>
      <Footer />
    </main>
  );
}
