import ActorSheetSS2e from './base.js';
import { getItems, skillsToSheetData } from '../../helpers.js';
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
  _prepareHeroItems(data, sheetData) {
    // Assign and return
    sheetData.skills = skillsToSheetData(data.document.system, CONFIG);
    sheetData.advantages = getItems(data, 'advantage');
    sheetData.backgrounds = getItems(data, 'background');
    sheetData.sorcery = getItems(data, 'sorcery');
    sheetData.secretsocieties = getItems(data, 'secretsociety');
    sheetData.stories = getItems(data, 'story');
    sheetData.duelstyles = getItems(data, 'duelstyle');
    sheetData.artifacts = getItems(data, 'artifact');
    sheetData.virtues = getItems(data, 'virtue');
    sheetData.hubriss = getItems(data, 'hubris');
  }
}
