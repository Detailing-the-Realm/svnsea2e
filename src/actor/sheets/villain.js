import ActorSheetSS2e from './base.js';
import { getItems } from '../../helpers.js';
/**
 * Extend the basic ActorSheet with some very simple modifications
 * @ext'../../dice.js't}
 */
export class ActorSheetSS2eVillain extends ActorSheetSS2e {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['svnsea2e', 'sheet', 'actor', 'villain'],
      template: 'systems/svnsea2e/templates/actors/villain.html',
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
  _prepareVillainItems(data, sheetData) {
    // Assign and return
    sheetData.villainy = data.document.system.villainy;
    sheetData.advantages = getItems(data, 'advantage');
    sheetData.artifacts = getItems(data, 'artifact');
    sheetData.sorcery = getItems(data, 'sorcery');
    sheetData.schemes = getItems(data, 'scheme');
    sheetData.virtues = getItems(data, 'virtue');
    sheetData.hubriss = getItems(data, 'hubris');
    sheetData.monsterqualities = getItems(data, 'monsterquality');
  }
}
