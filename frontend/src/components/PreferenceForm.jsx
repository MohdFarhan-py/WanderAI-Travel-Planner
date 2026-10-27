import { useState, useEffect } from "react";
import {
  MapPin, Calendar, DollarSign,
  ChevronRight, ChevronLeft, CheckCircle2,
  Wallet, Gem, Sparkles,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const BUDGET_OPTIONS = [
  { value: "Budget",   icon: Wallet,      label: "Budget",   sub: "Hostels, street food, transit",  color: "#06b6d4" },
  { value: "Moderate", icon: DollarSign,  label: "Moderate", sub: "Mid-range hotels & dining",      color: "#8b5cf6" },
  { value: "Luxury",   icon: Gem,         label: "Luxury",   sub: "5-star stays & fine dining",     color: "#f59e0b" },
];

const INTERESTS = [
  { label: "🏛️ Culture",    value: "Culture" },
  { label: "🍜 Food",       value: "Food" },
  { label: "🧗 Adventure",  value: "Adventure" },
  { label: "🌿 Nature",     value: "Nature" },
  { label: "🛌 Relaxation", value: "Relaxation" },
  { label: "🛍️ Shopping",   value: "Shopping" },
  { label: "🌃 Nightlife",  value: "Nightlife" },
  { label: "🏺 History",    value: "History" },
  { label: "⚽ Sports",     value: "Sports" },
];

const TRAVEL_STYLES = [
  { value: "Solo",    emoji: "🧍", label: "Solo" },
  { value: "Couple",  emoji: "👫", label: "Couple" },
  { value: "Friends", emoji: "👯", label: "Friends" },
  { value: "Family",  emoji: "👨‍👩‍👧‍👦", label: "Family" },
];

const PACE_OPTIONS = [
  { value: "Relaxed",    label: "Relaxed",    sub: "Slow mornings, fewer stops" },
  { value: "Balanced",   label: "Balanced",   sub: "Mix of activities & rest" },
  { value: "Fast-Paced", label: "Fast-Paced", sub: "Max sights every day" },
];

const STEP_LABELS = ["Destination", "Budget", "Interests", "Travel Style"];

const LOADING_MESSAGES = [
  "✈️  Consulting local travel experts...",
  "🗺️  Crafting your personalised route...",
  "🍽️  Researching the best dining spots...",
  "🏛️  Discovering hidden cultural gems...",
  "🌅  Planning sunrise-to-sunset adventures...",
  "💡  Tailoring activities to your interests...",
  "📅  Finalising your day-by-day schedule...",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const today = new Date().toISOString().split("T")[0];

function getMinEndDate(startDate) {
  if (!startDate) return today;
  const d = new Date(startDate);
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

// ─── Step components ──────────────────────────────────────────────────────────

function StepDestination({ form, setField, errors }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <h3 className="step-title">Where are you headed?</h3>
      <div className="pf-field">
        <label className="pf-label" htmlFor="pf-destination"><MapPin size={15} /> Destination</label>
        <input id="pf-destination" className={`pf-input${errors.destination ? " pf-input--error" : ""}`}
          type="text" placeholder="e.g. Paris, Tokyo, Bali…" value={form.destination}
          onChange={e => setField("destination", e.target.value)} autoComplete="off" />
        {errors.destination && <span className="pf-error">{errors.destination}</span>}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div className="pf-field">
          <label className="pf-label" htmlFor="pf-start-date"><Calendar size={15} /> Start Date</label>
          <input id="pf-start-date" className={`pf-input${errors.start_date ? " pf-input--error" : ""}`}
            type="date" min={today} value={form.start_date}
            onChange={e => setField("start_date", e.target.value)} />
          {errors.start_date && <span className="pf-error">{errors.start_date}</span>}
        </div>
        <div className="pf-field">
          <label className="pf-label" htmlFor="pf-end-date"><Calendar size={15} /> End Date</label>
          <input id="pf-end-date" className={`pf-input${errors.end_date ? " pf-input--error" : ""}`}
            type="date" min={getMinEndDate(form.start_date)} value={form.end_date}
            onChange={e => setField("end_date", e.target.value)} />
          {errors.end_date && <span className="pf-error">{errors.end_date}</span>}
        </div>
      </div>
    </div>
  );
}

function StepBudget({ form, setField }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <h3 className="step-title">What is your budget level?</h3>
      <div style={{ display: "grid", gap: "0.85rem" }}>
        {BUDGET_OPTIONS.map(({ value, icon: Icon, label, sub, color }) => {
          const selected = form.budget === value;
          return (
            <button key={value} id={`pf-budget-${value.toLowerCase()}`} type="button"
              className={`pf-option-card${selected ? " pf-option-card--selected" : ""}`}
              onClick={() => setField("budget", value)}>
              <div className="pf-option-icon" style={{ background: `${color}22`, border: `1px solid ${color}44` }}>
                <Icon size={20} style={{ color }} />
              </div>
              <div style={{ textAlign: "left" }}>
                <div className="pf-option-label">{label}</div>
                <div className="pf-option-sub">{sub}</div>
              </div>
              {selected && <CheckCircle2 size={18} style={{ color, marginLeft: "auto", flexShrink: 0 }} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepInterests({ form, setField, errors }) {
  const toggle = (val) => {
    const next = form.interests.includes(val)
      ? form.interests.filter(i => i !== val)
      : [...form.interests, val];
    setField("interests", next);
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <h3 className="step-title">What are your interests?</h3>
      <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem", marginTop: "-0.75rem" }}>
        Select all that apply — the more you pick, the better your itinerary.
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.65rem" }}>
        {INTERESTS.map(({ label, value }) => (
          <button key={value} id={`pf-interest-${value.toLowerCase()}`} type="button"
            className={`pf-chip${form.interests.includes(value) ? " pf-chip--active" : ""}`}
            onClick={() => toggle(value)} aria-pressed={form.interests.includes(value)}>
            {label}
          </button>
        ))}
      </div>
      {errors.interests && <span className="pf-error">{errors.interests}</span>}
    </div>
  );
}

function StepTravelStyle({ form, setField }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div>
        <h3 className="step-title">Who is travelling?</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "0.75rem", marginTop: "1rem" }}>
          {TRAVEL_STYLES.map(({ value, emoji, label }) => (
            <button key={value} id={`pf-style-${value.toLowerCase()}`} type="button"
              className={`pf-style-card${form.travel_style === value ? " pf-style-card--selected" : ""}`}
              onClick={() => setField("travel_style", value)}>
              <span style={{ fontSize: "1.75rem", lineHeight: 1 }}>{emoji}</span>
              <span className="pf-option-label" style={{ marginTop: "0.4rem" }}>{label}</span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <h3 className="step-title">What travel pace suits you?</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem", marginTop: "1rem" }}>
          {PACE_OPTIONS.map(({ value, label, sub }) => (
            <button key={value} id={`pf-pace-${value.toLowerCase().replace("-","")}`} type="button"
              className={`pf-option-card${form.pace === value ? " pf-option-card--selected" : ""}`}
              onClick={() => setField("pace", value)}>
              <div style={{ textAlign: "left" }}>
                <div className="pf-option-label">{label}</div>
                <div className="pf-option-sub">{sub}</div>
              </div>
              {form.pace === value && <CheckCircle2 size={18} style={{ color: "#6366f1", marginLeft: "auto", flexShrink: 0 }} />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Animated Loading Screen ──────────────────────────────────────────────────

function LoadingScreen() {
  const [msgIndex, setMsgIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setMsgIndex(i => (i + 1) % LOADING_MESSAGES.length), 2200);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="pf-loading glass-card" id="pf-loading-screen">
      <div className="pf-loading-orb">
        <div className="pf-loading-ring" />
        <Sparkles size={28} style={{ color: "#a5b4fc", position: "relative", zIndex: 1 }} />
      </div>
      <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", fontWeight: 800 }}>
        Building Your Itinerary
      </h3>
      <p className="pf-loading-msg" key={msgIndex}>{LOADING_MESSAGES[msgIndex]}</p>
      <div className="pf-loading-dots">
        <span /><span /><span />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const INITIAL_FORM = {
  destination: "", start_date: "", end_date: "",
  budget: "Moderate", travel_style: "Solo", interests: [], pace: "Balanced",
};

function validate(step, form) {
  const errors = {};
  if (step === 0) {
    if (!form.destination.trim()) errors.destination = "Please enter a destination.";
    if (!form.start_date) errors.start_date = "Please choose a start date.";
    if (!form.end_date) errors.end_date = "Please choose an end date.";
    if (form.start_date && form.end_date && form.end_date <= form.start_date)
      errors.end_date = "End date must be after start date.";
  }
  if (step === 2 && form.interests.length === 0)
    errors.interests = "Select at least one interest.";
  return errors;
}

export default function PreferenceForm({ onItineraryGenerated }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const setField = (key, val) => {
    setForm(prev => ({ ...prev, [key]: val }));
    setErrors(prev => ({ ...prev, [key]: undefined }));
  };

  const goNext = () => {
    const errs = validate(step, form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setStep(s => s + 1);
  };

  const goBack = () => { setErrors({}); setStep(s => s - 1); };

  const handleSubmit = async () => {
    const errs = validate(step, form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setApiError("");
    try {
      const res = await fetch("http://localhost:8000/api/generate-itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setLoading(false);
      // Lift itinerary + preferences up to App.jsx
      if (onItineraryGenerated) {
        onItineraryGenerated(data.itinerary, data.preferences);
      }
    } catch (err) {
      setApiError(err.message);
      setLoading(false);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="pf-wrapper" id="preference-form-wizard">
      {/* Step progress */}
      <div className="pf-stepper" aria-label="Form progress">
        {STEP_LABELS.map((label, i) => (
          <div key={label} className={`pf-step${i === step ? " pf-step--active" : i < step ? " pf-step--done" : ""}`}>
            <div className="pf-step-dot">{i < step ? <CheckCircle2 size={14} /> : i + 1}</div>
            <span className="pf-step-label">{label}</span>
          </div>
        ))}
        <div className="pf-step-track" aria-hidden="true">
          <div className="pf-step-fill" style={{ width: `${(step / (STEP_LABELS.length - 1)) * 100}%` }} />
        </div>
      </div>

      {/* Step content */}
      <div className="pf-body glass-card">
        {step === 0 && <StepDestination form={form} setField={setField} errors={errors} />}
        {step === 1 && <StepBudget      form={form} setField={setField} errors={errors} />}
        {step === 2 && <StepInterests   form={form} setField={setField} errors={errors} />}
        {step === 3 && <StepTravelStyle form={form} setField={setField} errors={errors} />}

        {apiError && <div className="pf-api-error" role="alert">{apiError}</div>}

        <div className="pf-nav" style={{ marginTop: "2rem" }}>
          {step > 0
            ? <button id="pf-back-btn" type="button" className="btn-ghost" onClick={goBack}
                style={{ padding: "0.7rem 1.5rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <ChevronLeft size={16} /> Back
              </button>
            : <div />}

          {step < 3
            ? <button id="pf-next-btn" type="button" className="btn-gradient" onClick={goNext}
                style={{ padding: "0.7rem 1.75rem", color: "#fff", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                Next <ChevronRight size={16} />
              </button>
            : <button id="pf-submit-btn" type="button" className="btn-gradient" onClick={handleSubmit}
                style={{ padding: "0.7rem 1.75rem", color: "#fff", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Sparkles size={16} /> Generate Itinerary
              </button>}
        </div>
      </div>
    </div>
  );
}
