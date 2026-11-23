import { Link, NavLink } from "react-router-dom";
import { SITE } from "../data/projects";

export default function Header() {
  return (
    <nav className="site-nav" aria-label="Main navigation">
      <NavLink to="/" end>{SITE.name}</NavLink>
      <div className="site-nav__links">
        <Link to="/">Work</Link>
        <NavLink to="/info">About</NavLink>
        <a href={`mailto:${SITE.email}`}>Contact</a>
      </div>
    </nav>
  );
}
