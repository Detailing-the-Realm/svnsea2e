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

    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    if (actorData.type === 'playercharacter') this._preparePlayerCharacterData(actorData)
    if (actorData.type === 'hero') this._prepareHeroData(actorData)
    if (actorData.type === 'villian') this._prepareVillianData(actorData)
    if (actorData.type === 'monster') this._prepareMonsterData(actorData)
    if (actorData.type === 'brute') this._prepareBruteData(actorData)
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
  _preparePlayerCharacterData (actorData) {
    const data = actorData.data
    data.wounds.value = this._validateMinMaxData(data.wounds.value, data.wounds.min, data.wounds.max)
    data.dwounds.value = this._validateMinMaxData(data.dwounds.value, data.dwounds.min, data.dwounds.max)
    this._prepareTraits(data)
    this._prepareSkills(data)
  }

  /**
   * Prepare Hero type specific data
   */
  _prepareHeroData (actorData) {
    const data = actorData.data
    data.wounds.value = this._validateMinMaxData(data.wounds.value, data.wounds.min, data.wounds.max)
    data.dwounds.value = this._validateMinMaxData(data.dwounds.value, data.dwounds.min, data.dwounds.max)
    this._prepareTraits(data)
    this._prepareSkills(data)
  }

  /**
   * Prepare Villian type specific data
   */
  _prepareVillianData (actorData) {
    const data = actorData.data
    this._prepareTraits(data)
    data.traits.villiany = {
      value: (data.traits.strength.value + data.traits.influence.value),
      label: CONFIG.SVNSEA2E.traits.villiany
    }
  }

  /**
   * Prepare Villian type specific data
   */
  _prepareMonsterData (actorData) {
    const data = actorData.data
    this._prepareTraits(data)
    data.traits.villiany = {
      value: (data.traits.strength.value + data.traits.influence.value),
      label: CONFIG.SVNSEA2E.traits.villiany
    }
  }

  /**
   * Prepare Villian type specific data
   */
  _prepareBruteData (actorData) {
    const data = actorData.data
    data.traits.strength.value = this._validateMinMaxData(data.traits.strength.value, data.traits.strength.min, data.traits.strength.max)
  }

  _prepareTraits (data) {
    for (const trait of Object.values(data.traits)) {
      trait.value = this._validateMinMaxData(trait.value, trait.min, trait.max)
    }
  }

  _prepareSkills (data) {
    for (const skill of Object.values(data.skills)) {
      skill.value = this._validateMinMaxData(skill.value, skill.min, skill.max)
    }
  }
}
