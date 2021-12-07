import { SVNSEA2E } from '../../config.js';
import { ItemSheetSS2e } from './base.js';

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class ItemSheetSS2eHubris extends ItemSheetSS2e {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: 'systems/svnsea2e/templates/items/arcana.html',
      tabs: [
        {
          navSelector: '.sheet-tabs',
          contentSelector: '.sheet-body',
          initial: 'description',
        },
      ],
    });
  }
}
