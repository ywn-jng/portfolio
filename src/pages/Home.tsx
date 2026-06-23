import { useEffect } from "react";
import { projects } from "../data/projects";
import FeedItem from "../components/FeedItem";
import Footer from "../components/Footer";

export default function Home() {
  useEffect(() => {
    document.title = "Yewon Jang";
  }, []);

  return (
    <main>
      <section className="feed">
        {projects.map((project, i) => (
          <FeedItem key={project.slug} project={project} priority={i === 0} />
        ))}
      </section>
      <Footer />
    </main>
  );
}
