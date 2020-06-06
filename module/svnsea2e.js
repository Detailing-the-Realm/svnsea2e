// Import Modules
import { SVNSEA2E } from './config.js'
import { preloadHandlebarsTemplates } from './templates.js'

// Import Applications
import { SvnSea2EActor } from './actor/actor.js'
import { ActorSheetSS2ePlayerCharacter} from './actor/sheets/playercharacter.js'
import { ActorSheetSS2eHero } from './actor/sheets/hero.js'
import { ActorSheetSS2eBrute } from './actor/sheets/brute.js'
import { ActorSheetSS2eMonster } from './actor/sheets/monster.js'
import { ActorSheetSS2eVillian } from './actor/sheets/villian.js'
import { SvnSea2EItem } from './item/item.js'
import { ItemSheetSS2eAdvantage } from './item/sheets/advantage.js'
import { ItemSheetSS2eBackground } from './item/sheets/background.js'
import { ItemSheetSS2eSecretSociety } from './item/sheets/secretsociety.js'
import { ItemSheetSS2eShip } from './item/sheets/ship.js'
import { ItemSheetSS2eSorcery } from './item/sheets/sorcery.js'
import { ItemSheetSS2eStory } from './item/sheets/story.js'
import { ItemSheetSS2eScheme } from './item/sheets/scheme.js'
import LanguageSelector from './apps/language-selector.js'

Hooks.once('init', async function () {
  console.log(`7th Sea 2E | Initializing 7th Sea Second Edition System\n
    ${SVNSEA2E.ASCII}`)
  game.svnsea2e = {
    applications: {
      SvnSea2EActor,
      SvnSea2EItem
    },
    config: SVNSEA2E,
    rollItemMacro: rollItemMacro
  }

  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: '1d20',
    decimals: 2
  }

  CONFIG.SVNSEA2E = SVNSEA2E
  // Define custom Entity classes
  CONFIG.Actor.entityClass = SvnSea2EActor
  CONFIG.Item.entityClass = SvnSea2EItem

  // Register sheet application classes
  Actors.unregisterSheet('core', ActorSheet)
  Actors.registerSheet('svnsea2e', ActorSheetSS2ePlayerCharacter, { types: ['playercharacter'], makeDefault: true })
  Actors.registerSheet('svnsea2e', ActorSheetSS2eHero, { types: ['hero'], makeDefault: true })
  Actors.registerSheet('svnsea2e', ActorSheetSS2eBrute, { types: ['brute'], makeDefault: true })
  Actors.registerSheet('svnsea2e', ActorSheetSS2eMonster, { types: ['monster'], makeDefault: true })
  Actors.registerSheet('svnsea2e', ActorSheetSS2eVillian, { types: ['villian'], makeDefault: true })

  Items.unregisterSheet('core', ItemSheet)
  Items.registerSheet('svnsea2e', ItemSheetSS2eAdvantage, { types: ['advantage'], makeDefault: true })
  Items.registerSheet('svnsea2e', ItemSheetSS2eBackground, { types: ['background'], makeDefault: true })
  Items.registerSheet('svnsea2e', ItemSheetSS2eSecretSociety, { types: ['secretsociety'], makeDefault: true })
  Items.registerSheet('svnsea2e', ItemSheetSS2eShip, { types: ['ship'], makeDefault: true })
  Items.registerSheet('svnsea2e', ItemSheetSS2eSorcery, { types: ['sorcery'], makeDefault: true })
  Items.registerSheet('svnsea2e', ItemSheetSS2eStory, { types: ['story'], makeDefault: true })
  Items.registerSheet('svnsea2e', ItemSheetSS2eScheme, { types: ['scheme'], makeDefault: true })

  // If you need to add Handlebars helpers, here are a few useful examples:
  Handlebars.registerHelper('concat', function () {
    var outStr = ''
    for (var arg in arguments) {
      if (typeof arguments[arg] !== 'object') {
        outStr += arguments[arg]
      }
    }
    return outStr
  })

  Handlebars.registerHelper('toLowerCase', function (str) {
    return str.toLowerCase()
  })

  Handlebars.registerHelper('capitalize', function (str) {
    return str.charAt(0).toUpperCase() + str.slice(1)
  })

  // Preload Handlebars Templates
  preloadHandlebarsTemplates()
})

Hooks.once('ready', async function () {
  // Wait to register hotbar drop hook on ready so that
  // modules could register earlier if they want to
  Hooks.on('hotbarDrop', (bar, data, slot) => createSvnSea2EMacro(data, slot))
})

/**
 * This function runs after game data has been requested
 * and loaded from the servers, so entities exist
 */
Hooks.once('setup', function () {
  // Localize CONFIG objects once up-front
  const toLocalize = [
    'nations', 'traits', 'skills', 'languages', 'itemTypes', 'status'
  ]

  // Exclude some from sorting where the default order matters
  const noSort = [
  ]

  // Localize and sort CONFIG objects
  for (const o of toLocalize) {
    const localized = Object.entries(CONFIG.SVNSEA2E[o]).map(e => {
      return [e[0], game.i18n.localize(e[1])]
    })
    if (!noSort.includes(o)) localized.sort((a, b) => a[1].localeCompare(b[1]))
    CONFIG.SVNSEA2E[o] = localized.reduce((obj, e) => {
      obj[e[0]] = e[1]
      return obj
    }, {})
  }
})

/* -------------------------------------------- */

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createSvnSea2EMacro (data, slot) {
  if (data.type !== 'Item') return
  if (!('data' in data)) return ui.notifications.warn('You can only create macro buttons for owned Items')
  const item = data.data

  // Create the macro command
  const command = `game.svnsea2e.rollItemMacro('${item.name}');`
  let macro = game.macros.entities.find(m => (m.name === item.name) && (m.command === command))
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: 'script',
      img: item.img,
      command: command,
      flags: { 'svnsea2e.itemMacro': true }
    })
  }
  game.user.assignHotbarMacro(macro, slot)
  return false
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemName
 * @return {Promise}
 */
function rollItemMacro (itemName) {
  const speaker = ChatMessage.getSpeaker()
  let actor
  if (speaker.token) actor = game.actors.tokens[speaker.token]
  if (!actor) actor = game.actors.get(speaker.actor)
  const item = actor ? actor.items.find(i => i.name === itemName) : null
  if (!item) return ui.notifications.warn(`Your controlled Actor does not have an item named ${itemName}`)

  // Trigger the item roll
  return item.roll()
}
