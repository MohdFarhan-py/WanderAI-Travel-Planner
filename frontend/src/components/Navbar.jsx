import { useState, useEffect } from "react";
import { Plane, Menu, X, Bookmark } from "lucide-react";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Planner", href: "#planner" },
];

export default function Navbar({ onOpenSavedTrips }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className="navbar"
      style={{ background: scrolled ? "rgba(10,15,30,0.92)" : "rgba(10,15,30,0.5)" }}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <a href="#" id="nav-logo" className="navbar-logo gradient-text" aria-label="WanderAI Home">
        <span style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
          <Plane size={22} strokeWidth={2.2} style={{ color: "#6366f1" }} />
          WanderAI
        </span>
      </a>

      {/* Desktop Links */}
      <ul className="navbar-links" style={{ display: "flex" }} aria-label="Navigation links">
        {NAV_LINKS.map((link) => (
          <li key={link.href}>
            <a href={link.href} id={`nav-link-${link.label.replace(/\s/g, "-").toLowerCase()}`}>
              {link.label}
            </a>
          </li>
        ))}
      </ul>

      {/* CTA & Saved Trips */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <button
          id="nav-saved-trips-btn"
          type="button"
          className="btn-ghost"
          onClick={onOpenSavedTrips}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.45rem",
            padding: "0.5rem 1rem",
            fontSize: "0.875rem",
            borderColor: "rgba(99, 102, 241, 0.4)",
            color: "#e2e8f0"
          }}
          title="View your saved itineraries"
        >
          <Bookmark size={15} style={{ color: "#818cf8" }} />
          <span>My Saved Trips</span>
        </button>

        <button id="nav-signin-btn" className="btn-ghost" style={{ padding: "0.5rem 1.25rem", fontSize: "0.875rem" }}>
          Sign In
        </button>
        <button
          id="nav-start-btn"
          className="btn-gradient"
          style={{ padding: "0.5rem 1.25rem", fontSize: "0.875rem", color: "#fff" }}
          onClick={() => {
            const el = document.getElementById("how-it-works");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}
        >
          Get Started
        </button>

        {/* Mobile hamburger */}
        <button
          id="nav-mobile-menu-btn"
          className="btn-ghost"
          style={{ padding: "0.5rem", display: "none" }}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
    </nav>
  );
}
