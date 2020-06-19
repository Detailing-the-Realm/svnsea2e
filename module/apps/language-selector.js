/**
 * A specialized form used to select from a checklist of attributes, languages, or properties
 * @extends {FormApplication}
 */
export default class LanguageSelector extends FormApplication {
  /** @override */
  static get defaultOptions () {
    return mergeObject(super.defaultOptions, {
      id: 'language-selector',
      classes: ['svnsea2e'],
      title: game.i18n.localize('SVNSEA2E.ActorLangSelect'),
      template: 'systems/svnsea2e/templates/apps/language-selector.html',
      width: 320,
      height: 'auto',
      choices: {},
      minimum: 0,
      maximum: null
    })
  }

  /* -------------------------------------------- */

  /** @override */
  getData () {
    // Get current values
    const langs = this.object.data.data.languages

    // Populate choices
    const choices = duplicate(this.options.choices)
    for (const [k, v] of Object.entries(choices)) {
      choices[k] = {
        label: v,
        chosen: langs ? langs.includes(k) : false
      }
    }

    // Return data
    return {
      choices: choices
    }
  }

  /* -------------------------------------------- */

  /** @override */
  _updateObject (event, formData) {
    const updateData = {}

    // Obtain choices
    const chosen = []

    for (const [k, v] of Object.entries(formData)) {
      if (v) {
        chosen.push(k)
      }
    }

    updateData['data.languages'] = chosen

    if (this.options.minimum && (chosen.length < this.options.minimum)) {
      return ui.notifications.error(game.i18n.format('SVNSEA2E.AtLeastOptions', {
        min: this.options.minimum
      }))
    }
    if (this.options.maximum && (chosen.length > this.options.maximum)) {
      return ui.notifications.error(game.i18n.format('SVNSEA2E.AtLeastOptions', {
        max: this.options.maximum
      }))
    }

    // Update the object
    this.object.update(updateData)
  }
}
