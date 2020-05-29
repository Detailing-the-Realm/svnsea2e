import ActorSheetSS2e from './base.js'
/**
 * Extend the basic ActorSheet with some very simple modifications
 * @ext'../../dice.js't}
 */
export class ActorSheetSS2ePC extends ActorSheetSS2e {
  /** @override */
  static get defaultOptions () {
    return mergeObject(super.defaultOptions, {
      classes: ['svnsea2e', 'sheet', 'actor'],
      template: 'systems/svnsea2e/templates/actors/pc.html',
      tabs: [{
        navSelector: '.sheet-tabs',
        contentSelector: '.sheet-body',
        initial: 'traits'
      }]
    })
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareCharacterItems (data) {
    const actorData = data.actor
    console.log(data.actor.data)

    // Update trait labels
    for (const [t, trait] of Object.entries(data.actor.data.traits)) {
      trait.label = CONFIG.SVNSEA2E.traits[t]
    }

    // Update skill labels
    for (const [s, skl] of Object.entries(data.actor.data.skills)) {
      skl.label = CONFIG.SVNSEA2E.skills[s]
    }

    // Initialize containers.
    const gear = []
    const features = []
    const spells = {
      0: [],
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
      7: [],
      8: [],
      9: []
    }

    // Iterate through items, allocating to containers
    // let totalWeight = 0
    for (const i of data.items) {
      const item = i.data
      i.img = i.img || DEFAULT_TOKEN
      // Append to gear.
      if (i.type === 'item') {
        gear.push(i)
      }
      // Append to features.
      else if (i.type === 'feature') {
        features.push(i)
      }
      // Append to spells.
      else if (i.type === 'spell') {
        if (i.data.spellLevel != undefined) {
          spells[i.data.spellLevel].push(i)
        }
      }
    }

    // Assign and return
    actorData.gear = gear
    actorData.features = features
    actorData.spells = spells
  }
}
