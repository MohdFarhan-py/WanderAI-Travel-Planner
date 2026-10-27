from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator
from dotenv import load_dotenv
from datetime import date
from typing import Literal, Any, Optional
import os
from db import supabase
from services.gemini_service import generate_itinerary, regenerate_day

load_dotenv()

app = FastAPI(
    title="AI Travel Itinerary Planner API",
    description="Backend API for the AI-powered personalized travel itinerary planner.",
    version="1.0.0",
)

# CORS Middleware - allows Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────
# Pydantic Schemas
# ─────────────────────────────────────────

VALID_INTERESTS = {
    "Culture", "Food", "Adventure", "Nature",
    "Relaxation", "Shopping", "Nightlife", "History", "Sports",
}


class TripPreferenceRequest(BaseModel):
    destination: str
    start_date: str   # ISO 8601 format: YYYY-MM-DD
    end_date: str     # ISO 8601 format: YYYY-MM-DD
    budget: Literal["Budget", "Moderate", "Luxury"]
    travel_style: Literal["Solo", "Couple", "Family", "Friends"]
    interests: list[str]
    pace: Literal["Relaxed", "Balanced", "Fast-Paced"]

    @field_validator("destination")
    @classmethod
    def destination_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Destination cannot be empty.")
        return v

    @field_validator("interests")
    @classmethod
    def interests_valid(cls, v: list[str]) -> list[str]:
        if not v:
            raise ValueError("Select at least one interest.")
        invalid = [i for i in v if i not in VALID_INTERESTS]
        if invalid:
            raise ValueError(f"Invalid interests: {invalid}")
        return v

    @field_validator("end_date")
    @classmethod
    def end_after_start(cls, v: str, info) -> str:
        start = info.data.get("start_date")
        if start and v <= start:
            raise ValueError("end_date must be after start_date.")
        return v


# ─────────────────────────────────────────
# Endpoints
# ─────────────────────────────────────────

@app.get("/", tags=["Health"])
async def root():
    return {"message": "AI Travel Itinerary Planner API is running"}


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok"}


@app.get("/api/db-check", tags=["Database"])
async def db_check():
    """
    Verifies the backend can reach Supabase by querying the itineraries table.
    Returns the number of rows currently stored.
    """
    try:
        response = supabase.table("itineraries").select("*", count="exact").execute()
        row_count = response.count if response.count is not None else len(response.data)
        return {"status": "connected", "count": row_count}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Database connection failed: {exc}")


@app.post("/api/preferences", tags=["Preferences"], status_code=202)
async def save_preferences(payload: TripPreferenceRequest):
    """
    Validates travel preferences submitted from the wizard form.
    Calculates trip duration and returns an acknowledgment with a summary.
    """
    try:
        start = date.fromisoformat(payload.start_date)
        end   = date.fromisoformat(payload.end_date)
    except ValueError:
        raise HTTPException(status_code=422, detail="Dates must be in YYYY-MM-DD format.")

    total_days = (end - start).days

    return {
        "status": "received",
        "message": f"Preferences saved! Your {total_days}-day trip to {payload.destination} is being planned.",
        "summary": {
            "destination":   payload.destination,
            "start_date":    payload.start_date,
            "end_date":      payload.end_date,
            "total_days":    total_days,
            "budget":        payload.budget,
            "travel_style":  payload.travel_style,
            "interests":     payload.interests,
            "pace":          payload.pace,
        },
    }


# ─────────────────────────────────────────
# AI Generation Schemas
# ─────────────────────────────────────────

class RegenerateDayRequest(BaseModel):
    destination: str
    day_number: int
    date: str
    preferences: dict[str, Any]
    existing_days_context: list[dict[str, Any]]


# ─────────────────────────────────────────
# AI Generation Endpoints
# ─────────────────────────────────────────

