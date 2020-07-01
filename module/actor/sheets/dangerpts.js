import ActorSheetSS2e from './base.js'

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class ActorSheetSS2eDangerPts extends ActorSheetSS2e {
  /** @override */
  static get defaultOptions () {
    return mergeObject(super.defaultOptions, {
      classes: ['svnsea2e', 'sheet', 'actor'],
      template: 'systems/svnsea2e/templates/actors/dangerpts.html',
      tabs: [{
        contentSelector: '.sheet-body'
      }],
      width: 400,
      height: 400
    })
  }

  /**
   * Activate event listeners using the prepared sheet HTML
   *
   * @param {HTML} html The prepared HTML object ready to be rendered into the DOM
   */
  activateListeners (html) {
    super.activateListeners(html)

    html.find('.dpminus').click(this._decreaseDP.bind(this))

    html.find('.dpplus').click(this._increaseDP.bind(this))
  }

  _decreaseDP (event) {
    let dp = 0
    if (this.actor.data.data.points > 1) {
      dp = this.actor.data.data.points - 1
    }

    this.actor.update({
      'data.points': dp
    }).then(this.render(false))
  }

  _increaseDP (event) {
    const dp = this.actor.data.data.points + 1

    this.actor.update({
      'data.points': dp
    }).then(this.render(false))
  }
}
