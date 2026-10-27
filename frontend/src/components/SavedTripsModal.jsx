import { useState, useEffect, useCallback } from "react";
import {
  X,
  Luggage,
  Calendar,
  DollarSign,
  Clock,
  Sparkles,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  MapPin,
  Compass
} from "lucide-react";

export default function SavedTripsModal({ isOpen, onClose, onSelectTrip }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refreshTrips = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:8000/api/itineraries");
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to load saved trips");
      }
      const loadedTrips = Array.isArray(data) ? data : (data.itineraries || data.data || []);
      setTrips(loadedTrips);
    } catch (err) {
      setError(err.message || "Failed to load saved trips. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    if (isOpen) {
      queueMicrotask(() => {
        if (!ignore) {
          setLoading(true);
          setError("");
        }
      });
      fetch("http://localhost:8000/api/itineraries")
        .then((res) => {
          if (!res.ok) throw new Error("Failed to load saved trips");
          return res.json();
        })
        .then((data) => {
          if (!ignore) {
            const loadedTrips = Array.isArray(data) ? data : (data.itineraries || data.data || []);
            setTrips(loadedTrips);
            setLoading(false);
          }
        })
        .catch((err) => {
          if (!ignore) {
            setError(err.message || "Failed to load saved trips. Please try again.");
            setLoading(false);
          }
        });
    }
    return () => {
      ignore = true;
    };
  }, [isOpen]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const formatDateRange = (start, end) => {
    if (!start && !end) return "Flexible dates";
    try {
      const s = start ? new Date(start).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";
      const e = end ? new Date(end).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";
      return s && e ? `${s} – ${e}` : s || e;
    } catch {
      return `${start} - ${end}`;
    }
  };

  const formatSavedAt = (isoString) => {
    if (!isoString) return "";
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return "";
    }
  };

  return (
    <div
      className="saved-trips-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="saved-trips-title"
    >
      <div
        className="saved-trips-drawer glass-card"
        onClick={(e) => e.stopPropagation()}
        id="saved-trips-drawer-panel"
      >
        {/* Drawer Header */}
        <div className="saved-trips-header">
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <div className="saved-trips-header-icon">
              <Compass size={20} style={{ color: "#6366f1" }} />
            </div>
            <div>
              <h3 id="saved-trips-title" className="saved-trips-title">
                My Saved Trips
              </h3>
              <p className="saved-trips-subtitle">
                {trips.length} {trips.length === 1 ? "journey" : "journeys"} saved in Supabase
              </p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <button
              id="refresh-saved-trips-btn"
              type="button"
              className="btn-ghost saved-trips-icon-btn"
              onClick={refreshTrips}
              title="Refresh saved trips"
              disabled={loading}
              aria-label="Refresh trips"
            >
              <RefreshCw size={16} className={loading ? "spin" : ""} />
            </button>
            <button
              id="close-saved-trips-btn"
              type="button"
              className="btn-ghost saved-trips-icon-btn"
              onClick={onClose}
              title="Close drawer"
              aria-label="Close saved trips drawer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Drawer Content */}
        <div className="saved-trips-body">
          {loading && trips.length === 0 && (
            <div className="saved-trips-state">
              <RefreshCw size={28} className="spin" style={{ color: "#6366f1" }} />
              <p style={{ marginTop: "0.75rem", color: "var(--color-text-secondary)", fontSize: "0.9rem" }}>
                Fetching your saved itineraries...
              </p>
            </div>
          )}

          {error && (
            <div className="saved-trips-error">
              <AlertCircle size={20} />
              <div style={{ flex: 1, fontSize: "0.85rem" }}>{error}</div>
              <button
                type="button"
                className="btn-ghost"
                onClick={refreshTrips}
                style={{ fontSize: "0.75rem", padding: "0.3rem 0.6rem" }}
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && trips.length === 0 && (
            <div className="saved-trips-empty">
              <div className="saved-trips-empty-icon">
                <Luggage size={36} strokeWidth={1.5} style={{ color: "#6366f1" }} />
              </div>
              <h4 style={{ fontWeight: 600, fontSize: "1.05rem", color: "#f1f5f9" }}>
                No saved trips yet
              </h4>
              <p style={{ fontSize: "0.88rem", color: "var(--color-text-secondary)", maxWidth: "28ch", lineHeight: 1.5 }}>
                Generate a trip on the canvas and click &ldquo;Save Trip&rdquo; to store it permanently in the cloud.
              </p>
              <button
                id="empty-start-planning-btn"
                type="button"
                className="btn-gradient"
                onClick={() => {
                  onClose();
                  const el = document.getElementById("how-it-works");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                style={{
                  marginTop: "0.5rem",
                  padding: "0.6rem 1.4rem",
                  fontSize: "0.85rem",
                  color: "#fff",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem"
                }}
              >
                <Sparkles size={14} /> Start Planning
              </button>
            </div>
          )}

          {!loading && trips.length > 0 && (
            <div className="saved-trips-list">
              {trips.map((trip) => {
                const totalCost = trip.total_budget_est || trip.itinerary_data?.estimated_total_cost_usd;
                const totalDays = trip.total_days || trip.itinerary_data?.trip_overview?.total_days || trip.itinerary_data?.days?.length;
                const formattedDate = formatSavedAt(trip.created_at);

                return (
                  <article
                    key={trip.id}
                    id={`saved-trip-item-${trip.id}`}
                    className="saved-trip-card"
                    onClick={() => onSelectTrip(trip)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSelectTrip(trip);
                      }
                    }}
                    aria-label={`Load itinerary for ${trip.destination}`}
                  >
                    <div className="saved-trip-card-header">
                      <div className="saved-trip-dest-wrapper">
                        <MapPin size={16} style={{ color: "#6366f1", flexShrink: 0 }} />
                        <h4 className="saved-trip-destination">{trip.destination}</h4>
                      </div>
                      {formattedDate && (
                        <span className="saved-trip-date-saved" title={`Saved on ${trip.created_at}`}>
                          <Clock size={12} /> {formattedDate}
                        </span>
                      )}
                    </div>

                    <div className="saved-trip-date-range">
                      <Calendar size={13} />
                      <span>{formatDateRange(trip.start_date, trip.end_date)}</span>
                    </div>

                    <div className="saved-trip-badges">
                      {totalDays && (
                        <span className="saved-trip-badge">
                          {totalDays} {totalDays === 1 ? "Day" : "Days"}
                        </span>
                      )}
                      {totalCost ? (
                        <span className="saved-trip-badge saved-trip-badge--cost">
                          <DollarSign size={12} /> Approx. ${totalCost} USD
                        </span>
                      ) : null}
                    </div>

                    <div className="saved-trip-card-footer">
                      <span className="saved-trip-load-prompt">
                        Click to view itinerary
                      </span>
                      <span className="saved-trip-arrow-btn">
                        Load Plan <ArrowRight size={14} />
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
