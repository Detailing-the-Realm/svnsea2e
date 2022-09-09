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

export async function getAllPackAdvantages() {
  let itemPacks = game.packs.filter((p) => p.metadata.type === 'Item');
  const bar = async (p, i) => {
    return await p.getDocument(i._id);
  };
  const foo = async (p) => {
    const items = await p.getIndex();
    return await Promise.all(
      items.filter((i) => i.type === 'advantage').map((i) => bar(p, i)),
    );
  };
  let a = await Promise.all(itemPacks.map((p) => foo(p)));
  return a.flatMap((a) => a);
}

export const GLAMOR_NATIONS = ['highland', 'avalon', 'insmore'];
export const isValidGlamorIsles = (actor) =>
  GLAMOR_NATIONS.includes(actor.system.nation);
