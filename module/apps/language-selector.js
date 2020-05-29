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
      title: 'Actor Language Selection',
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
    console.log('lang select get data: ', this.options.choices)
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
    console.log(this.attribute)
    for (const [k, v] of Object.entries(formData)) {
      console.log(v)
      if (v) {
        chosen.push(k)
      }
    }
    console.log(chosen)
    updateData['data.languages'] = chosen

    if (this.options.minimum && (chosen.length < this.options.minimum)) {
      return ui.notifications.error(`You must choose at least ${this.options.minimum} options`)
    }
    if (this.options.maximum && (chosen.length > this.options.maximum)) {
      return ui.notifications.error(`You may choose no more than ${this.options.maximum} options`)
    }

    console.log(updateData)

    // Update the object
    this.object.update(updateData)
  }
}
