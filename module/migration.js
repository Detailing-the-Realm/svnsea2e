/**
 * Perform a system migration for the entire World, applying migrations for Actors, Items, and Compendium packs
 * @return {Promise}      A Promise which resolves once the migration is completed
 */
export const migrateWorld = async function () {
  ui.notifications.info(`Applying 7th Sea 2E System Migration for version ${game.system.data.version}. Please be patient and do not close your game or shut down your server.`, { permanent: true })
  // Migrate World Actors
  for (const a of game.actors.entities) {
    try {
      const updateData = migrateActorData(a.data)
      if (!isObjectEmpty(updateData)) {
        console.log(`Migrating Actor entity ${a.name}`)
        await a.update(updateData, { enforceTypes: false })
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Migrate World Items
  for (const i of game.items.entities) {
    try {
      const updateData = migrateItemData(i.data)
      if (!isObjectEmpty(updateData)) {
        console.log(`Migrating Item entity ${i.name}`)
        await i.update(updateData, { enforceTypes: false })
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Migrate World Compendium Packs
  const packs = game.packs.filter(p => {
    return (p.metadata.package === "world") && ["Actor", "Item", "Scene"].includes(p.metadata.entity)
  })
  for ( let p of packs ) {
    await migrateCompendium(p)
  }

  // Set the migration as complete
  game.settings.set('svnsea2e', 'systemMigrationVersion', game.system.data.version)
  ui.notifications.info(`7th Sea 2E System Migration to version ${game.system.data.version} completed!`, { permanent: true })
}

/* -------------------------------------------- */
/*  Entity Type Migration Helpers               */
/* -------------------------------------------- */

/**
 * Apply migration rules to all Entities within a single Compendium pack
 * @param pack
 * @return {Promise}
 */
export const migrateCompendium = async function(pack) {
  const entity = pack.metadata.entity
  if ( !["Actor", "Item", "Scene"].includes(entity) ) return

  // Begin by requesting server-side data model migration and get the migrated content
  await pack.migrate();
  const content = await pack.getContent();

  // Iterate over compendium entries - applying fine-tuned migration functions
  for ( let ent of content ) {
    try {
      let updateData = null
      if (entity === "Item") updateData = migrateItemData(ent.data)
      else if (entity === "Actor") updateData = migrateActorData(ent.data)
      else if ( entity === "Scene" ) updateData = migrateSceneData(ent.data)
      if (!isObjectEmpty(updateData)) {
        expandObject(updateData);
        updateData["_id"] = ent._id
        await pack.updateEntity(updateData)
        console.log(`Migrated ${entity} entity ${ent.name} in Compendium ${pack.collection}`)
      }
    } catch(err) {
      console.error(err)
    }
  }
  console.log(`Migrated all ${entity} entities from Compendium ${pack.collection}`)
};

/**
 * Migrate a single Actor entity to incorporate latest data model changes
 * Return an Object of updateData to be applied
 * @param {Actor} actor   The actor to Update
 * @return {Object}       The updateData to apply
 */
export const migrateActorData = function (actor) {
  const updateData = {}

  if (actor.type === 'playercharacter' && actor.data.wealth == null){
    updateData['data.wealth'] = 0
  }

  if ((actor.type !== 'dangerpts' && actor.type !== 'brute') && actor.data.wounds.max != 20) {
    updateData['data.wounds.max'] = 20
  }

  if ((actor.type === 'playercharacter' || actor.type === 'hero' || actor.type === 'villain') && actor.data.nation === 'rahuris') {
    updateData['data.nation'] = 'rahuri'
  }

  if ((actor.type === 'villain' || actor.type === 'monster') && actor.data.traits.strength.max != 10) {
    updateData['data.traits.strength.max'] = 20
    updateData['data.traits.influence.max'] = 20
    updateData['data.traits.influence.min'] = 0
  }

  if (actor.type === 'brute') {
    updateData['data.traits.strength.max'] = 20
  }

  if(actor.type === 'dangerpts' && actor.data.points < 5) {
    updateData['data.points'] = 5
  }

  if(actor.type === 'monster' && actor.data.fear.max != 5) {
    updateData['data.fear.value'] = 0
    updateData['data.fear.min'] = 0
    updateData['data.fear.max'] = 5
  }

  if(actor.type === 'ship' && actor.data.crewstatus == null ) {
    updateData['data.crewstatus'] = ""
  }

  return updateData
}

/**
 * Migrate a single Actor entity to incorporate latest data model changes
 * Return an Object of updateData to be applied
 * @param {Actor} actor   The actor to Update
 * @return {Object}       The updateData to apply
 */
export const migrateItemData = function (item) {
  const updateData = {}

  if (item.type === 'secretsociety' && typeof item.favor === 'undefined') {
    updateData['data.favor'] = 0
  }

  if (item.type === 'story' && typeof item.status === 'undefined') {
    updateData['data.status'] = ''
  }

  return updateData
}

/* -------------------------------------------- */

/**
 * Migrate a single Scene entity to incorporate changes to the data model of it's actor data overrides
 * Return an Object of updateData to be applied
 * @param {Object} scene  The Scene data to Update
 * @return {Object}       The updateData to apply
 */
export const migrateSceneData = function(scene) {
  return {}
}
