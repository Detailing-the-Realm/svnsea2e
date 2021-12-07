import ActorSheetSS2e from './base.js';
import {
  getAdvantageItems,
  getArtifactItems,
  getHubrisItems,
  getSchemeItems,
  getSorceryItems,
  getVirtueItems,
} from '../../helpers.js';
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
  _prepareVillainItems(baseData, sheetData) {
    // Assign and return
    sheetData.villainy = baseData.data.data.villainy;
    sheetData.advantages = getAdvantageItems(baseData);
    sheetData.artifacts = getArtifactItems(baseData);
    sheetData.sorcery = getSorceryItems(baseData);
    sheetData.schemes = getSchemeItems(baseData);
    sheetData.virtues = getVirtueItems(baseData);
    sheetData.hubriss = getHubrisItems(baseData);
  }
}
