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
    console.log('items', items);
    const filtered = await Promise.all(
      items.filter((i) => i.type === 'advantage').map((i) => bar(p, i)),
    );
    console.log('filtered', filtered);
    return filtered;
  };
  let a = await Promise.all(itemPacks.map((p) => foo(p)));
  let advantages = await a.flatMap((a) => a);

  console.log('all advantages', advantages);
  console.log('all advantages find', advantages.find);
  // const advantages = [];
  // const packs = game.packs.entries;
  // for (var i = 0; i < packs.length; i++) {
  //   const pack = packs[i];
  //   if (pack.metadata.entity === 'Item') {
  //     const pitems = await pack.getIndex();
  //     for (let j = 0; j < pitems.length; j++) {
  //       const document = await pack.getDocument(pitems[j]._id);
  //       const entry = document.data;
  //       if (entry.type === "advantage") {
  //         advantages.push(entry);
  //       }
  //     }
  //   }
  // }
  return advantages;
}
