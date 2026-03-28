import type { CrisisResponse, CrisisScenario, Language } from '../types'

// Hard-coded, pre-translated crisis responses — work fully offline
// These are the single most important piece of data in the app

const crisisData: Record<CrisisScenario, Record<Language, CrisisResponse>> = {
  arrested: {
    en: {
      scenario: 'arrested',
      title: "I've Been Arrested",
      rights: [
        { text: 'You must be told why you are being arrested', article: 'Article 14(2)' },
        { text: 'You have the right to a lawyer of your choice', article: 'Article 14(2)' },
        { text: 'You must be brought before a court within 48 hours', article: 'Article 14(3)' },
        { text: 'You cannot be tortured or treated inhumanely', article: 'Article 15(2)' },
      ],
      actions: [
        'Stay calm and do not resist',
        'Ask clearly: "What am I being arrested for?"',
        'Say: "I want to speak to a lawyer"',
        'Remember the officer\'s name and badge number',
      ],
      emergency_contacts: [
        { name: 'Ghana Police Service', phone: '191' },
        { name: 'Legal Aid Commission', phone: '0302-664-951' },
        { name: 'Commission on Human Rights (CHRAJ)', phone: '0302-662-504' },
      ],
    },
    tw: {
      scenario: 'arrested',
      title: 'Wɔakyi Me',
      rights: [
        { text: 'Wɔforo wʼadwuma so a, wɔsɛ wɔkyerɛ wo amanne no', article: 'Atwerɛsɛm 14(2)' },
        { text: 'Wo ho ho, wowɔ ho kwan sɛ wuhwehwɛ akyirikyiri', article: 'Atwerɛsɛm 14(2)' },
        { text: 'Wɔde wo bɛkɔ ɔsɛnniefoo anim dɔnhwere 48 mu', article: 'Atwerɛsɛm 14(3)' },
        { text: 'Obiara ntumi nyi wo ɔhaw anaa di wo fɛfɛ', article: 'Atwerɛsɛm 15(2)' },
      ],
      actions: [
        'Tena ase na mma wʼakyi nhu',
        'Bisa saa: "Deɛn nti na mode me kɔ?"',
        'Ka saa: "Mepɛ sɛ mekasa kyerɛ akyirikyiri"',
        'Kae ɔpolisifo no din ne n\'ahyɛde nɔma',
      ],
      emergency_contacts: [
        { name: 'Ghana Police Service', phone: '191' },
        { name: 'Legal Aid Commission', phone: '0302-664-951' },
        { name: 'Commission on Human Rights (CHRAJ)', phone: '0302-662-504' },
      ],
    },
    ee: {
      scenario: 'arrested',
      title: 'Woyɔ Ŋu',
      rights: [
        { text: 'Wofanyi gblɔ nèwɔ agbɔnye la nu hena', article: 'Nɔnɔme 14(2)' },
        { text: 'Èle wò ŋu be wòle dɔwɔla aɖe si àdi tô', article: 'Nɔnɔme 14(2)' },
        { text: 'Wofanyi zã wò le lãwo ŋu eye wotso wò ɖe ʋɔnudrɔ̃la ŋu le gaƒoƒo 48 me', article: 'Nɔnɔme 14(3)' },
        { text: 'Ame aɖeke maɖe aɖaŋu ɖe wò ŋu o', article: 'Nɔnɔme 15(2)' },
      ],
      actions: [
        'Ɖo alesi eye mègbugbɔ o',
        'Srɔ̃: "Etso nu dzi woyɔ ŋu?"',
        'Gblɔ: "Melɔ̃ be maɖo dɔwɔla sia ŋu"',
        'Ɖo policega ŋkɔ kple nuŋlɔɖi nɔnɔme ŋu',
      ],
      emergency_contacts: [
        { name: 'Ghana Police Service', phone: '191' },
        { name: 'Legal Aid Commission', phone: '0302-664-951' },
        { name: 'Commission on Human Rights (CHRAJ)', phone: '0302-662-504' },
      ],
    },
    ga: {
      scenario: 'arrested',
      title: 'Wɔyɛ Mi Gbomo',
      rights: [
        { text: 'Wobaa ni wɔhɛ wɔyɛ mi gbomo naɛ shi', article: 'Kɛ 14(2)' },
        { text: 'Mi lɛ wɔ kɛ mi nyɛ baabiɔ ŋmaŋma baabiɔ', article: 'Kɛ 14(2)' },
        { text: 'Wɔsane wɔ mi shia atsɛ 48 ni', article: 'Kɛ 14(3)' },
        { text: 'Naa ba gbɔmɔ ko mi nɔ', article: 'Kɛ 15(2)' },
      ],
      actions: [
        'Tena ase na mma adwuma nhu',
        'Bisa: "Nɛ nɔŋ gbomɔ mi?"',
        'Ka: "Mi lɛ wɔ baabiɔ ŋmaŋma"',
        'Hɛnɔ policeni ŋmaŋma kɛ ahɛ nɔŋ',
      ],
      emergency_contacts: [
        { name: 'Ghana Police Service', phone: '191' },
        { name: 'Legal Aid Commission', phone: '0302-664-951' },
        { name: 'Commission on Human Rights (CHRAJ)', phone: '0302-662-504' },
      ],
    },
  },

  police_stop: {
    en: {
      scenario: 'police_stop',
      title: 'Police Are Searching Me',
      rights: [
        { text: 'You are protected from unreasonable search and seizure', article: 'Article 18(2)' },
        { text: 'Your personal privacy is constitutionally protected', article: 'Article 18(1)' },
        { text: 'Police generally need a warrant or reasonable suspicion to search', article: 'Article 18(2)' },
      ],
      actions: [
        'Ask calmly: "Do you have a warrant?"',
        'Do not physically resist even if you believe it is unlawful',
        'Note the time, location, and officer details',
        'File a formal complaint at the nearest police station afterward',
      ],
      emergency_contacts: [
        { name: 'Ghana Police Service', phone: '191' },
        { name: 'Commission on Human Rights (CHRAJ)', phone: '0302-662-504' },
      ],
    },
    tw: {
      scenario: 'police_stop',
      title: 'Polisi Rehwehwɛ Me',
      rights: [
        { text: 'Wɔhwɛ wo a, ɛsɛ sɛ wɔwɔ amanne biara', article: 'Atwerɛsɛm 18(2)' },
        { text: 'Wo nipadua ho ho wɔ so ban', article: 'Atwerɛsɛm 18(1)' },
        { text: 'Polisi hia warrant anaa gyinamidie foforo sɛ rehwehwɛ wo', article: 'Atwerɛsɛm 18(2)' },
      ],
      actions: [
        'Bisa ahoɔden: "Wowɔ warrant?"',
        'Mma wʼakyi nhu, na gyidi sɛ ɛnyɛ atemmu a nso',
        'Kae bere, faako, ne ɔpolisifo nsɛm',
        'Fa complaint kɔ polisi asennii a ɛbɛn wo',
      ],
      emergency_contacts: [
        { name: 'Ghana Police Service', phone: '191' },
        { name: 'Commission on Human Rights (CHRAJ)', phone: '0302-662-504' },
      ],
    },
    ee: {
      scenario: 'police_stop',
      title: 'Polisi Le Ŋlɔ Ŋu',
      rights: [
        { text: 'Woyɔ mi gbomo naɛ wɔ amanne biara', article: 'Nɔnɔme 18(2)' },
        { text: 'Nèle wò ŋu be wogblɔ nami ɖe wò ŋu', article: 'Nɔnɔme 18(1)' },
        { text: 'Polisi hia warrant be woaɖe ŋlɔ ŋu', article: 'Nɔnɔme 18(2)' },
      ],
      actions: [
        'Srɔ̃ nyuitɔ: "Àwɔ warrant?"',
        'Megbugbɔ o, vɔ be wòkpɔ be esi mede o',
        'Ɖo gaƒoƒo, fɛnu kple policega nu',
        'Zã complaint ɖe polisi xɔ si le ŋutɔ',
      ],
      emergency_contacts: [
        { name: 'Ghana Police Service', phone: '191' },
        { name: 'Commission on Human Rights (CHRAJ)', phone: '0302-662-504' },
      ],
    },
    ga: {
      scenario: 'police_stop',
      title: 'Polisi Lɛ Hwɛ Mi',
      rights: [
        { text: 'Wobaa ni wɔ atsɛ wɔ warrant', article: 'Kɛ 18(2)' },
        { text: 'Mi nipadua wɔ ban', article: 'Kɛ 18(1)' },
        { text: 'Polisi hia warrant ni wɔhwɛ mi', article: 'Kɛ 18(2)' },
      ],
      actions: [
        'Bisa: "Wɔwɔ warrant?"',
        'Mma adwuma nhu',
        'Hɛnɔ bere, faako, ne policeni nsɛm',
        'Fa complaint kɔ polisi',
      ],
      emergency_contacts: [
        { name: 'Ghana Police Service', phone: '191' },
        { name: 'Commission on Human Rights (CHRAJ)', phone: '0302-662-504' },
      ],
    },
  },

  landlord: {
    en: {
      scenario: 'landlord',
      title: 'Landlord / Property Dispute',
      rights: [
        { text: 'No one can be deprived of property without lawful process', article: 'Article 20(1)' },
        { text: 'Compulsory acquisition requires fair compensation', article: 'Article 20(2)' },
        { text: 'You have the right to take property disputes to court', article: 'Article 20(1)' },
      ],
      actions: [
        'Document all agreements and payments in writing',
        'Seek mediation at Rent Control for rental disputes',
        'Contact a lawyer if eviction is threatened',
        'Do not leave your property voluntarily under pressure',
      ],
      emergency_contacts: [
        { name: 'Rent Control Department', phone: '0302-664-347' },
        { name: 'Legal Aid Commission', phone: '0302-664-951' },
        { name: 'Lands Commission', phone: '0302-680-277' },
      ],
    },
    tw: {
      scenario: 'landlord',
      title: 'Efie Wura / Asase Tɛntam',
      rights: [
        { text: 'Obiara ntumi nyi wo agyapade a nanso wɔkɔ mmara so', article: 'Atwerɛsɛm 20(1)' },
        { text: 'Sɛ wɔde wo agyapade kɔ a, ɛsɛ sɛ wɔtua wo ka', article: 'Atwerɛsɛm 20(2)' },
        { text: 'Wo wɔ ho kwan sɛ wode agyapade ntɛntam kɔ ɔsɛnniefoo', article: 'Atwerɛsɛm 20(1)' },
      ],
      actions: [
        'Kyerɛw nhyehyɛe ne tua ka nsɛm',
        'Hwehwɛ Rent Control yɛ a ɛfa efie ho nhyehyɛe',
        'Kɔ akyirikyiri hɔ sɛ wɔpɛ sɛ woyɛw wo',
        'Mma yɛ wo nnipa a wɔpɛ sɛ woyɛw wo wɔ wo fie',
      ],
      emergency_contacts: [
        { name: 'Rent Control Department', phone: '0302-664-347' },
        { name: 'Legal Aid Commission', phone: '0302-664-951' },
        { name: 'Lands Commission', phone: '0302-680-277' },
      ],
    },
    ee: {
      scenario: 'landlord',
      title: 'Xɔ Si Ŋutɔ / Azi Nyanya',
      rights: [
        { text: 'Ame aɖeke makɔ nèwò ŋutɔ o ke woaɖe lãwo ŋu', article: 'Nɔnɔme 20(1)' },
        { text: 'Ne woyi nèwò ŋutɔ la, wofanyi xɔ akɔntɔbubu nyui', article: 'Nɔnɔme 20(2)' },
        { text: 'Ŋutɔ nyanyawo ɖe ʋɔnudrɔ̃la ŋu wòle wò ŋu', article: 'Nɔnɔme 20(1)' },
      ],
      actions: [
        'Ŋlɔ nɔnɔmexexe kple akɔntɔ bubu wowo',
        'Kpɔ Rent Control be woaxɔ tefe nyanya ŋu',
        'Zã dɔwɔla ne woyi wò le xɔ me la',
        'Megbɔ nèwò ŋutɔ le ame siwo ŋu o',
      ],
      emergency_contacts: [
        { name: 'Rent Control Department', phone: '0302-664-347' },
        { name: 'Legal Aid Commission', phone: '0302-664-951' },
        { name: 'Lands Commission', phone: '0302-680-277' },
      ],
    },
    ga: {
      scenario: 'landlord',
      title: 'Efie Wura / Asase Tɛntam',
      rights: [
        { text: 'Naa ba gbɔmɔ ko mi agyapade nɔ', article: 'Kɛ 20(1)' },
        { text: 'Wɔde mi agyapade kɔ a, wɔtua mi', article: 'Kɛ 20(2)' },
        { text: 'Mi wɔ ho kwan kɔ ɔsɛnniefoo', article: 'Kɛ 20(1)' },
      ],
      actions: [
        'Kyerɛw nhyehyɛe ne tua ka nsɛm',
        'Hwehwɛ Rent Control',
        'Kɔ akyirikyiri hɔ ne wɔpɛ yɛw wo',
        'Mma yɛ wo nnipa a wɔpɛ yɛw wo',
      ],
      emergency_contacts: [
        { name: 'Rent Control Department', phone: '0302-664-347' },
        { name: 'Legal Aid Commission', phone: '0302-664-951' },
        { name: 'Lands Commission', phone: '0302-680-277' },
      ],
    },
  },

  employer: {
    en: {
      scenario: 'employer',
      title: 'Employer / Workplace Dispute',
      rights: [
        { text: 'Every worker has the right to fair and safe working conditions', article: 'Article 24(1)' },
        { text: 'You have the right to form and join trade unions', article: 'Article 21(1)(e)' },
        { text: 'Forced or compulsory labour is prohibited', article: 'Article 16(2)' },
        { text: 'You cannot be dismissed without due process', article: 'Article 23' },
      ],
      actions: [
        'Document all incidents, contracts, and communications',
        'Report to the National Labour Commission',
        'Contact the Ghana Trades Union Congress (TUC)',
        'Seek legal advice before signing any settlement',
      ],
      emergency_contacts: [
        { name: 'National Labour Commission', phone: '0302-500-732' },
        { name: 'Ghana TUC', phone: '0302-663-846' },
        { name: 'Legal Aid Commission', phone: '0302-664-951' },
      ],
    },
    tw: {
      scenario: 'employer',
      title: 'Dwumadi Wura / Dwumadie Ntɛntam',
      rights: [
        { text: 'Ɔpanyin biara wɔ ho kwan sɛ ɔkɔ adwuma ma ɔnya nea ɛkwa', article: 'Atwerɛsɛm 24(1)' },
        { text: 'Wowɔ ho kwan sɛ woka dwumadi kuo mu', article: 'Atwerɛsɛm 21(1)(e)' },
        { text: 'Sɛ wɔpɛ sɛ wode wo adwuma a, ɛsɛ sɛ wɔdi mmara so', article: 'Atwerɛsɛm 23' },
      ],
      actions: [
        'Kyerɛw nneɛma ne nhyehyɛe nyinaa',
        'Ka National Labour Commission kyerɛ',
        'Kɔ Ghana TUC hɔ',
        'Hwehwɛ akyirikyiri sɛ wode agyae nhyehyɛe署',
      ],
      emergency_contacts: [
        { name: 'National Labour Commission', phone: '0302-500-732' },
        { name: 'Ghana TUC', phone: '0302-663-846' },
        { name: 'Legal Aid Commission', phone: '0302-664-951' },
      ],
    },
    ee: {
      scenario: 'employer',
      title: 'Dɔwɔla / Dɔwɔƒe Nyanya',
      rights: [
        { text: 'Dɔwɔla ɖeka ɖeka le ŋu be wòwɔ dɔ nyui', article: 'Nɔnɔme 24(1)' },
        { text: 'Àle wò ŋu be nèzã dɔwɔlawo kple wòƒe tso', article: 'Nɔnɔme 21(1)(e)' },
        { text: 'Woyɔ ame be wòwɔ dɔ nu vɔ la, esia mele ŋkeke me o', article: 'Nɔnɔme 16(2)' },
      ],
      actions: [
        'Ŋlɔ dɔwɔƒe nu kple nyanyawo',
        'Gblɔ National Labour Commission la nu',
        'Zã Ghana TUC',
        'Kpɔ dɔwɔla bena nèñlɔ gexexe aɖe',
      ],
      emergency_contacts: [
        { name: 'National Labour Commission', phone: '0302-500-732' },
        { name: 'Ghana TUC', phone: '0302-663-846' },
        { name: 'Legal Aid Commission', phone: '0302-664-951' },
      ],
    },
    ga: {
      scenario: 'employer',
      title: 'Dwumadi Wura / Dwumadie Tɛntam',
      rights: [
        { text: 'Ɔpanyin biara wɔ ho kwan adwuma ma ɔnya nea ɛkwa', article: 'Kɛ 24(1)' },
        { text: 'Wowɔ ho kwan koka dwumadi kuo mu', article: 'Kɛ 21(1)(e)' },
        { text: 'Wɔde wo adwuma a, ɛsɛ wɔdi mmara so', article: 'Kɛ 23' },
      ],
      actions: [
        'Kyerɛw nneɛma ne nhyehyɛe nyinaa',
        'Ka National Labour Commission kyerɛ',
        'Kɔ Ghana TUC hɔ',
        'Hwehwɛ akyirikyiri ni wode agyae',
      ],
      emergency_contacts: [
        { name: 'National Labour Commission', phone: '0302-500-732' },
        { name: 'Ghana TUC', phone: '0302-663-846' },
        { name: 'Legal Aid Commission', phone: '0302-664-951' },
      ],
    },
  },
}

export function getCrisisResponse(scenario: CrisisScenario, language: Language): CrisisResponse {
  return crisisData[scenario][language] ?? crisisData[scenario]['en']
}

export const CRISIS_SCENARIOS: { id: CrisisScenario; emoji: string; labelEn: string }[] = [
  { id: 'arrested', emoji: '🚨', labelEn: "I've Been Arrested" },
  { id: 'police_stop', emoji: '🛑', labelEn: 'Police Are Searching Me' },
  { id: 'landlord', emoji: '🏠', labelEn: 'Landlord / Property Dispute' },
  { id: 'employer', emoji: '💼', labelEn: 'Employer / Workplace Dispute' },
]
