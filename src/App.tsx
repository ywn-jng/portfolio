import { Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Header from "./components/Header";
import Home from "./pages/Home";
import Project from "./pages/Project";
import Process from "./pages/Process";
import About from "./pages/About";

export default function App() {
  const location = useLocation();

  // Reset scroll on every route change (usability, not decoration)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/info" element={<About />} />
        <Route path="/:slug/process" element={<Process />} />
        <Route path="/:slug" element={<Project />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </>
  );
}
