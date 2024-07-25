/**
 * Perform a system migration for the entire World, applying migrations for Actors, Items, and Compendium packs
 * @return {Promise}      A Promise which resolves once the migration is completed
 */
export const migrateWorld = async function () {
  ui.notifications.info(
    `Applying 7th Sea 2E System Migration for version ${game.system.version}. Please be patient and do not close your game or shut down your server.`,
    {
      permanent: true,
    },
  );
  // Migrate World Actors
  for (const a of game.actors.values()) {
    try {
      const updateData = migrateActorData(a);
      if (!foundry.utils.isEmpty(updateData)) {
        console.log(`Migrating Actor entity ${a.name}`);
        await a.update(updateData, {
          enforceTypes: false,
        });
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Migrate World Items
  for (const i of game.items.values()) {
    try {
      const updateData = migrateItemData(i);
      if (!foundry.utils.isEmpty(updateData)) {
        console.log(`Migrating Item entity ${i.name}`);
        await i.update(updateData, {
          enforceTypes: false,
        });
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Migrate World Compendium Packs
  const packs = game.packs.filter((p) => {
    return (
      p.metadata.package === 'world' &&
      ['Actor', 'Item', 'Scene'].includes(p.metadata.entity)
    );
  });
  for (let p of packs) {
    await migrateCompendium(p);
  }

  // Set the migration as complete
  game.settings.set('svnsea2e', 'systemMigrationVersion', game.system.version);
  ui.notifications.info(
    `7th Sea 2E System Migration to version ${game.system.version} completed!`,
    {
      permanent: true,
    },
  );
};

/* -------------------------------------------- */
/*  Entity Type Migration Helpers               */
/* -------------------------------------------- */

/**
 * Apply migration rules to all Entities within a single Compendium pack
 * @param pack
 * @return {Promise}
 */
export const migrateCompendium = async function (pack) {
  const entity = pack.metadata.entity;
  if (!['Actor', 'Item', 'Scene'].includes(entity)) return;

  // Begin by requesting server-side data model migration and get the migrated content
  await pack.migrate();

  // Iterate over compendium entries - applying fine-tuned migration functions
  for (let ent of pack) {
    try {
      let updateData = null;
      if (entity === 'Item') updateData = migrateItemData(ent.data);
      else if (entity === 'Actor') updateData = migrateActorData(ent.data);
      else if (entity === 'Scene') updateData = migrateSceneData(ent.data);
      if (!isObjectEmpty(updateData)) {
        expandObject(updateData);
        updateData['_id'] = ent._id;
        await pack.updateEntity(updateData);
        console.log(
          `Migrated ${entity} entity ${ent.name} in Compendium ${pack.collection}`,
        );
      }
    } catch (err) {
      console.error(err);
    }
  }
  console.log(
    `Migrated all ${entity} entities from Compendium ${pack.collection}`,
  );
};

/**
 * Migrate a single Actor entity to incorporate latest data model changes
 * Return an Object of updateData to be applied
 * @param {Actor} actor   The actor to Update
 * @return {Object}       The updateData to apply
 */
export const migrateActorData = function (actor) {
  const updateData = {};

  if (actor.type === 'playercharacter' && actor.system.wealth == null) {
    updateData['wealth'] = 0;
  }

  if (
    actor.type !== 'dangerpts' &&
    actor.type !== 'brute' &&
    actor.system.wounds.max != 20
  ) {
    updateData['wounds.max'] = 20;
  }

  if (
    (actor.type === 'playercharacter' ||
      actor.type === 'hero' ||
      actor.type === 'villain') &&
    actor.system.nation === 'rahuris'
  ) {
    updateData['nation'] = 'rahuri';
  }

  if (
    (actor.type === 'villain' || actor.type === 'monster') &&
    actor.system.traits.strength.max != 10
  ) {
    updateData['traits.strength.max'] = 20;
    updateData['traits.influence.max'] = 20;
    updateData['traits.influence.min'] = 0;
  }

  if (actor.type === 'brute') {
    updateData['traits.strength.max'] = 20;
  }

  if (actor.type === 'dangerpts' && actor.system.points < 5) {
    updateData['points'] = 5;
  }

  if (actor.type === 'monster' && actor.system.fear.max != 5) {
    updateData['fear.value'] = 0;
    updateData['fear.min'] = 0;
    updateData['fear.max'] = 5;
  }

  if (actor.type === 'ship' && actor.system.crewstatus == null) {
    if (actor.system.crewstatus == null) {
      updateData['crewstatus'] = '';
    }
    if (aactor.system.wealth == null) {
      updateData['wealth'] = '0';
    }
  }

  if (
    actor.type === 'playercharacter' ||
    actor.type === 'hero' ||
    actor.type === 'villain'
  ) {
    if (actor.system.arcana) {
      migrateVirtue(actor);
      migrateHubris(actor);
      actor.update({ data: { arcana: null } });
    }
  }

  return updateData;
};

/**
 * Migrate a single Actor entity to incorporate latest data model changes
 * Return an Object of updateData to be applied
 * @param {Actor} actor   The actor to Update
 * @return {Object}       The updateData to apply
 */
export const migrateItemData = function (item) {
  const updateData = {};

  if (
    item.type === 'secretsociety' &&
    typeof item.system.favor === 'undefined'
  ) {
    updateData['favor'] = 0;
  }

  if (item.type === 'story' && typeof item.system.status === 'undefined') {
    updateData['status'] = '';
  }

  return updateData;
};

/* -------------------------------------------- */

/**
 * Migrate a single Scene entity to incorporate changes to the data model of it's actor data overrides
 * Return an Object of updateData to be applied
 * @param {Object} scene  The Scene data to Update
 * @return {Object}       The updateData to apply
 */
export const migrateSceneData = function (scene) {
  return {};
};

export const migrateVirtue = function (actor) {
  const virtue = actor.system.arcana.virtue;
  if (virtue.name) {
    const itemData = {
      name: virtue.name,
      img: `systems/svnsea2e/icons/virtue.jpg`,
      type: 'virtue',
      data: {
        description: virtue.description,
      },
    };
    actor.document.createEmbeddedDocuments('Item', [itemData]);
  }
};

export const migrateHubris = function (actor) {
  const hubris = actor.system.arcana.hubris;
  if (hubris.name) {
    const itemData = {
      name: hubris.name,
      img: `systems/svnsea2e/icons/hubris.jpg`,
      type: 'hubris',
      data: {
        description: hubris.description,
      },
    };
    actor.document.createEmbeddedDocuments('Item', [itemData]);
  }
};
