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
  // Set the migration as complete
  game.settings.set('svnsea2e', 'systemMigrationVersion', game.system.data.version)
  ui.notifications.info(`7th Sea 2E System Migration to version ${game.system.data.version} completed!`, { permanent: true })
}

/* -------------------------------------------- */
/*  Entity Type Migration Helpers               */
/* -------------------------------------------- */

/**
 * Migrate a single Actor entity to incorporate latest data model changes
 * Return an Object of updateData to be applied
 * @param {Actor} actor   The actor to Update
 * @return {Object}       The updateData to apply
 */
export const migrateActorData = function (actor) {
  const updateData = {}

  if ((actor.type !== 'ship' && actor.type !== 'dangerpts' && actor.type !== 'brute') && actor.data.wounds.max !== 20) {
    updateData['data.wounds.max'] = 20
  }

  if ((actor.type === 'playercharacter' || actor.type === 'hero' || actor.type === 'villain') && actor.data.nation === 'rahuris') {
    updateData['data.nation'] = 'rahuri'
  }
  return updateData
}
