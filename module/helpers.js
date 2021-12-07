export const skillsToSheetData = (baseData, CONFIG) =>
  Object.entries(baseData.data.data.skills)
    .map(([s, skill]) => ({
      ...skill,
      name: s,
      label: CONFIG.SVNSEA2E.skills[s],
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

export const getAdvantageItems = (baseData) =>
  baseData.items.filter((item) => item.type === 'advantage');

export const getBackgroundItems = (baseData) =>
  baseData.items.filter((item) => item.type === 'background');

export const getSorceryItems = (baseData) =>
  baseData.items.filter((item) => item.type === 'sorcery');
export const getSecretSocietyItems = (baseData) =>
  baseData.items.filter((item) => item.type === 'secretsociety');
export const getStoryItems = (baseData) =>
  baseData.items.filter((item) => item.type === 'story');
export const getDuelStyleItems = (baseData) =>
  baseData.items.filter((item) => item.type === 'duelstyle');
export const getArtifactItems = (baseData) =>
  baseData.items.filter((item) => item.type === 'artifact');
export const getSchemeItems = (baseData) =>
  baseData.items.filter((item) => item.type === 'scheme');
export const getShipAdventureItems = (baseData) =>
  baseData.items.filter((item) => item.type === 'shipadventure');
export const getShipBackgroundItems = (baseData) =>
  baseData.items.filter((item) => item.type === 'shipbackground');
export const getMonsterQualityItems = (baseData) =>
  baseData.items.filter((item) => item.type === 'monsterquality');
export const getVirtueItems = (baseData) =>
  baseData.items.filter((item) => item.type === 'virtue');
export const getHubrisItems = (baseData) =>
  baseData.items.filter((item) => item.type === 'hubris');
