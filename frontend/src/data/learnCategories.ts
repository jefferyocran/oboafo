import type { Topic } from '../types'

/** Learn grid & landing teasers — maps everyday situations to existing topic content */
export interface LearnCategoryTeaser {
  emoji: string
  learnTitle: string
  learnDescription: string
  topicId: string
}

export const LEARN_CATEGORY_TEASERS: LearnCategoryTeaser[] = [
  {
    emoji: '🏠',
    learnTitle: 'I am a tenant',
    learnDescription: 'Rent, eviction notices, privacy at home, and Rent Control.',
    topicId: 'housing_property',
  },
  {
    emoji: '🚔',
    learnTitle: 'I was stopped by police',
    learnDescription: 'Arrest, search, 48-hour rule, and your right to a lawyer.',
    topicId: 'police_encounter',
  },
  {
    emoji: '💼',
    learnTitle: 'I am a worker',
    learnDescription: 'Fair work conditions, unions, wages, and wrongful dismissal.',
    topicId: 'work_employment',
  },
  {
    emoji: '🗳️',
    learnTitle: 'I am going to vote',
    learnDescription: 'Registering, secret ballot, and participating in democracy.',
    topicId: 'voting_democracy',
  },
  {
    emoji: '🏥',
    learnTitle: 'I am a patient',
    learnDescription: 'Dignity, non-discrimination, and fair treatment in care settings.',
    topicId: 'equality_rights',
  },
]

export function teaserForTopic(topic: Topic): LearnCategoryTeaser | undefined {
  return LEARN_CATEGORY_TEASERS.find((t) => t.topicId === topic.id)
}
