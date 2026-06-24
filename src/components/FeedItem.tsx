import { useNavigate } from "react-router-dom";
import type { Project } from "../data/projects";
import Media from "./Media";

type Props = {
  project: Project;
  priority?: boolean;
};

export default function FeedItem({ project, priority }: Props) {
  const navigate = useNavigate();
  const to = `/${project.slug}`;

  return (
    <article
      className={`feed-item${project.coverText === "dark" ? " feed-item--dark" : ""}`}
      onClick={() => navigate(to)}
      role="link"
      tabIndex={0}
      aria-label={`${project.title}, ${project.category}, ${project.year}`}
      onKeyDown={(e) => {
        if (e.key === "Enter") navigate(to);
      }}
    >
      <div className="feed-media">
        <Media item={project.cover} fit="cover" priority={priority} />
      </div>

      <div className="feed-meta">
        <div className="m-title">{project.title}</div>
        {project.feedDescription ? (
          <p className="feed-desc">{project.feedDescription}</p>
        ) : null}
        <div className="m-cat">{project.category}</div>
      </div>
    </article>
  );
}
