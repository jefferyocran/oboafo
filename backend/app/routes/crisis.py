import json
from pathlib import Path
from fastapi import APIRouter, HTTPException
from app.models.schemas import CrisisRequest, CrisisResponse, RightItem, EmergencyContact

router = APIRouter()

# Load crisis data once at startup
_DATA_PATH = Path(__file__).parent.parent.parent / "data" / "crisis_responses.json"

try:
    with open(_DATA_PATH, "r", encoding="utf-8") as f:
        _CRISIS_DATA: dict = json.load(f)
except FileNotFoundError:
    _CRISIS_DATA = {}


@router.post("/crisis", response_model=CrisisResponse)
async def get_crisis_response(request: CrisisRequest) -> CrisisResponse:
    """
    Instant, hard-coded crisis response — no LLM, no Khaya call.
    Pure JSON lookup — works even if all external APIs are down.

    Returns pre-translated responses for EN/TW/EE/GA.
    Falls back to English if the requested language is unavailable.
    """
    scenario_key = request.scenario.value
    language_key = request.language.value

    scenario_data = _CRISIS_DATA.get(scenario_key)
    if not scenario_data:
        raise HTTPException(status_code=404, detail=f"Crisis scenario '{scenario_key}' not found")

    # Try requested language, fall back to English
    lang_data = scenario_data.get(language_key) or scenario_data.get("en")
    if not lang_data:
        raise HTTPException(status_code=404, detail=f"No data for scenario '{scenario_key}'")

    return CrisisResponse(
        scenario=request.scenario,
        title=lang_data["title"],
        rights=[RightItem(**r) for r in lang_data["rights"]],
        actions=lang_data["actions"],
        emergency_contacts=[EmergencyContact(**c) for c in lang_data["emergency_contacts"]],
    )
