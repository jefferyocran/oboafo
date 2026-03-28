// Language codes supported by the app
export type Language = 'en' | 'tw' | 'ee' | 'ga' | 'dag'

export const LANGUAGE_LABELS: Record<Language, string> = {
  en:  'English',
  tw:  'Twi',
  ee:  'Ewe',
  ga:  'Ga',
  dag: 'Dagbani',
}

export const LANGUAGES: Language[] = ['en', 'tw', 'ee', 'ga', 'dag']

// Crisis scenario IDs
export type CrisisScenario = 'arrested' | 'police_stop' | 'landlord' | 'employer'

// App pages
export type AppPage = 'home' | 'browse' | 'topic' | 'chat' | 'crisis'

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
}

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
