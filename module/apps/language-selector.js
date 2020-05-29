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
      title: 'Actor Trait Selection',
      template: 'systems/svnsea2e/templates/apps/language-selector.html',
      width: 320,
      height: 'auto',
      choices: {},
      allowCustom: true,
      minimum: 0,
      maximum: null
    })
  }

  /* -------------------------------------------- */

  /**
   * Return a reference to the target attribute
   * @type {String}
   */
  get attribute () {
    return this.options.name
  }

  /* -------------------------------------------- */

  /** @override */
  getData () {
    // Get current values
    const attr = getProperty(this.object.data, this.attribute) || {}
    attr.value = attr.value || []

    // Populate choices
    const choices = duplicate(this.options.choices)
    for (const [k, v] of Object.entries(choices)) {
      choices[k] = {
        label: v,
        chosen: attr ? attr.value.includes(k) : false
      }
    }

    // Return data
	  return {
      allowCustom: this.options.allowCustom,
	    choices: choices,
      custom: attr ? attr.custom : ''
    }
  }

  /* -------------------------------------------- */

  /** @override */
  _updateObject (event, formData) {
    const updateData = {}

    // Obtain choices
    const chosen = []
    for (const [k, v] of Object.entries(formData)) {
      if ((k !== 'custom') && v) chosen.push(k)
    }
    updateData[`${this.attribute}.value`] = chosen

    // Update the object
    this.object.update(updateData)
  }
}
