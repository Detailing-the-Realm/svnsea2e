/**
 * Extend the base Actor entity by definin`g` a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class SvnSea2EActor extends Actor {
  /**
   * Augment the basic actor data with additional dynamic data.
   */
  prepareData() {
    super.prepareData();

    const actorData = this.system;

    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    if (this.type === 'playercharacter')
      this._preparePlayerCharacterData(actorData);
    if (this.type === 'hero') this._prepareHeroData(actorData);
    if (this.type === 'villain' || this.type === 'monster')
      this._prepareVillainData(actorData);
    if (this.type === 'brute') this._prepareBruteData(actorData);
    if (this.type === 'ship') this._prepareShipData(actorData);
  }

  /**
   * Keep the value within the minimum and maxium values
   */
  _validateMinMaxData(value, min, max) {
    if (parseInt(value) > parseInt(max)) {
      return max;
    } else if (parseInt(value) < parseInt(min)) {
      return min;
    }
    return value;
  }

  /**
   * Prepare Character type specific data
   */
  _preparePlayerCharacterData(actorData) {
    this._prepareWounds(actorData);
    this._prepareTraits(actorData);
    this._prepareSkills(actorData);
  }

  /**
   * Prepare Hero type specific data
   */
  _prepareHeroData(actorData) {
    this._prepareWounds(actorData);
    this._prepareTraits(actorData);
    this._prepareSkills(actorData);
  }

  /**
   * Prepare Villain type specific data
   */
  _prepareVillainData(actorData) {
    this._prepareTraits(actorData);
    actorData.villainy =
      parseInt(actorData.traits.strength.value) +
      parseInt(actorData.traits.influence.value);
    actorData.wounds.max = parseInt(actorData.traits.strength.value) * 5;
    actorData.wounds.value = this._validateMinMaxData(
      actorData.wounds.value,
      actorData.wounds.min,
      actorData.wounds.max,
    );
  }

  /**
   * Prepare Brute type specific data
   */
  _prepareBruteData(actorData) {
    actorData.traits.strength.value = this._validateMinMaxData(
      actorData.traits.strength.value,
      actorData.traits.strength.min,
      actorData.traits.strength.max,
    );
    actorData.wounds.max = actorData.traits.strength.value;
    if (parseInt(actorData.wounds.max) < parseInt(actorData.wounds.value)) {
      actorData.wounds.value = actorData.wounds.max;
    }
  }

  /**
   * Prepare Ship type specific data
   */
  _prepareShipData(actorData) {}

  /**
   * Remove a member from the crew
   */
  async removeFromCrew() {
    await this.unsetFlag('svnsea2e', 'crewMember');
  }

  /**
   * Set a crew member's role
   */
  async setCrewMemberRole(shipId, role) {
    return this.setFlag('svnsea2e', 'crewMember', {
      shipId: shipId,
      role: role,
    });
  }

  /**
   *
   */
  _prepareTraits(actorData) {
    for (const trait of Object.values(actorData.traits)) {
      trait.value = this._validateMinMaxData(trait.value, trait.min, trait.max);
    }
  }

  /**
   *
   */
  _prepareSkills(actorData) {
    for (const skill of Object.values(actorData.skills)) {
      skill.value = this._validateMinMaxData(skill.value, skill.min, skill.max);
    }
  }

  /**
   * Establish the wound values based on the min and max for the actor type
   */
  _prepareWounds(actorData) {
    actorData.wounds.value = this._validateMinMaxData(
      actorData.wounds.value,
      actorData.wounds.min,
      actorData.wounds.max,
    );
  }
}
