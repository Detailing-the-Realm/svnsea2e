import { SVNSEA2E } from '../config.js'

/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class SvnSea2EActor extends Actor {
  /**
   * Augment the basic actor data with additional dynamic data.
   */
  prepareData () {
    super.prepareData()

    const actorData = this.data
    const data = actorData.data
    const flags = actorData.flags
    console.log(data)

    data.wounds.value = this._validateMinMaxData(data.wounds.value, data.wounds.min, data.wounds.max)
    data.dwounds.value = this._validateMinMaxData(data.dwounds.value, data.dwounds.min, data.dwounds.max)

    for (const trait of Object.values(data.traits)) {
      trait.value = this._validateMinMaxData(trait.value, trait.min, trait.max)
    }

    for (const skill of Object.values(data.skills)) {
      skill.value = this._validateMinMaxData(skill.value, skill.min, skill.max)
    }
    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    if (actorData.type === 'character') this._prepareCharacterData(actorData)
    if (actorData.type === 'npc') this._prepareNPCData(actorData)
  }

  _validateMinMaxData (value, min, max) {
    if (value > max) {
      return max
    } else if (value < min) {
      return min
    }
    return value
  }

  /**
   * Prepare Character type specific data
   */
  _prepareCharacterData (actorData) {
    const data = actorData.data

    // Make modifications to data here. For example:
  }

  /**
   * Prepare NPC type specific data
   */
  _prepareNPCData (actorData) {
    const data = actorData.data

    // Make modifications to data here. For example:
  }
}
