import { Sparkles, ArrowRight, MapPin } from "lucide-react";

export default function Hero() {
  return (
    <section id="hero" className="hero-section bg-animated" aria-labelledby="hero-title">
      {/* Floating Background Orbs */}
      <div className="orb orb-1" aria-hidden="true" />
      <div className="orb orb-2" aria-hidden="true" />
      <div className="orb orb-3" aria-hidden="true" />

      {/* AI Badge */}
      <div className="hero-badge" id="hero-badge" aria-label="Powered by Gemini AI">
        <Sparkles size={12} />
        Powered by Gemini AI
      </div>

      {/* Headline */}
      <h1 id="hero-title" className="hero-title">
        Your Dream Trip,{" "}
        <span className="gradient-text">Planned by AI</span>
        <br />
        in Seconds
      </h1>

      {/* Subtitle */}
      <p className="hero-subtitle">
        Describe where you want to go, your interests, and your budget —
        and let our AI craft a fully personalized travel itinerary tailored
        just for you, down to every detail.
      </p>

      {/* CTA Buttons */}
      <div className="hero-cta-group">
        <button
          id="hero-cta-primary"
          className="btn-gradient"
          onClick={() => {
            const el = document.getElementById("how-it-works");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}
          style={{ padding: "0.875rem 2rem", fontSize: "1rem", color: "#fff", display: "flex", alignItems: "center", gap: "0.5rem" }}
          aria-label="Plan my trip with AI"
        >
          Plan My Trip
          <ArrowRight size={18} />
        </button>
        <button
          id="hero-cta-secondary"
          className="btn-ghost"
          onClick={() => {
            const el = document.getElementById("features");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}
          style={{ padding: "0.875rem 2rem", fontSize: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}
          aria-label="See features and examples"
        >
          <MapPin size={18} />
          Explore Features
        </button>
      </div>

      {/* Floating stat pills */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          flexWrap: "wrap",
          justifyContent: "center",
          marginTop: "3rem",
          animation: "fadeInUp 0.7s ease 0.4s both",
        }}
      >
        {[
          { num: "50K+", label: "Trips Planned" },
          { num: "180+", label: "Countries" },
          { num: "4.9★", label: "User Rating" },
        ].map(({ num, label }) => (
          <div
            key={label}
            className="glass-card"
            style={{ padding: "0.6rem 1.4rem", display: "flex", flexDirection: "column", alignItems: "center", borderRadius: "1rem" }}
          >
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.2rem", color: "#a5b4fc" }}>{num}</span>
            <span style={{ fontSize: "0.7rem", color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
