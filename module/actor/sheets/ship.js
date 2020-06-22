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
   * Process any flags that the actor might have that would affect the sheet .
   *
   * @param {Obejct} data The data object to update with any flag data.
   * @param {Object} flags The set of flags for the Actor
   */
  _processFlags (data, flags) {
    let svnsea2e = flags.svnsea2e

    if (!starfinder) starfinder = {}
    if (!starfinder.shipsCrew) starfinder.shipsCrew = {}
    if (!starfinder.shipsCrew.members) starfinder.shipsCrew.members = []

    // TODO: There are two more roles added in the Character Operations Manual that need to be added.

    const crew = {
      midshipmen: { label: 'Midshipmen', actors: [], dataset: { type: 'shipsCrew', role: 'midshipmen' } },
      captain: { label: 'Captain', actors: [], dataset: { type: 'shipsCrew', role: 'captain' } },
      boatswain: { label: 'Boatswain', actors: [], dataset: { type: 'shipsCrew', role: 'boatswain' } },
      shipsmaster: { label: 'Ship\'s Master', actors: [], dataset: { type: 'shipsCrew', role: 'shipsmaster' } },
      mastergunner: { label: 'Master Gunner', actors: [], dataset: { type: 'shipsCrew', role: 'mastergunner' } },
      mastermariner: { label: 'Master Mariner', actors: [], dataset: { type: 'shipsCrew', role: 'mastermariner' } },
      ableseaman: { label: 'Able Seaman', actors: [], dataset: { type: 'shipsCrew', role: 'ableseaman' } },
      seaman: { label: 'Seaman', actors: [], dataset: { type: 'shipsCrew', role: 'seaman' } },
      surgeon: { label: 'Surgeon', actors: [], dataset: { type: 'shipsCrew', role: 'surgeon' } }
    }

    const [captian, engineers, gunners, pilot, scienceOfficers, passengers] = starfinder.shipsCrew.members.reduce((arr, id) => {
      const actor = game.actors.get(id)

      if (!actor) return arr

      const crewMember = actor.getFlag('starfinder', 'crewMember') || null
      if (!crewMember) return arr

      actor.data.img = actor.data.img || DEFAULT_TOKEN

      if (crewMember.role === 'captain') arr[0].push(actor)
      else if (crewMember.role === 'engineers') arr[1].push(actor)
      else if (crewMember.role === 'gunners') arr[2].push(actor)
      else if (crewMember.role === 'pilot') arr[3].push(actor)
      else if (crewMember.role === 'scienceOfficers') arr[4].push(actor)
      else if (crewMember.role === 'passengers') arr[5].push(actor)

      return arr
    }, [[], [], [], [], [], []])

    crew.captain.actors = captian
    crew.engineers.actors = engineers
    crew.gunners.actors = gunners
    crew.pilot.actors = pilot
    crew.scienceOfficers.actors = scienceOfficers
    crew.passengers.actors = passengers

    data.crew = Object.values(crew)
  }
}
