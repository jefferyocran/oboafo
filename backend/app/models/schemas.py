from pydantic import BaseModel
from typing import Literal
from enum import Enum


class Language(str, Enum):
    EN = "en"
    TW = "tw"
    EE = "ee"
    GA = "ga"


class CrisisScenario(str, Enum):
    ARRESTED = "arrested"
    POLICE_STOP = "police_stop"
    LANDLORD = "landlord"
    EMPLOYER = "employer"


# --- Request models ---

class AskRequest(BaseModel):
    message: str
    language: Language = Language.EN


class CrisisRequest(BaseModel):
    scenario: CrisisScenario
    language: Language = Language.EN


# --- Response models ---

class RightItem(BaseModel):
    text: str
    article: str


class EmergencyContact(BaseModel):
    name: str
    phone: str


class AskResponse(BaseModel):
    answer: str
    articles_cited: list[str]
    action_steps: list[str]
    disclaimer: str = "This is guidance, not legal advice. Consult a qualified lawyer for legal matters."


class CrisisResponse(BaseModel):
    scenario: CrisisScenario
    title: str
    rights: list[RightItem]
    actions: list[str]
    emergency_contacts: list[EmergencyContact]
