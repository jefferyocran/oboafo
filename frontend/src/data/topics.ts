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

export const TOPICS: Topic[] = [
  {
    id: 'police_encounter',
    emoji: '🚔',
    title: 'Police Encounter',
    subtitle: 'Your rights during arrest, detention, and searches',
    color: '#ef4444',
    articles: ['Article 14', 'Article 15', 'Article 18'],
    sections: {
      know: {
        heading: 'What You Should Know',
        points: [
          'If you are arrested, police must immediately tell you the reason for your arrest in a language you understand — Article 14(2).',
          'You have the right to a lawyer of your choice. You can ask for one as soon as you are arrested — Article 14(2).',
          'You must be brought before a court within 48 hours of arrest. If not, you can apply to the High Court for release — Article 14(3).',
          'Police cannot torture you, treat you cruelly, or humiliate you at any time — Article 15(2).',
          'For a search of your body or belongings, police generally need a warrant or reasonable suspicion — Article 18(2).',
        ],
      },
      do: {
        heading: 'What You Can Do',
        points: [
          'Stay calm and do not physically resist, even if you believe the arrest is unlawful. Resistance can lead to more charges.',
          'Ask clearly: "What am I being arrested for?" — the officer is legally required to answer.',
          'Say: "I want to speak to a lawyer." You do not have to answer questions without legal counsel.',
          'Note the officer\'s name, badge number, time, and location. Write it down or ask someone with you to remember.',
          'If you are not brought to court within 48 hours, your lawyer can apply to the High Court for your release.',
          'File a formal complaint at the nearest police station or to CHRAJ if your rights are violated.',
        ],
      },
      watchout: {
        heading: 'Watch Out For',
        points: [
          'Not resisting does not mean you consent to an unlawful arrest. You can challenge it legally afterward.',
          'Police may ask you to "volunteer" a statement. Anything you say can be used against you — wait for a lawyer.',
          'Signing documents at the police station without reading them or having a lawyer present is risky.',
          'Bail is a right for many offences. If denied bail, ask your lawyer to apply to the court.',
        ],
      },
    },
    keyFacts: [
      'You must be told why you are arrested immediately.',
      'You have the right to a lawyer from the moment of arrest.',
      '48-hour rule: you must see a court within 48 hours.',
      'Torture and cruel treatment are unconstitutional at all times.',
    ],
    relatedTopics: ['fair_trial', 'freedom_expression'],
    sources: [
      { label: '1992 Constitution of Ghana', reference: 'Articles 14, 15, 18 (Chapter 5 — Fundamental Human Rights)' },
      { label: 'Legal Aid Commission', reference: '0800-100-060 (toll-free)' },
      { label: 'CHRAJ', reference: 'Commission on Human Rights and Administrative Justice' },
    ],
    suggestedQuestions: [
      'Can police search me without a warrant?',
      'What happens if I am held for more than 48 hours?',
      'Can I refuse to answer police questions?',
    ],
  },

  {
    id: 'housing_property',
    emoji: '🏠',
    title: 'Housing & Property',
    subtitle: 'Rights against eviction, property seizure, and landlord disputes',
    color: '#f97316',
    articles: ['Article 18(1)', 'Article 20'],
    sections: {
      know: {
        heading: 'What You Should Know',
        points: [
          'Every person has the right to own property. No one can take your property away without following the law — Article 20(1).',
          'The government can only take your property for public interest (roads, schools, etc.) and must pay fair compensation promptly — Article 20(2).',
          'Your home is protected. Your landlord or anyone else cannot enter your home, read your mail, or interfere with your privacy without lawful justification — Article 18(1).',
          'If you are being evicted, a court order is required. A landlord cannot simply throw you out without going through the legal process.',
          'The Rent Control Department handles rental disputes between landlords and tenants across Ghana.',
        ],
      },
      do: {
        heading: 'What You Can Do',
        points: [
          'Always put rental agreements in writing. Keep copies of all receipts and correspondence with your landlord.',
          'If your landlord threatens to evict you, contact the Rent Control Department before the situation escalates.',
          'If the government takes your property without compensation, you can challenge this in court and demand fair payment.',
          'Contact the Legal Aid Commission for free legal help if you cannot afford a lawyer.',
          'Document everything: photos, messages, witness names. Evidence is crucial in property disputes.',
        ],
      },
      watchout: {
        heading: 'Watch Out For',
        points: [
          'Verbal agreements are hard to enforce. Always insist on written contracts even for informal arrangements.',
          'Accepting money from a landlord to vacate may limit your legal options later. Get legal advice first.',
          'Your landlord cannot cut off water, electricity, or change locks to force you out. That is illegal "self-help eviction."',
          'Land guardians ("land guards") have no legal authority. Report threats to police.',
        ],
      },
    },
    keyFacts: [
      'No one can deprive you of property without lawful process.',
      'Compulsory acquisition by the state requires fair and prompt compensation.',
      'Your home privacy is constitutionally protected.',
      'Rent Control handles tenant-landlord disputes.',
    ],
    relatedTopics: ['fair_trial', 'work_employment'],
    sources: [
      { label: '1992 Constitution of Ghana', reference: 'Articles 18(1), 20 (Chapter 5)' },
      { label: 'Rent Control Department', reference: '0302-664-347' },
      { label: 'Lands Commission', reference: '0302-680-277' },
    ],
    suggestedQuestions: [
      'Can my landlord evict me without notice?',
      'What is compulsory acquisition and am I entitled to compensation?',
      'Can my landlord enter my home without permission?',
    ],
  },

  {
    id: 'work_employment',
    emoji: '💼',
    title: 'Work & Employment',
    subtitle: 'Fair wages, safe conditions, unions, and wrongful dismissal',
    color: '#eab308',
    articles: ['Article 16', 'Article 21(1)(e)', 'Article 23', 'Article 24'],
    sections: {
      know: {
        heading: 'What You Should Know',
        points: [
          'Every worker has the right to satisfactory, safe, and healthy working conditions — Article 24(1).',
          'You have the right to equal pay for equal work regardless of gender, ethnicity, or religion — Article 24(1).',
          'You have the right to form or join a trade union of your choice to protect your interests — Article 21(1)(e).',
          'Forced labour is prohibited. No one can compel you to work against your will — Article 16(2).',
          'Administrative bodies (including employers in formal settings) must act fairly and reasonably. Unfair dismissal can be challenged — Article 23.',
        ],
      },
      do: {
        heading: 'What You Can Do',
        points: [
          'Keep copies of your employment contract, payslips, and any written warnings or disciplinary notices.',
          'If dismissed unfairly, report to the National Labour Commission. They mediate disputes and can order reinstatement or compensation.',
          'Join or form a trade union — unions negotiate better conditions and defend your rights as a worker.',
          'If facing harassment or discrimination at work, document incidents and report to your union or the Labour Commission.',
          'Seek legal advice before signing any settlement or resignation letter offered under pressure.',
        ],
      },
      watchout: {
        heading: 'Watch Out For',
        points: [
          'Pressure to sign "voluntary" resignation or settlement letters. You have the right to seek independent advice first.',
          '"Casual" or "contract" workers still have rights. Employment status does not strip you of basic protections.',
          'Deductions from wages without written consent or a court order are generally unlawful.',
          'Retaliation for joining a union or reporting safety issues is illegal.',
        ],
      },
    },
    keyFacts: [
      'You have the right to fair wages, rest, and safe working conditions.',
      'Forced labour is unconstitutional.',
      'You can join or form a trade union freely.',
      'Unfair dismissal can be challenged at the National Labour Commission.',
    ],
    relatedTopics: ['equality_rights', 'fair_trial'],
    sources: [
      { label: '1992 Constitution of Ghana', reference: 'Articles 16, 21(1)(e), 23, 24 (Chapter 5 & 6)' },
      { label: 'National Labour Commission', reference: '0302-500-732' },
      { label: 'Ghana TUC', reference: '0302-663-846' },
    ],
    suggestedQuestions: [
      'Can my employer fire me without giving a reason?',
      'Do I have the right to join a trade union?',
      'What can I do if my employer refuses to pay my wages?',
    ],
  },

  {
    id: 'voting_democracy',
    emoji: '🗳️',
    title: 'Voting & Democracy',
    subtitle: 'Your right to vote, stand for office, and participate in democracy',
    color: '#22c55e',
    articles: ['Article 42', 'Article 45', 'Article 47', 'Article 49'],
    sections: {
      know: {
        heading: 'What You Should Know',
        points: [
          'Every Ghanaian citizen who is 18 years or older and of sound mind has the right to vote — Article 42.',
          'Voting is by secret ballot. No one has the right to know who you voted for — Article 49.',
          'The Electoral Commission is an independent body responsible for conducting free and fair elections — Article 45.',
          'Vote buying (offering or accepting money for your vote) is a criminal offence under Ghana\'s electoral laws.',
          'You have the right to stand for election to Parliament or local government if you meet the qualifications.',
        ],
      },
      do: {
        heading: 'What You Can Do',
        points: [
          'Register to vote at your local Electoral Commission office. Bring your Ghana Card or birth certificate.',
          'Vote freely and confidently — your ballot is secret by law.',
          'Report vote buying, ballot stuffing, or voter intimidation to the Electoral Commission or police immediately.',
          'You can observe polling stations as a member of a political party or accredited civil society organisation.',
          'If denied the right to vote at a polling station, request to speak with the presiding officer and note the reason given.',
        ],
      },
      watchout: {
        heading: 'Watch Out For',
        points: [
          'Accepting money or gifts in exchange for your vote. It is illegal and undermines democracy.',
          'Voter registration impersonation. Guard your voter ID carefully.',
          'Misinformation about polling dates, locations, or requirements. Verify only through the Electoral Commission.',
          'Intimidation at polling stations. You have the right to vote without fear.',
        ],
      },
    },
    keyFacts: [
      'Every citizen 18+ has the right to vote.',
      'Voting is secret — no one can demand to know your vote.',
      'Vote buying is a criminal offence.',
      'The Electoral Commission runs independent, free, and fair elections.',
    ],
    relatedTopics: ['freedom_expression', 'equality_rights'],
    sources: [
      { label: '1992 Constitution of Ghana', reference: 'Articles 42, 45, 47, 49 (Chapter 7)' },
      { label: 'Electoral Commission of Ghana', reference: 'www.ec.gov.gh' },
    ],
    suggestedQuestions: [
      'Who has the right to vote in Ghana?',
      'What should I do if someone tries to buy my vote?',
      'Can I be stopped from voting at a polling station?',
    ],
  },

  {
    id: 'fair_trial',
    emoji: '⚖️',
    title: 'Fair Trial & Justice',
    subtitle: 'Presumption of innocence, legal representation, and court rights',
    color: '#3b82f6',
    articles: ['Article 14(3)', 'Article 19', 'Article 23'],
    sections: {
      know: {
        heading: 'What You Should Know',
        points: [
          'You are presumed innocent until proven guilty or until you plead guilty. The burden is on the prosecution to prove its case — Article 19(2).',
          'You have the right to be represented by a lawyer of your choice in any criminal trial — Article 19(2)(c).',
          'If you cannot afford a lawyer, the state should provide one in serious criminal cases. Contact the Legal Aid Commission.',
          'You must be brought before a court within 48 hours of arrest. This prevents indefinite detention without charge — Article 14(3).',
          'You have the right to appeal a court decision to a higher court — Article 19(13).',
        ],
      },
      do: {
        heading: 'What You Can Do',
        points: [
          'Always ask for a lawyer before answering any questions at the police station or in court.',
          'Contact the Legal Aid Commission (0800-100-060, toll-free) if you cannot afford legal representation.',
          'If held beyond 48 hours without a court appearance, your lawyer can apply to the High Court for a writ of habeas corpus (immediate release).',
          'Keep records of all court dates, orders, and documents related to your case.',
          'If you are wrongly convicted, you have the right to appeal. Deadlines for appeals are strict — act quickly.',
        ],
      },
      watchout: {
        heading: 'Watch Out For',
        points: [
          'Signing confessions or statements under pressure. A confession signed without a lawyer can be challenged in court.',
          'Missing court dates. Failure to appear can lead to a warrant for your arrest.',
          'Corrupt practices at court. Report bribery attempts to the Judicial Service of Ghana.',
          'Summary judgments without proper hearing. You have the right to present your case.',
        ],
      },
    },
    keyFacts: [
      'You are innocent until proven guilty.',
      'You have the right to a lawyer — the state must provide one if you cannot afford one.',
      '48 hours maximum before you must appear in court.',
      'You can appeal any court decision to a higher court.',
    ],
    relatedTopics: ['police_encounter', 'equality_rights'],
    sources: [
      { label: '1992 Constitution of Ghana', reference: 'Articles 14(3), 19, 23 (Chapter 5)' },
      { label: 'Legal Aid Commission', reference: '0800-100-060 (toll-free)' },
      { label: 'Ghana Judicial Service', reference: 'www.judicial.gov.gh' },
    ],
    suggestedQuestions: [
      'Am I innocent until proven guilty in Ghana?',
      'What if I cannot afford a lawyer?',
      'How long can I be held before appearing in court?',
    ],
  },

  {
    id: 'freedom_expression',
    emoji: '🗣️',
    title: 'Freedom of Expression',
    subtitle: 'Free speech, peaceful assembly, press freedom, and protest rights',
    color: '#8b5cf6',
    articles: ['Article 21(1)(a)', 'Article 21(1)(b)', 'Article 21(1)(c)', 'Article 21(1)(d)'],
    sections: {
      know: {
        heading: 'What You Should Know',
        points: [
          'You have the right to freedom of speech and expression, including freedom of the press — Article 21(1)(a).',
          'You have the right to peaceful assembly, including the right to take part in processions and demonstrations — Article 21(1)(b).',
          'You have the right to freedom of association — to form groups, clubs, and organisations — Article 21(1)(c).',
          'You have the right to move freely throughout Ghana, reside anywhere, and travel in and out of the country — Article 21(1)(g).',
          'These rights have limits: they cannot be used to incite violence, hatred, or commit criminal acts.',
        ],
      },
      do: {
        heading: 'What You Can Do',
        points: [
          'Speak, write, and publish freely on matters of public concern — you do not need government permission to express your views.',
          'Organise or participate in peaceful demonstrations. Notify the police in advance of large gatherings as a best practice (not always legally required).',
          'Form community groups, civil society organisations, or political associations freely.',
          'If your freedom of expression is unlawfully restricted, seek legal advice or contact CHRAJ.',
          'Journalists and bloggers have the same speech protections as traditional media.',
        ],
      },
      watchout: {
        heading: 'Watch Out For',
        points: [
          'Criminal libel and defamation laws still exist. Ensure your speech is factual and not malicious.',
          'Seditious speech laws. Inciting people to overthrow the government or commit violence is a criminal offence.',
          'Social media posts are subject to the same laws as other speech. Posts that incite violence can lead to prosecution.',
          'Permits may be required for large gatherings in certain public spaces. Check with local authorities.',
        ],
      },
    },
    keyFacts: [
      'You can speak, write, and publish freely.',
      'Peaceful protest and assembly are constitutional rights.',
      'Freedom of association includes forming or joining any organisation.',
      'These rights do not protect incitement to violence or criminal acts.',
    ],
    relatedTopics: ['voting_democracy', 'equality_rights', 'police_encounter'],
    sources: [
      { label: '1992 Constitution of Ghana', reference: 'Article 21 (Chapter 5 — General Fundamental Freedoms)' },
      { label: 'Ghana Independent Broadcasters Association', reference: 'GIBA' },
      { label: 'CHRAJ', reference: '0302-662-504' },
    ],
    suggestedQuestions: [
      'Can I be arrested for criticising the government?',
      'Do I need a permit to hold a peaceful protest?',
      'What are the limits of free speech in Ghana?',
    ],
  },

  {
    id: 'equality_rights',
    emoji: '🤝',
    title: 'Equality & Your Rights',
    subtitle: 'Non-discrimination, gender equality, and CHRAJ complaints',
    color: '#ec4899',
    articles: ['Article 17', 'Article 26', 'Article 29'],
    sections: {
      know: {
        heading: 'What You Should Know',
        points: [
          'All persons are equal before the law. No one can be discriminated against on the basis of gender, race, colour, ethnic origin, religion, creed, or social or economic status — Article 17(2).',
          'Women have the right to equal opportunities in educational, social, and economic activities — Article 27.',
          'Persons with disabilities have rights to dignity, respect, and access to public facilities and services — Article 29.',
          'Discriminatory customary practices that harm individuals can be challenged legally. Culture does not override constitutional rights — Article 26(2).',
          'The Commission on Human Rights and Administrative Justice (CHRAJ) investigates discrimination and human rights violations.',
        ],
      },
      do: {
        heading: 'What You Can Do',
        points: [
          'If you face discrimination (at work, school, hospital, or public life), document the incidents carefully — dates, names, what was said or done.',
          'Report discrimination to CHRAJ. You can file a complaint without a lawyer, and the process is free.',
          'Seek support from civil society organisations like Gender Centre or FIDA (Federation of Women Lawyers).',
          'In employment discrimination cases, the National Labour Commission can also hear your complaint.',
          'Raise awareness within your community. Rights education is a powerful tool against discrimination.',
        ],
      },
      watchout: {
        heading: 'Watch Out For',
        points: [
          '"Indirect" discrimination — policies that seem neutral but disadvantage a particular group. This is still unlawful.',
          'Being told to "accept" discriminatory treatment because of tradition or custom. Customs cannot override constitutional rights.',
          'Retaliation for complaining about discrimination. Report any retaliation as a separate complaint.',
          'Delays in CHRAJ processes. For urgent situations, the High Court can also hear constitutional rights violations.',
        ],
      },
    },
    keyFacts: [
      'All persons are equal before the law.',
      'Discrimination based on gender, race, religion, or ethnicity is unconstitutional.',
      'CHRAJ investigates rights violations for free.',
      'Customary practices that harm people can be challenged in court.',
    ],
    relatedTopics: ['work_employment', 'children_family', 'fair_trial'],
    sources: [
      { label: '1992 Constitution of Ghana', reference: 'Articles 17, 26, 27, 29 (Chapter 5)' },
      { label: 'CHRAJ', reference: '0302-662-504 / www.chrajghana.com' },
      { label: 'FIDA Ghana', reference: 'Federation of International Women Lawyers' },
    ],
    suggestedQuestions: [
      'Is discrimination based on my gender illegal in Ghana?',
      'What can I do if I face discrimination at work?',
      'Where do I report a human rights violation?',
    ],
  },

  {
    id: 'children_family',
    emoji: '👨‍👩‍👧',
    title: 'Children & Family',
    subtitle: 'Rights of children, child labour, education, and family protection',
    color: '#14b8a6',
    articles: ['Article 28', 'Article 29'],
    sections: {
      know: {
        heading: 'What You Should Know',
        points: [
          'Every child has the right to life, dignity, and basic necessities — food, shelter, clothing, medical care, and education — Article 28(1).',
          'No child shall be subjected to torture, cruel treatment, or be used in armed conflict — Article 28(3)(4).',
          'Child labour that is harmful to a child\'s health, education, or development is prohibited — Article 28(2).',
          'Children cannot be married before the age of 18. Child marriage is illegal under Ghana\'s Children\'s Act.',
          'A child who commits an offence must be treated differently from an adult. The focus should be on rehabilitation, not punishment.',
        ],
      },
      do: {
        heading: 'What You Can Do',
        points: [
          'Report child abuse, neglect, or harmful child labour to the Department of Social Welfare or DOVVSU (Domestic Violence and Victim Support Unit).',
          'Ensure children in your family or community are enrolled in school. Basic education is a right.',
          'If a child is being detained by police, ensure they have a guardian or lawyer present.',
          'Contact the Child Rights International or UNICEF Ghana for guidance on child rights violations.',
          'Schools and communities should have child protection policies. Advocate for these.',
        ],
      },
      watchout: {
        heading: 'Watch Out For',
        points: [
          'Distinguishing between child labour and children helping at home or on family farms. Harmful labour is what is prohibited, not all work.',
          'Children signing legal documents. Minors cannot enter binding contracts — this can be exploited against them.',
          'Informal adoption arrangements without legal process. Ensure any adoption goes through the courts and Social Welfare.',
          'Child traffickers often pose as helpers or offer education or work opportunities. Always verify and report suspicions.',
        ],
      },
    },
    keyFacts: [
      'Every child has constitutional rights to food, shelter, health, and education.',
      'Harmful child labour is prohibited.',
      'Child marriage is illegal — minimum age is 18.',
      'Children in conflict with the law must be treated differently from adults.',
    ],
    relatedTopics: ['equality_rights', 'fair_trial'],
    sources: [
      { label: '1992 Constitution of Ghana', reference: 'Articles 28, 29 (Chapter 5)' },
      { label: 'Children\'s Act of Ghana', reference: 'Act 560 (1998)' },
      { label: 'DOVVSU', reference: 'Domestic Violence and Victim Support Unit — 0302-773-906' },
    ],
    suggestedQuestions: [
      'What are the rights of children under Ghana\'s constitution?',
      'Is child labour illegal in Ghana?',
      'Can a child be tried as an adult in Ghana?',
    ],
  },
]
