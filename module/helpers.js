export const skillsToSheetData = (actorData, CONFIG) =>
  Object.entries(actorData.skills)
    .map(([s, skill]) => ({
      ...skill,
      name: s,
      label: CONFIG.SVNSEA2E.skills[s],
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

export const getItems = (data, type) =>
  data.items.filter((item) => item.type === type);
