import { SITE } from "../data/projects";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="f-left">
        <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
      </div>
      <div className="f-right">
        © {new Date().getFullYear()} {SITE.name}
      </div>
    </footer>
  );
}