@app.post("/api/generate-itinerary", tags=["AI"])
async def generate_itinerary_endpoint(payload: TripPreferenceRequest):
    """
    Accepts trip preferences, injects total_days, and calls Gemini to
    generate a full day-by-day itinerary in structured JSON.
    """
    try:
        start = date.fromisoformat(payload.start_date)
        end   = date.fromisoformat(payload.end_date)
    except ValueError:
        raise HTTPException(status_code=422, detail="Dates must be in YYYY-MM-DD format.")

    total_days = (end - start).days

    pref_data = {
        "destination":  payload.destination,
        "start_date":   payload.start_date,
        "end_date":     payload.end_date,
        "total_days":   total_days,
        "budget":       payload.budget,
        "travel_style": payload.travel_style,
        "interests":    payload.interests,
        "pace":         payload.pace,
    }

    try:
        itinerary = generate_itinerary(pref_data)
    except ValueError as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Gemini API error: {exc}")

    return {"status": "generated", "itinerary": itinerary, "preferences": pref_data}


@app.post("/api/regenerate-day", tags=["AI"])
async def regenerate_day_endpoint(payload: RegenerateDayRequest):
    """
    Regenerates a single day's plan with fresh activities,
    using other days as context to avoid repetition.
    """
    try:
        new_day = regenerate_day(
            destination=payload.destination,
            day_number=payload.day_number,
            date=payload.date,
            preferences=payload.preferences,
            existing_days_context=payload.existing_days_context,
        )
    except ValueError as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Gemini API error: {exc}")

    return {"status": "regenerated", "day": new_day}


# ─────────────────────────────────────────
# Itinerary Persistence Schemas & Endpoints
# ─────────────────────────────────────────

class SaveItineraryRequest(BaseModel):
    destination: str
    start_date: str
    end_date: str
    total_days: int
    total_budget_est: Optional[float] = 0.0
    itinerary_data: dict[str, Any]


@app.post("/api/itineraries/save", tags=["Itineraries"])
async def save_itinerary_endpoint(payload: SaveItineraryRequest):
    """
    Accepts payload: destination, start_date, end_date, total_days, total_budget_est, and itinerary_data (JSON).
    Inserts the trip into the Supabase itineraries table via db.py.
    Returns { status: "saved", id: "<trip-uuid>" }.
    """
    try:
        row = {
            "destination": payload.destination,
            "start_date": payload.start_date,
            "end_date": payload.end_date,
            "total_days": payload.total_days,
            "total_budget_est": payload.total_budget_est,
            "itinerary_data": payload.itinerary_data,
        }
        res = supabase.table("itineraries").insert(row).execute()
        if not res.data or len(res.data) == 0:
            raise HTTPException(status_code=500, detail="Database insert returned no data.")
        saved_id = str(res.data[0]["id"])
        return {"status": "saved", "id": saved_id}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to save itinerary: {exc}")


@app.get("/api/itineraries", tags=["Itineraries"])
async def get_all_itineraries_endpoint():
    """
    Fetches all saved trips (ordered by created_at descending) from Supabase.
    """
    try:
        res = (
            supabase.table("itineraries")
            .select("*")
            .order("created_at", desc=True)
            .execute()
        )
        trips = res.data or []
        return {"status": "success", "itineraries": trips, "data": trips}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to fetch itineraries: {exc}")


@app.get("/api/itineraries/{trip_id}", tags=["Itineraries"])
async def get_itinerary_by_id_endpoint(trip_id: str):
    """
    Fetches a specific trip by its UUID to allow viewing past itineraries.
    """
    try:
        res = supabase.table("itineraries").select("*").eq("id", trip_id).execute()
        if not res.data or len(res.data) == 0:
            raise HTTPException(status_code=404, detail="Itinerary not found.")
        trip = res.data[0]
        return {"status": "success", "itinerary": trip, **trip}
    except HTTPException:
        raise
    except Exception as exc:
        if "invalid input syntax for type uuid" in str(exc).lower():
            raise HTTPException(status_code=404, detail="Itinerary not found (invalid UUID).")
        raise HTTPException(status_code=500, detail=f"Failed to fetch itinerary: {exc}")

