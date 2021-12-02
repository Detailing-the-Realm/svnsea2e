import ActorSheetSS2e from './base.js';
import {
  getAdvantageItems,
  getArtifactItems,
  getBackgroundItems,
  getDuelStyleItems,
  getSecretSocietyItems,
  getSorceryItems,
  getStoryItems,
  skillsToSheetData,
} from '../../helpers.js';
/**
 * Extend the basic ActorSheet with some very simple modifications
 * @ext'../../dice.js't}
 */
export class ActorSheetSS2eHero extends ActorSheetSS2e {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['svnsea2e', 'sheet', 'actor', 'hero'],
      template: 'systems/svnsea2e/templates/actors/hero.html',
      tabs: [
        {
          navSelector: '.sheet-tabs',
          contentSelector: '.sheet-body',
          initial: 'traits',
        },
      ],
    });
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareHeroItems(baseData, sheetData) {
    // Assign and return
    sheetData.skills = skillsToSheetData(baseData, CONFIG);
    sheetData.advantages = getAdvantageItems(baseData);
    sheetData.backgrounds = getBackgroundItems(baseData);
    sheetData.sorcery = getSorceryItems(baseData);
    sheetData.secretsocieties = getSecretSocietyItems(baseData);
    sheetData.stories = getStoryItems(baseData);
    sheetData.duelstyles = getDuelStyleItems(baseData);
    sheetData.artifacts = getArtifactItems(baseData);
  }
}
