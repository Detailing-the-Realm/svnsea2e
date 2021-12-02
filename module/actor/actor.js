/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class SvnSea2EActor extends Actor {
  /**
   * Augment the basic actor data with additional dynamic data.
   */
  prepareData() {
    super.prepareData();

    const actorData = this.data;
    const data = actorData.data;

    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    if (actorData.type === 'playercharacter')
      this._preparePlayerCharacterData(data);
    if (actorData.type === 'hero') this._prepareHeroData(data);
    if (actorData.type === 'villain' || actorData.type === 'monster')
      this._prepareVillainData(data);
    if (actorData.type === 'brute') this._prepareBruteData(data);
    if (actorData.type === 'ship') this._prepareShipData(data);
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
  _preparePlayerCharacterData(data) {
    this._prepareWounds(data);
    this._prepareTraits(data);
    this._prepareSkills(data);
  }

  /**
   * Prepare Hero type specific data
   */
  _prepareHeroData(data) {
    this._prepareWounds(data);
    this._prepareTraits(data);
    this._prepareSkills(data);
  }

  /**
   * Prepare Villain type specific data
   */
  _prepareVillainData(data) {
    this._prepareTraits(data);
    data.villainy =
      parseInt(data.traits.strength.value) +
      parseInt(data.traits.influence.value);
    data.wounds.max = parseInt(data.traits.strength.value) * 5;
    data.wounds.value = this._validateMinMaxData(
      data.wounds.value,
      data.wounds.min,
      data.wounds.max,
    );
  }

  /**
   * Prepare Brute type specific data
   */
  _prepareBruteData(data) {
    data.traits.strength.value = this._validateMinMaxData(
      data.traits.strength.value,
      data.traits.strength.min,
      data.traits.strength.max,
    );
    data.wounds.max = data.traits.strength.value;
    if (parseInt(data.wounds.max) < parseInt(data.wounds.value)) {
      data.wounds.value = data.wounds.max;
    }
  }

  /**
   * Prepare Ship type specific data
   */
  _prepareShipData(data) {}

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
  _prepareTraits(data) {
    for (const trait of Object.values(data.traits)) {
      trait.value = this._validateMinMaxData(trait.value, trait.min, trait.max);
    }
  }

  /**
   *
   */
  _prepareSkills(data) {
    for (const skill of Object.values(data.skills)) {
      skill.value = this._validateMinMaxData(skill.value, skill.min, skill.max);
    }
  }

  /**
   * Establish the wound values based on the min and max for the actor type
   */
  _prepareWounds(data) {
    data.wounds.value = this._validateMinMaxData(
      data.wounds.value,
      data.wounds.min,
      data.wounds.max,
    );
  }
}
