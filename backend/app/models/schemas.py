from pydantic import BaseModel, Field
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


class TtsRequest(BaseModel):
    """Text-to-speech via Khaya (en, tw, ee, ga)."""

    # Full message body for listen; Khaya may enforce its own limits.
    text: str = Field(..., min_length=1, max_length=200_000)
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
    # Canonical English (before Twi/Ewe/Ga translate-back) — for client-side re-translation in session
    answer_english: str
    action_steps_english: list[str]
    disclaimer_english: str = "This is guidance, not legal advice. Consult a qualified lawyer for legal matters."


class TranslateReplyRequest(BaseModel):
    answer_english: str
    action_steps_english: list[str] = []
    disclaimer_english: str = "This is guidance, not legal advice. Consult a qualified lawyer for legal matters."
    target: Language


class TranslateReplyResponse(BaseModel):
    answer: str
    action_steps: list[str]
    disclaimer: str


class TranslateTextRequest(BaseModel):
    """Translate a single user-authored string (e.g. show same question in another language)."""

    text: str
    source: Language
    target: Language


class TranslateTextResponse(BaseModel):
    text: str


class CrisisResponse(BaseModel):
    scenario: CrisisScenario
    title: str
    rights: list[RightItem]
    actions: list[str]
    emergency_contacts: list[EmergencyContact]


class RagStatsPaths(BaseModel):
    constitution_json: str
    faiss_index: str
    faiss_metadata: str


class RagStatsMtimes(BaseModel):
    constitution_json: str | None = None
    faiss_index: str | None = None
    faiss_metadata: str | None = None


class RagStatsRetrieval(BaseModel):
    RAG_TOP_K: int
    RAG_TOP_K_PER_QUERY: int
    RAG_HYBRID: bool
    RAG_RETRIEVAL_POOL: int
    RAG_RRF_K: int


class RagStatsResponse(BaseModel):
    """Diagnostics for the local MiniLM + FAISS index (after ingest + --build)."""

    embedding_model: str
    chunks_loaded_in_memory: int | None = None
    chunks_in_faiss_metadata: int | None = None
    constitution_json_exists: bool
    paths: RagStatsPaths
    mtimes_utc: RagStatsMtimes
    retrieval: RagStatsRetrieval
