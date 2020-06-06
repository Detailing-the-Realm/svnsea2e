// Namespace D&D5e Configuration Values
export const SVNSEA2E = {}

SVNSEA2E.ASCII = '7TH SEA'

SVNSEA2E.itemTypes = {
  advantage: 'SVNSEA2E.Advantage',
  background: 'SVNSEA2E.Background',
  sorcery: 'SVNSEA2E.Sorcery',
  nation: 'SVNSEA2E.Nation',
  secretsociety: 'SVNSEA2E.SecretSociety',
  ship: 'SVNSEA2E.Ship',
  hubris: 'SVNSEA2E.Hubris',
  virtue: 'SVNSEA2E.Virtue'
}

SVNSEA2E.actorTypes = {
  brute: 'SVNSEA2E.Brute',
  playercharacter: 'SVNSEA2E.PlayerCharacter',
  monster: 'SVNSEA2E.Monster',
  villian: 'SVNSEA2E.Villain',
  hero: 'SVNSEA2E.Hero'
}

SVNSEA2E.nations = {
  anatol: 'SVNSEA2E.NationAnatol',
  avalon: 'SVNSEA2E.NationAvalon',
  ashur: 'SVNSEA2E.NationAshur',
  inismore: 'SVNSEA2E.NationInismore',
  highland: 'SVNSEA2E.NationHighland',
  castille: 'SVNSEA2E.NationCastille',
  eisen: 'SVNSEA2E.NationEisen',
  jaragua: 'SVNSEA2E.NationJaragua',
  kuraq: 'SVNSEA2E.NationKuraq',
  labucca: 'SVNSEA2E.NationLaBucca',
  montaigne: 'SVNSEA2E.NationMontaigne',
  nahuaca: 'SVNSEA2E.NationNahuaca',
  numa: 'SVNSEA2E.NationNuma',
  persis: 'SVNSEA2E.NationPersis',
  rahuris: 'SVNSEA2E.NationRahuri',
  sarmatia: 'SVNSEA2E.NationSarmatia',
  sarmion: 'SVNSEA2E.NationSarmion',
  tribes: 'SVNSEA2E.NationTribes',
  tzakkan: 'SVNSEA2E.NationTzakkan',
  ussura: 'SVNSEA2E.NationUssura',
  vesten: 'SVNSEA2E.NationVesten',
  vodacce: 'SVNSEA2E.NationVodacce'
}

SVNSEA2E.languages = {
  avalon: 'SVNSEA2E.LanguageAvalonian',
  castille: 'SVNSEA2E.LanguageCastillian',
  eisen: 'SVNSEA2E.LanguageEisen',
  highland: 'SVNSEA2E.LanguageHighlander',
  jaragua: 'SVNSEA2E.LanguageJaragua',
  inismore: 'SVNSEA2E.LanguageInish',
  montaigne: 'SVNSEA2E.LanguageMontaigne',
  numa: 'SVNSEA2E.LanguageNuma',
  persis: 'SVNSEA2E.LanguagePersis',
  pirate: 'SVNSEA2E.LanguagePirate',
  rahuri: 'SVNSEA2E.LanguageRahuri',
  sarmatia: 'SVNSEA2E.LanguageCuronian',
  sarmion: 'SVNSEA2E.LanguageDibre',
  thean: 'SVNSEA2E.LanguageThean',
  ussura: 'SVNSEA2E.LanguageUssurian',
  vesten: 'SVNSEA2E.LanguageVesten',
  vodacce: 'SVNSEA2E.LanguageVodacce'
}

SVNSEA2E.traits = {
  brawn: 'SVNSEA2E.TraitBrawn',
  finesse: 'SVNSEA2E.TraitFinesse',
  resolve: 'SVNSEA2E.TraitResolve',
  wits: 'SVNSEA2E.TraitWits',
  panache: 'SVNSEA2E.TraitPanache',
  influence:'SVNSEA2E.TraitInfluence',
  strength:'SVNSEA2E.TraitStrength',
  villany:'SVNSEA2E.TraitVillany'
}

SVNSEA2E.skills = {
  aim: 'SVNSEA2E.SkillAim',
  athletics: 'SVNSEA2E.SkillAthletics',
  brawl: 'SVNSEA2E.SkillBrawl',
  convince: 'SVNSEA2E.SkillConvince',
  empathy: 'SVNSEA2E.SkillEmpathy',
  hide: 'SVNSEA2E.SkillHide',
  intimidate: 'SVNSEA2E.SkillIntimidate',
  notice: 'SVNSEA2E.SkillNotice',
  perform: 'SVNSEA2E.SkillPerform',
  ride: 'SVNSEA2E.SkillRide',
  sailing: 'SVNSEA2E.SkillSailing',
  scholarship: 'SVNSEA2E.SkillScholarship',
  tempt: 'SVNSEA2E.SkillTempt',
  theft: 'SVNSEA2E.SkillTheft',
  warfare: 'SVNSEA2E.SkillWarfare',
  weaponry: 'SVNSEA2E.SkillWeaponry'
}

SVNSEA2E.status = {
  abandoned: 'SVNSEA2E.StatusAbandoned',
  complete: 'SVNSEA2E.StatusComplete',
  inprogress: 'SVNSEA2E.StatusInProgress'
}

SVNSEA2E.match10 = {
  two: [
    [1, 9],
    [2, 8],
    [3, 7],
    [4, 6],
    [5, 5]
  ],
  three: [
    [1, 1, 8],
    [1, 2, 7],
    [1, 3, 6],
    [1, 4, 5],
    [2, 2, 6],
    [2, 3, 5],
    [4, 4, 2],
    [3, 3, 4]
  ]
}

SVNSEA2E.match15 = {
  two: [
    [5, 10],
    [6, 9],
    [7, 8]
  ],
  three: [
    [1, 4, 10],
    [1, 5, 9],
    [1, 6, 8],
    [1, 7, 7],
    [2, 3, 10],
    [2, 4, 9],
    [2, 5, 8],
    [2, 6, 7],
    [3, 3, 9],
    [3, 4, 8],
    [3, 5, 7],
    [6, 6, 3],
    [4, 4, 7],
    [4, 5, 6],
    [5, 5, 5]
  ]
}
