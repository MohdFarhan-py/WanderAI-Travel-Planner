"""
gemini_service.py
Wraps Google GenAI SDK calls for itinerary generation and single-day regeneration.
"""

import os
import json
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

# ── SDK client (singleton) ────────────────────────────────────────────────────
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
_client = genai.Client(api_key=GEMINI_API_KEY)

MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")
FALLBACK_MODEL = "gemini-1.5-flash"

# ── JSON Schema (injected into the prompt so the model follows it exactly) ────
ITINERARY_SCHEMA = """{
  "trip_overview": {
    "destination": "<string>",
    "total_days": <integer>,
    "summary": "<2-3 sentence overview>",
    "packing_advice": ["<item>", "..."],
    "transport_tip": "<string>"
  },
  "days": [
    {
      "day_number": <integer starting at 1>,
      "date": "<YYYY-MM-DD>",
      "theme": "<catchy theme title>",
      "morning": {
        "activity": "<name>",
        "location": "<venue / area>",
        "description": "<2-3 sentences>",
        "cost_estimate_usd": <number>
      },
      "afternoon": {
        "activity": "<name>",
        "location": "<venue / area>",
        "description": "<2-3 sentences>",
        "cost_estimate_usd": <number>
      },
      "evening": {
        "activity": "<name>",
        "location": "<venue / area>",
        "description": "<2-3 sentences>",
        "cost_estimate_usd": <number>
      }
    }
  ],
  "estimated_total_cost_usd": <number>
}"""


def _build_generate_prompt(pref: dict) -> str:
    interests = ", ".join(pref.get("interests", []))
    return f"""You are an expert AI travel planner. Generate a detailed, realistic, and exciting travel itinerary.

TRIP PREFERENCES:
- Destination: {pref["destination"]}
- Travel dates: {pref["start_date"]} to {pref["end_date"]} ({pref.get("total_days", "?")} days)
- Budget level: {pref["budget"]}
- Travel style: {pref["travel_style"]}
- Interests: {interests}
- Preferred pace: {pref["pace"]}

INSTRUCTIONS:
- Create exactly one entry per day from start_date to end_date
- Each day must have a unique, creative theme (e.g. "Ancient Temples & Street Food")
- Tailor all activities to the budget level:
  * Budget: free/cheap attractions, street food, public transit
  * Moderate: mid-range restaurants, some paid attractions, occasional taxi
  * Luxury: premium experiences, fine dining, private transfers
- Match activities to the traveler's interests: {interests}
- Adjust pace: Relaxed (2-3 activities/day), Balanced (3-4), Fast-Paced (4-5 packed slots)
- All cost estimates must be realistic USD amounts per person
- Return ONLY valid JSON matching this exact schema, no markdown, no extra text:

{ITINERARY_SCHEMA}"""


def _build_regenerate_prompt(
    destination: str,
    day_number: int,
    date: str,
    preferences: dict,
    existing_days_context: list,
) -> str:
    interests = ", ".join(preferences.get("interests", []))
    existing = json.dumps(
        [{"day_number": d["day_number"], "theme": d["theme"]} for d in existing_days_context],
        indent=2,
    )
    return f"""You are an expert AI travel planner. Regenerate Day {day_number} of a trip to {destination}.

TRIP PREFERENCES:
- Budget: {preferences.get("budget", "Moderate")}
- Travel style: {preferences.get("travel_style", "Solo")}
- Interests: {interests}
- Pace: {preferences.get("pace", "Balanced")}

DATE: {date}

OTHER DAYS ALREADY PLANNED (avoid repeating these themes/locations):
{existing}

INSTRUCTIONS:
- Create a completely fresh set of activities different from the existing days
- Keep the same budget and interest constraints
- Return ONLY a valid JSON object matching this schema for a single day, no markdown:

{{
  "day_number": {day_number},
  "date": "{date}",
  "theme": "<new catchy theme>",
  "morning": {{
    "activity": "<name>",
    "location": "<venue / area>",
    "description": "<2-3 sentences>",
    "cost_estimate_usd": <number>
  }},
  "afternoon": {{
    "activity": "<name>",
    "location": "<venue / area>",
    "description": "<2-3 sentences>",
    "cost_estimate_usd": <number>
  }},
  "evening": {{
    "activity": "<name>",
    "location": "<venue / area>",
    "description": "<2-3 sentences>",
    "cost_estimate_usd": <number>
  }}
}}"""


# ── Public API ────────────────────────────────────────────────────────────────

def generate_itinerary(preference_data: dict) -> dict:
    """
    Calls Gemini with structured JSON output mode and returns the parsed
    itinerary dict. Raises ValueError on JSON parse failure.
    """
    prompt = _build_generate_prompt(preference_data)

    models_to_try = [MODEL, FALLBACK_MODEL, "gemini-3.5-flash-lite"]
    seen = set()
    candidate_models = [m for m in models_to_try if m and not (m in seen or seen.add(m))]

    response = None
    last_error = None

    for model_name in candidate_models:
        try:
            response = _client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.8,
                ),
            )
            break
        except Exception as e:
            print(f'Gemini Generation Error: {e}')
            last_error = e

    if response is None:
        raise last_error

    raw = response.text.strip()
    # Strip any accidental markdown fences the model may still add
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip()

    try:
        return json.loads(raw)
    except json.JSONDecodeError as e:
        raise ValueError(f"Gemini returned invalid JSON: {e}\n\nRaw response:\n{raw[:500]}")


def regenerate_day(
    destination: str,
    day_number: int,
    date: str,
    preferences: dict,
    existing_days_context: list,
) -> dict:
    """
    Regenerates a single day plan avoiding themes already used.
    Returns a single day dict.
    """
    prompt = _build_regenerate_prompt(
        destination, day_number, date, preferences, existing_days_context
    )

    models_to_try = [MODEL, FALLBACK_MODEL, "gemini-3.5-flash-lite"]
    seen = set()
    candidate_models = [m for m in models_to_try if m and not (m in seen or seen.add(m))]

    response = None
    last_error = None

    for model_name in candidate_models:
        try:
            response = _client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=1.0,
                ),
            )
            break
        except Exception as e:
            print(f'Gemini Generation Error: {e}')
            last_error = e

    if response is None:
        raise last_error

    raw = response.text.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip()

    try:
        return json.loads(raw)
    except json.JSONDecodeError as e:
        raise ValueError(f"Gemini returned invalid JSON for day regeneration: {e}")
