import ActorSheetSS2e from './base.js';
import { getItems } from '../../helpers.js';
/**
 * Extend the basic ActorSheet with some very simple modifications
 * @ext'../../dice.js't}
 */
export class ActorSheetSS2eMonster extends ActorSheetSS2e {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['svnsea2e', 'sheet', 'actor', 'monster'],
      template: 'systems/svnsea2e/templates/actors/monster.html',
      tabs: [
        {
          navSelector: '.sheet-tabs',
          contentSelector: '.sheet-body',
          initial: 'features',
        },
      ],
    });
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actor The actor data to prepare.
   * @param {Object} sheetData The sheet to prepare.
   *
   * @return {undefined}
   */
  _prepareMonsterItems(data, sheetData) {
    sheetData.fear = data.document.system.fear;
    sheetData.monsterqualities = getItems(data, 'monsterquality');
  }
}
