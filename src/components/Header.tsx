import { Link } from "react-router-dom";
import { SITE } from "../data/projects";

export default function Header() {
  return (
    <header className="site-header">
      <div className="name">
        <Link to="/">{SITE.name}</Link>
      </div>
      <div className="nav-info">
        <Link to="/info">Info</Link>
      </div>
      <div className="nav-right">{SITE.role}</div>
    </header>
  );
}
