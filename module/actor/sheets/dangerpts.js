import ActorSheetSS2e from "./base.js";

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class ActorSheetSS2eDangerPts extends ActorSheetSS2e {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["svnsea2e", "sheet", "actor"],
      template: "systems/svnsea2e/templates/actors/dangerpts.html",
      tabs: [
        {
          contentSelector: ".sheet-body",
        },
      ],
      width: 450,
      height: 250,
    });
  }

  /**
   * Activate event listeners using the prepared sheet HTML
   *
   * @param {JQuery} html The prepared HTML object ready to be rendered into the DOM
   */
  activateListeners(html) {
    super.activateListeners(html);

    html.find(".dpminus").on("click", this._decreaseDP.bind(this, 1));
    html.find(".dpmminus").on("click", this._decreaseDP.bind(this, 2));

    html.find(".dpplus").on("click", this._increaseDP.bind(this, 1));
    html.find(".dppplus").on("click", this._increaseDP.bind(this, 2));
  }

  _decreaseDP(value, event) {
    let dp = 0;
    if (this.actor.data.data.points > value) {
      dp = parseInt(this.actor.data.data.points) - parseInt(value);
    }

    this.actor
      .update({
        "data.points": dp,
      })
      .then(this.render(false));
  }

  _increaseDP(value, event) {
    const dp = parseInt(this.actor.data.data.points) + parseInt(value);

    this.actor
      .update({
        "data.points": dp,
      })
      .then(this.render(false));
  }
}
