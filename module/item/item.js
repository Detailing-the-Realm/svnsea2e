/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class SvnSea2EItem extends Item {
  /**
   * Augment the basic Item data model with additional dynamic data.
   */
  prepareData () {
    super.prepareData()

    // Get the Item's data
    const itemData = this.data
    const actorData = this.actor ? this.actor.data : {}
    const data = itemData.data
  }

  /**
   * Prepare an object of chat data used to display a card for the Item in the chat log
   * @param {Object} htmlOptions    Options used by the TextEditor.enrichHTML function
   * @return {Object}               An object of chat data to render
   */
  getChatData (htmlOptions) {
    const data = duplicate(this.data.data)

    // Rich text description
    data.description = TextEditor.enrichHTML(data.description, htmlOptions)

    // Item type specific properties
    data.metadata = []
    const fn = this[`_${this.data.type}ChatData`]
    if (fn) fn.bind(this)(data)
console.log(data)
    return data
  }

  /**
     * Prepare chat data for an advantage
     * @param {Object} data    Options used by the TextEditor.enrichHTML function
     * @return {Object}               An object of chat data to render
     */
  _advantageChatData (data) {
    data.metadata.push(game.i18n.format('SVNSEA2E.AdvantageCost', {
      cost: data.cost.normal,
      special: data.cost.specreq ? ' (' + data.cost.specreq + ')' : ''
    }),
    data.knack ? game.i18n.localize('SVNSEA2E.Knack') : '',
    data.innate ? game.i18n.localize('SVNSEA2E.Innate') : ''
    )
    return data
  }
}
