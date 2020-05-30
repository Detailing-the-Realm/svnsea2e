import {
  SVNSEA2E
} from '../../config.js'

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class ItemSheetSS2e extends ItemSheet {
  /** @override */
  static get defaultOptions () {
    return mergeObject(super.defaultOptions, {
      classes: ['svnsea2e', 'sheet', 'item'],
      width: 520,
      height: 480
    })
  }

  /* -------------------------------------------- */

  /** @override */
  getData () {
    const data = super.getData()
    data.itemType = SVNSEA2E.itemTypes[data.item.type] // this should be translated
    return data
  }

  /* -------------------------------------------- */

  /** @override */
  setPosition (options = {}) {
    const position = super.setPosition(options)
    const sheetBody = this.element.find('.sheet-body')
    const bodyHeight = position.height - 192
    sheetBody.css('height', bodyHeight)
    return position
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners (html) {
    super.activateListeners(html)

    // Everything below here is only needed if the sheet is editable
    // if (!this.options.editable) return;

    // Roll handlers, click handlers, etc. would go here.
  }
}
