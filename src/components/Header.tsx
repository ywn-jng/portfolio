import { Link, NavLink } from "react-router-dom";
import { SITE } from "../data/projects";

export default function Header() {
  return (
    <nav className="site-nav" aria-label="Main navigation">
      <NavLink target="_blank" rel="noopener noreferrer" to="/" end>{SITE.name}</NavLink>
      <Link target="_blank" rel="noopener noreferrer" to="/">Work</Link>
      <NavLink target="_blank" rel="noopener noreferrer" to="/info">About</NavLink>
      <a target="_blank" rel="noopener noreferrer" href={`mailto:${SITE.email}`}>Contact</a>
    </nav>
  );
}
