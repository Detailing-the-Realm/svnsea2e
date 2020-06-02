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
    const advantages = []
    const backgrounds = []
    const sorcery = []
    const secretsocieties = []

    // Iterate through items, allocating to containers
    // let totalWeight = 0
    for (const i of data.items) {
      const item = i.data

      // Append to item types to their arrays
      if (i.type === 'advantage') {
        advantages.push(i)
      } else if (i.type === 'background') {
        backgrounds.push(i)
      } else if (i.type === 'sorcery') {
        sorcery.push(i)
      } else if (i.type === 'secretsociety') {
        secretsocieties.push(i)
      }
    }

    // Assign and return
    actorData.advantages = advantages
    actorData.backgrounds = backgrounds
    actorData.sorcery = sorcery
    actorData.secretsocieties = secretsocieties
  }
}
