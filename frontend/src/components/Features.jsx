import { Brain, Route, Clock, Globe, DollarSign, Heart } from "lucide-react";

const FEATURES = [
  {
    icon: Brain,
    title: "AI-Powered Planning",
    desc: "Gemini AI analyzes your preferences to craft hyper-personalized itineraries that match your travel style.",
    color: "#6366f1",
  },
  {
    icon: Route,
    title: "Smart Route Optimization",
    desc: "Automatically optimizes your travel route to minimize transit time and maximize your experience.",
    color: "#8b5cf6",
  },
  {
    icon: Clock,
    title: "Day-by-Day Schedules",
    desc: "Get detailed hour-by-hour plans for every day of your trip, including reservations and travel time.",
    color: "#06b6d4",
  },
  {
    icon: Globe,
    title: "180+ Destinations",
    desc: "Comprehensive knowledge of destinations worldwide — from iconic cities to hidden gems off the beaten path.",
    color: "#10b981",
  },
  {
    icon: DollarSign,
    title: "Budget Aware",
    desc: "Set your budget and the AI will tailor accommodation, dining, and activities accordingly.",
    color: "#f59e0b",
  },
  {
    icon: Heart,
    title: "Saves Your Favorites",
    desc: "Bookmark trips, create wishlists, and revisit past itineraries stored securely in your account.",
    color: "#ef4444",
  },
];

export default function Features() {
  return (
    <section id="features" className="features-section" aria-labelledby="features-title">
      <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
        <h2
          id="features-title"
          style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem,4vw,3rem)", fontWeight: 800, marginBottom: "1rem" }}
        >
          Everything You Need for the{" "}
          <span className="gradient-text">Perfect Trip</span>
        </h2>
        <p style={{ color: "var(--color-text-secondary)", maxWidth: "50ch", margin: "0 auto", fontSize: "1.05rem" }}>
          From AI itinerary generation to smart budgeting — all in one elegant interface.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "1.25rem",
        }}
      >
        {FEATURES.map(({ icon: Icon, title, desc, color }, idx) => (
          <article
            key={title}
            id={`feature-card-${idx}`}
            className="glass-card feature-card"
            aria-label={title}
          >
            <div className="feature-icon" style={{ background: `${color}18`, borderColor: `${color}30` }}>
              <Icon size={22} style={{ color }} strokeWidth={2} />
            </div>
            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.05rem", marginBottom: "0.5rem" }}>
              {title}
            </h3>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem", lineHeight: 1.65 }}>{desc}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
