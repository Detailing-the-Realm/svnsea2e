import ActorSheetSS2e from './base.js';
/**
 * Extend the basic ActorSheet with some very simple modifications
 * @ext'../../dice.js't}
 */
export class ActorSheetSS2eBrute extends ActorSheetSS2e {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['svnsea2e', 'sheet', 'actor', 'brute'],
      template: 'systems/svnsea2e/templates/actors/brute.html',
      tabs: [
        {
          navSelector: '.sheet-tabs',
          contentS: 'ability',
        },
      ],
    });
  }
}
