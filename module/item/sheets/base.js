import {
  SVNSEA2E
} from '../../config.js'
import SkillSelector from '../../apps/skill-selector.js'
import AdvantageSelector from '../../apps/advantage-selector.js'

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class ItemSheetSS2e extends ItemSheet {
  /** @override */
  static get defaultOptions () {
    return mergeObject(super.defaultOptions, {
      classes: ['svnsea2e', 'sheet', 'item'],
      width: 600,
      height: 700
    })
  }

  /* -------------------------------------------- */

  /** @override */
  getData () {
    const data = super.getData()
    const isOwner = this.entity.owner
    mergeObject(data, {
      owner: isOwner,
      itemType: SVNSEA2E.itemTypes[data.item.type],
      options: this.options,
      editable: this.isEditable,
      cssClass: isOwner ? 'editable' : 'locked',
      config: CONFIG.SVNSEA2E,
      dtypes: ['String', 'Number', 'Boolean']
    })

    if (data.item.type === 'background') {
      this._prepareBackground(data.item.data)
    }
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

    html.find('.skill-selector').click(this._onSkillSelector.bind(this))
    html.find('.advantage-selector').click(this._onAdvantageSelector.bind(this))
  }

  /* -------------------------------------------- */

  /**
   * Prepare the Skills that the Actor has selected for use with the SkillSelector application
   * @param {Object} data       The data transfer
   * @private
   */
  _prepareBackground (data) {
    data.selectedskills = {}
    for (let i = 0; i < data.skills.length; i++) {
      console.log(data.skills[i], CONFIG.SVNSEA2E.skills[data.skills[i]])
      data.selectedskills[data.skills[i]] = CONFIG.SVNSEA2E.skills[data.skills[i]]
    }

    data.selectedadvantages = {}

    const alladvantages = this._getAllAdvantages()
    for (let i = 0; i < data.advantages.length; i++) {
      console.log(data.advantages[i], alladvantages[i])
      data.selectedadvantages[data.advantages[i]] = alladvantages[data.advantages[i]]
    }
  }

  _getAllAdvantages () {
    const advantages = {}
    const items = game.items.directory.entities
    for (let i = 0; i < items.length; i++) {
      if (items[i].type === 'advantage') {
        advantages[items[i]._id] = items[i].name
      }
    }
    return advantages
  }

  /* -------------------------------------------- */

  /**
   * Handle spawning the skillSelector application which allows a checkbox of multiple skill options
   * @param {Event} event   The click event which originated the selection
   * @private
   */
  _onSkillSelector (event) {
    event.preventDefault()
    const a = event.currentTarget
    const options = {
      title: game.i18n.localize('SVNSEA2E.Skills'),
      choices: CONFIG.SVNSEA2E[a.dataset.options]
    }
    new SkillSelector(this.item, options).render(true)
  }

  /* -------------------------------------------- */

  /**
   * Handle spawning the advantageSelector application which allows a checkbox of multiple advantage options
   * @param {Event} event   The click event which originated the selection
   * @private
   */
  _onAdvantageSelector (event) {
    event.preventDefault()
    const a = event.currentTarget
    const options = {
      title: game.i18n.localize('SVNSEA2E.Advantages'),
      choices: this._getAllAdvantages()
    }
    new AdvantageSelector(this.item, options).render(true)
  }
}
