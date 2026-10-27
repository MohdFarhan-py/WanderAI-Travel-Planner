import { useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import PreferenceForm from "./components/PreferenceForm";
import Features from "./components/Features";
import PlannerCanvas from "./components/PlannerCanvas";
import SavedTripsModal from "./components/SavedTripsModal";

function App() {
  const [itinerary, setItinerary] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [savedTripsOpen, setSavedTripsOpen] = useState(false);

  const handleItineraryGenerated = (generatedItinerary, prefs) => {
    setItinerary(generatedItinerary);
    setPreferences(prefs);
    setTimeout(() => {
      const el = document.getElementById("planner");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }, 150);
  };

  const handleSelectSavedTrip = (savedTrip) => {
    let tripData = savedTrip.itinerary_data;
    if (typeof tripData === "string") {
      try {
        tripData = JSON.parse(tripData);
      } catch (err) {
        console.error("Failed to parse itinerary_data", err);
      }
    }

    setItinerary(tripData);
    setPreferences({
      destination: savedTrip.destination,
      start_date: savedTrip.start_date,
      end_date: savedTrip.end_date,
      total_days: savedTrip.total_days,
      budget: tripData?.trip_overview?.budget_tier || "Moderate",
    });

    setSavedTripsOpen(false);

    setTimeout(() => {
      const el = document.getElementById("planner");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }, 150);
  };

  const handleReset = () => {
    setItinerary(null);
    setPreferences(null);
    const el = document.getElementById("how-it-works");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      <Navbar onOpenSavedTrips={() => setSavedTripsOpen(true)} />
      <SavedTripsModal
        isOpen={savedTripsOpen}
        onClose={() => setSavedTripsOpen(false)}
        onSelectTrip={handleSelectSavedTrip}
      />
      <main>
        <Hero />
        <div className="section-divider" />

        {/* ── Preference Wizard ── */}
        <section id="how-it-works" aria-labelledby="pf-section-title">
          <div className="pf-section">
            <div className="pf-section-header">
              <h2 id="pf-section-title" className="pf-section-title">
                Plan Your Trip in{" "}
                <span className="gradient-text">4 Easy Steps</span>
              </h2>
              <p className="pf-section-sub">
                Tell us about your dream trip and our AI will craft a
                personalised itinerary tailored just for you.
              </p>
            </div>
            <PreferenceForm onItineraryGenerated={handleItineraryGenerated} />
          </div>
        </section>

        <div className="section-divider" />
        <Features />
        <div className="section-divider" />
        <PlannerCanvas
          itinerary={itinerary}
          preferences={preferences}
          onItineraryUpdated={setItinerary}
          onReset={handleReset}
        />
      </main>
      <footer
        style={{
          textAlign: "center",
          padding: "2rem 1.5rem",
          color: "var(--color-text-secondary)",
          fontSize: "0.8rem",
          borderTop: "1px solid var(--color-border)",
        }}
      >
        {"\u00A9"} 2026 WanderAI {"·"} Built with Gemini AI {"&"} FastAPI
      </footer>
    </div>
  );
}

export default App;
