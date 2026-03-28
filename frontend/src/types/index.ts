// Language codes supported by the app
export type Language = 'en' | 'tw' | 'ee' | 'ga'

export const LANGUAGE_LABELS: Record<Language, string> = {
  en: 'English',
  tw: 'Twi',
  ee: 'Ewe',
  ga: 'Ga',
}

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
}

// App view state
export type AppView = 'home' | 'chat' | 'crisis'
