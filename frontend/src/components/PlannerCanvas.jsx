import { useState } from "react";
import {
  Map, Sparkles, Calendar, DollarSign, Users, Zap,
  RefreshCw, Sunrise, Sun, Moon, MapPin, Luggage, Compass,
  Printer, ArrowLeft, CheckCircle2, AlertCircle, Bookmark, BookmarkCheck
} from "lucide-react";

export default function PlannerCanvas({
  itinerary,
  preferences,
  onItineraryUpdated,
  onReset
}) {
  const [regeneratingDay, setRegeneratingDay] = useState(null);
  const [regenError, setRegenError] = useState("");
  const [successToast, setSuccessToast] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [savedTripId, setSavedTripId] = useState(null);

  const scrollToWizard = () => {
    const el = document.getElementById("how-it-works");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleSaveTrip = async () => {
    if (!itinerary || isSaving) return;
    setIsSaving(true);
    setRegenError("");

    try {
      const destination =
        itinerary.trip_overview?.destination ||
        preferences?.destination ||
        "Unknown Destination";
      const startDate =
        preferences?.start_date ||
        itinerary.days?.[0]?.date ||
        new Date().toISOString().split("T")[0];
      const endDate =
        preferences?.end_date ||
        itinerary.days?.[itinerary.days?.length - 1]?.date ||
        new Date().toISOString().split("T")[0];
      const totalDays =
        preferences?.total_days ||
        itinerary.trip_overview?.total_days ||
        itinerary.days?.length ||
        1;
      const totalBudgetEst = itinerary.estimated_total_cost_usd || 0;

      const payload = {
        destination,
        start_date: startDate,
        end_date: endDate,
        total_days: totalDays,
        total_budget_est: totalBudgetEst,
        itinerary_data: itinerary,
      };

      const res = await fetch("http://localhost:8000/api/itineraries/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to save itinerary");
      }

      setSavedTripId(data.id);
      setSuccessToast(`Trip saved successfully! ID: ${data.id}`);
      setTimeout(() => {
        setSuccessToast("");
      }, 7000);
    } catch (err) {
      setRegenError(err.message || "Failed to save trip. Please try again.");
      setTimeout(() => {
        setRegenError("");
      }, 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRegenerateDay = async (dayNumber, dayDate) => {
    if (!itinerary || regeneratingDay !== null) return;
    setRegeneratingDay(dayNumber);
    setRegenError("");

    try {
      const payload = {
        destination: itinerary.trip_overview?.destination || preferences?.destination,
        day_number: dayNumber,
        date: dayDate,
        preferences: preferences || {
          destination: itinerary.trip_overview?.destination,
          budget: preferences?.budget || "Moderate",
          travel_style: preferences?.travel_style || "Solo",
          interests: preferences?.interests || ["Culture"],
          pace: preferences?.pace || "Balanced",
        },
        existing_days_context: itinerary.days.filter(d => d.day_number !== dayNumber),
      };

      const res = await fetch("http://localhost:8000/api/regenerate-day", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to regenerate day");

      const newDay = data.day;
      const updatedDays = itinerary.days.map(d =>
        d.day_number === dayNumber ? newDay : d
      );

      // Recalculate estimated cost if possible
      let newTotalCost = 0;
      updatedDays.forEach(d => {
        newTotalCost += (d.morning?.cost_estimate_usd || 0) +
                        (d.afternoon?.cost_estimate_usd || 0) +
                        (d.evening?.cost_estimate_usd || 0);
      });

      const updatedItinerary = {
        ...itinerary,
        days: updatedDays,
        estimated_total_cost_usd: newTotalCost || itinerary.estimated_total_cost_usd,
      };

      onItineraryUpdated(updatedItinerary);
      setSuccessToast(`Day ${dayNumber} successfully refreshed with new activities!`);
      setTimeout(() => setSuccessToast(""), 4000);
    } catch (err) {
      setRegenError(err.message || "Failed to regenerate day. Please try again.");
    } finally {
      setRegeneratingDay(null);
    }
  };

  // ── Render Blank Canvas if no itinerary yet ──────────────────────────────────
  if (!itinerary) {
    return (
      <section id="planner" className="canvas-section" aria-labelledby="planner-title">
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <h2
            id="planner-title"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.8rem,4vw,2.8rem)",
              fontWeight: 800,
              marginBottom: "1rem"
            }}
          >
            Your Itinerary <span className="gradient-text">Canvas</span>
          </h2>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "1rem" }}>
            Once you describe your trip, your full personalized itinerary will appear here.
          </p>
        </div>

        <div id="planner-canvas" className="glass-card canvas-placeholder" aria-label="Itinerary planning canvas">
          <div
            style={{
              width: "5rem",
              height: "5rem",
              borderRadius: "1.25rem",
              background: "linear-gradient(135deg,rgba(99,102,241,0.15),rgba(139,92,246,0.15))",
              border: "1px solid rgba(99,102,241,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: "pulse-slow 2.5s ease-in-out infinite",
            }}
          >
            <Map size={36} style={{ color: "#6366f1" }} strokeWidth={1.5} />
          </div>
          <p style={{ fontWeight: 600, fontSize: "1.05rem", color: "var(--color-text-primary)" }}>
            Your AI Itinerary Will Appear Here
          </p>
          <p style={{ maxWidth: "42ch", textAlign: "center", lineHeight: 1.65, color: "var(--color-text-secondary)" }}>
            Complete the 4 simple steps in the planner above, then hit{" "}
            <strong style={{ color: "#a5b4fc" }}>Generate Itinerary</strong> to watch Gemini AI design your journey.
          </p>
          <button
            id="canvas-generate-btn"
            type="button"
            className="btn-gradient"
            onClick={scrollToWizard}
            style={{
              marginTop: "0.5rem",
              padding: "0.75rem 2rem",
              color: "#fff",
              fontSize: "0.95rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}
            aria-label="Scroll up to trip planner"
          >
            <Sparkles size={16} />
            Start Planning Trip
          </button>
        </div>
      </section>
    );
  }

  // ── Render Generated Itinerary ──────────────────────────────────────────────
  const { trip_overview, days = [], estimated_total_cost_usd } = itinerary;

  return (
    <section id="planner" className="canvas-section" aria-labelledby="planner-title">
      <div className="itinerary-container">
        {/* Toast notifications */}
        {successToast && (
          <div className="itinerary-toast itinerary-toast--success">
            <CheckCircle2 size={18} />
            <span>{successToast}</span>
          </div>
        )}
        {regenError && (
          <div className="itinerary-toast itinerary-toast--error">
            <AlertCircle size={18} />
            <span>{regenError}</span>
          </div>
        )}

        {/* Top Header Card */}
        <header className="glass-card itinerary-hero-card">
          <div className="itinerary-hero-top">
            <div className="itinerary-badge">
              <Sparkles size={14} /> AI Tailored Itinerary
            </div>
            <div className="itinerary-actions">
              <button
                id="canvas-save-trip-btn"
                type="button"
                className="btn-gradient itinerary-action-btn"
                onClick={handleSaveTrip}
                disabled={isSaving}
                title="Save Trip to Supabase"
                style={{
                  color: "#fff",
                  background: savedTripId
                    ? "linear-gradient(135deg, #10b981, #059669)"
                    : undefined,
                }}
              >
                {isSaving ? (
                  <>
                    <RefreshCw size={14} className="spin" /> Saving...
                  </>
                ) : savedTripId ? (
                  <>
                    <BookmarkCheck size={14} /> Saved!
                  </>
                ) : (
                  <>
                    <Bookmark size={14} /> Save Trip
                  </>
                )}
              </button>
              <button
                type="button"
                className="btn-ghost itinerary-action-btn"
                onClick={() => window.print()}
                title="Print or Save as PDF"
              >
                <Printer size={15} /> Print
              </button>
              <button
                type="button"
                className="btn-ghost itinerary-action-btn"
                onClick={onReset || scrollToWizard}
                title="Plan another adventure"
              >
                <ArrowLeft size={15} /> Plan Another
              </button>
            </div>
          </div>

          <h2 id="planner-title" className="itinerary-title">
            Trip to <span className="gradient-text">{trip_overview?.destination || "Your Destination"}</span>
          </h2>

          {/* Preferences Pills */}
          <div className="itinerary-pills-row">
            <span className="itinerary-pill">
              <Calendar size={14} /> {trip_overview?.total_days || days.length} Days
            </span>
            {preferences?.budget && (
              <span className="itinerary-pill">
                <DollarSign size={14} /> {preferences.budget} Budget
              </span>
            )}
            {preferences?.travel_style && (
              <span className="itinerary-pill">
                <Users size={14} /> {preferences.travel_style}
              </span>
            )}
            {preferences?.pace && (
              <span className="itinerary-pill">
                <Zap size={14} /> {preferences.pace} Pace
              </span>
            )}
            {estimated_total_cost_usd && (
              <span className="itinerary-pill itinerary-pill--accent">
                Approx. ${estimated_total_cost_usd} USD / person
              </span>
            )}
          </div>

          {/* Summary Text */}
          {trip_overview?.summary && (
            <p className="itinerary-summary-text">
              {trip_overview.summary}
            </p>
          )}

          {/* Travel Tips Row */}
          <div className="itinerary-tips-grid">
            {trip_overview?.transport_tip && (
              <div className="itinerary-tip-card">
                <div className="itinerary-tip-icon">
                  <Compass size={18} style={{ color: "#38bdf8" }} />
                </div>
                <div>
                  <h4 className="itinerary-tip-title">Transit Advice</h4>
                  <p className="itinerary-tip-desc">{trip_overview.transport_tip}</p>
                </div>
              </div>
            )}

            {trip_overview?.packing_advice?.length > 0 && (
              <div className="itinerary-tip-card">
                <div className="itinerary-tip-icon">
                  <Luggage size={18} style={{ color: "#a855f7" }} />
                </div>
                <div>
                  <h4 className="itinerary-tip-title">Packing Essentials</h4>
                  <div className="itinerary-packing-tags">
                    {trip_overview.packing_advice.map((item, idx) => (
                      <span key={idx} className="itinerary-packing-tag">{item}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Day-by-Day Section */}
        <div className="itinerary-days-list">
          {days.map((day) => {
            const isRegenerating = regeneratingDay === day.day_number;

            return (
              <article
                key={day.day_number}
                className={`glass-card itinerary-day-card ${isRegenerating ? "itinerary-day-card--loading" : ""}`}
                id={`day-card-${day.day_number}`}
              >
                {/* Day Card Header */}
                <div className="itinerary-day-header">
                  <div className="itinerary-day-meta">
                    <span className="itinerary-day-number-badge">Day {day.day_number}</span>
                    <span className="itinerary-day-date">{day.date}</span>
                    <h3 className="itinerary-day-theme">{day.theme}</h3>
                  </div>

                  <button
                    type="button"
                    className="btn-ghost itinerary-regen-btn"
                    disabled={isRegenerating}
                    onClick={() => handleRegenerateDay(day.day_number, day.date)}
                    title={`Regenerate Day ${day.day_number} with fresh activities`}
                  >
                    <RefreshCw size={14} className={isRegenerating ? "spin" : ""} />
                    {isRegenerating ? "Regenerating..." : "Regenerate Day"}
                  </button>
                </div>

                {/* Day Slots Grid */}
                <div className="itinerary-slots-grid">
                  {/* Morning */}
                  {day.morning && (
                    <div className="itinerary-slot-card">
                      <div className="itinerary-slot-header">
                        <span className="itinerary-slot-badge itinerary-slot-badge--morning">
                          <Sunrise size={14} /> Morning
                        </span>
                        {day.morning.cost_estimate_usd !== undefined && (
                          <span className="itinerary-slot-cost">
                            ~${day.morning.cost_estimate_usd}
                          </span>
                        )}
                      </div>
                      <h4 className="itinerary-slot-activity">{day.morning.activity}</h4>
                      <p className="itinerary-slot-location">
                        <MapPin size={13} /> {day.morning.location}
                      </p>
                      <p className="itinerary-slot-desc">{day.morning.description}</p>
                    </div>
                  )}

                  {/* Afternoon */}
                  {day.afternoon && (
                    <div className="itinerary-slot-card">
                      <div className="itinerary-slot-header">
                        <span className="itinerary-slot-badge itinerary-slot-badge--afternoon">
                          <Sun size={14} /> Afternoon
                        </span>
                        {day.afternoon.cost_estimate_usd !== undefined && (
                          <span className="itinerary-slot-cost">
                            ~${day.afternoon.cost_estimate_usd}
                          </span>
                        )}
                      </div>
                      <h4 className="itinerary-slot-activity">{day.afternoon.activity}</h4>
                      <p className="itinerary-slot-location">
                        <MapPin size={13} /> {day.afternoon.location}
                      </p>
                      <p className="itinerary-slot-desc">{day.afternoon.description}</p>
                    </div>
                  )}

                  {/* Evening */}
                  {day.evening && (
                    <div className="itinerary-slot-card">
                      <div className="itinerary-slot-header">
                        <span className="itinerary-slot-badge itinerary-slot-badge--evening">
                          <Moon size={14} /> Evening
                        </span>
                        {day.evening.cost_estimate_usd !== undefined && (
                          <span className="itinerary-slot-cost">
                            ~${day.evening.cost_estimate_usd}
                          </span>
                        )}
                      </div>
                      <h4 className="itinerary-slot-activity">{day.evening.activity}</h4>
                      <p className="itinerary-slot-location">
                        <MapPin size={13} /> {day.evening.location}
                      </p>
                      <p className="itinerary-slot-desc">{day.evening.description}</p>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="itinerary-bottom-actions">
          <button
            id="canvas-save-trip-bottom-btn"
            type="button"
            className="btn-gradient"
            onClick={handleSaveTrip}
            disabled={isSaving}
            style={{
              padding: "0.85rem 2.2rem",
              color: "#fff",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              background: savedTripId
                ? "linear-gradient(135deg, #10b981, #059669)"
                : undefined,
            }}
          >
            {isSaving ? (
              <>
                <RefreshCw size={16} className="spin" /> Saving...
              </>
            ) : savedTripId ? (
              <>
                <BookmarkCheck size={16} /> Trip Saved!
              </>
            ) : (
              <>
                <Bookmark size={16} /> Save Trip
              </>
            )}
          </button>
          <button
            type="button"
            className="btn-ghost"
            onClick={onReset || scrollToWizard}
            style={{
              padding: "0.85rem 2.2rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Sparkles size={16} /> Plan Another Trip
          </button>
        </div>
      </div>
    </section>
  );
}
