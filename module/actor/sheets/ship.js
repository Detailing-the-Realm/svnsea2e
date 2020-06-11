import ActorSheetSS2e from './base.js'

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class ActorSheetSS2eShip extends ActorSheetSS2e {
  /** @override */
  static get defaultOptions () {
    return mergeObject(super.defaultOptions, {
      classes: ['svnsea2e', 'sheet', 'actor'],
      template: 'systems/svnsea2e/templates/actors/ship.html',
      tabs: [{
        navSelector: '.sheet-tabs',
        contentSelector: '.sheet-body',
        initial: 'roster'
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
  _prepareShipActors (data) {
    const actorData = data.actor

    // Initialize containers.
    const pcs = []
    const npcs = []

    // Iterate through items, allocating to containers
    // let totalWeight = 0
    for (const i of data.items) {
      console.log(i)
      if (i.type === 'playercharacter') {
        pcs.push(i)
      } else if (i.type === 'hero' || i.type === 'villain') {
        npcs.push(i)
      }
    }

    // Assign and return
    actorData.pcs = pcs
    actorData.npcs = npcs
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareShipItems (data) {
    const itemData = data.item
  }
}
