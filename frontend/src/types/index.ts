// Language codes supported by the app
export type Language = 'en' | 'tw' | 'ee' | 'ga' | 'dag'

export const LANGUAGE_LABELS: Record<Language, string> = {
  en: 'English',
  tw: 'Twi',
  ee: 'Ewe',
  ga: 'Ga',
  dag: 'Dagbani',
}

export const LANGUAGES: Language[] = ['en', 'tw', 'ee', 'ga', 'dag']

// Crisis scenario IDs
export type CrisisScenario = 'arrested' | 'police_stop' | 'landlord' | 'employer'

// Chat request/response
export interface AskRequest {
  message: string
  language: Language
}

export interface AskResponse {
  answer: string
  articles_cited: string[]
  action_steps: string[]
  disclaimer: string
  answer_english: string
  action_steps_english: string[]
  disclaimer_english: string
}

/** Result of POST /api/ask — supports parallel calls without shared loading state */
export type AskResult =
  | { ok: true; data: AskResponse }
  | { ok: false; error: string; status?: number }

/** Languages Khaya can translate for assistant replies (API-backed) */
export type TranslateReplyLanguage = 'en' | 'tw' | 'ee' | 'ga' | 'dag'

export interface TranslateReplyRequest {
  answer_english: string
  action_steps_english: string[]
  disclaimer_english: string
  target: TranslateReplyLanguage
}

export interface TranslateReplyResponse {
  answer: string
  action_steps: string[]
  disclaimer: string
}

export interface TranslateTextRequest {
  text: string
  source: TranslateReplyLanguage
  target: TranslateReplyLanguage
}

export interface TranslateTextResponse {
  text: string
}

// Crisis request/response
export interface CrisisRequest {
  scenario: CrisisScenario
  language: Language
}

export interface RightItem {
  text: string
  article: string
}

export interface EmergencyContact {
  name: string
  phone: string
}

export interface CrisisResponse {
  scenario: CrisisScenario
  title: string
  rights: RightItem[]
  actions: string[]
  emergency_contacts: EmergencyContact[]
}

// Chat message for UI
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  articles?: string[]
  timestamp: Date
  isLoading?: boolean
  /** Language the user had selected when they sent this (user messages) */
  inputLanguage?: Language
  /** Stored English reply for assistant messages — enables in-session re-translation */
  canonical?: {
    answerEnglish: string
    actionStepsEnglish: string[]
    disclaimerEnglish: string
  }
  /** Which language the assistant body is currently shown in */
  displayLanguage?: TranslateReplyLanguage
  retranslating?: boolean
  /** User message id this assistant turn belongs to (loading / error / answer) */
  pairedUserId?: string
  /** Exact text last sent to /api/ask (for Retry) */
  submittedText?: string
  /** Original user wording + lang before in-bubble translation */
  userCanonicalText?: string
  userCanonicalLang?: TranslateReplyLanguage
  userDisplayLanguage?: TranslateReplyLanguage
  userTranslating?: boolean
  /** Failed assistant turn — show Retry */
  isError?: boolean
}

export const TRANSLATE_REPLY_LANGS: TranslateReplyLanguage[] = ['en', 'tw', 'ee', 'ga', 'dag']

// Audio playback state
export type AudioState = 'idle' | 'loading' | 'playing'

// Topic types (life situation browse)
export interface TopicSection {
  heading: string
  points: string[]
}

export interface SourceCitation {
  label: string
  reference: string
}

export interface Topic {
  id: string
  emoji: string
  title: string
  subtitle: string
  /** Optional hero title for topic page (e.g. tenant-focused wording) */
  displayTitle?: string
  displaySubtitle?: string
  color: string
  articles: string[]
  sections: {
    know: TopicSection
    do: TopicSection
    watchout: TopicSection
  }
  keyFacts: string[]
  relatedTopics: string[]
  sources: SourceCitation[]
  suggestedQuestions: string[]
}
