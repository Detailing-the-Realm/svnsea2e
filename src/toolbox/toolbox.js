/**
 * L5R GM Toolbox dialog
 * @extends {FormApplication}
 */
export class Toolbox extends FormApplication {
  /**
   * Settings
   */
  object = {};

  /**
   * Assign the default options
   * @override
   */
  static get defaultOptions() {
    const x = $(window).width();
    const y = $(window).height();
    return mergeObject(super.defaultOptions, {
      id: 'svnsea-toolbox',
      classes: ['toolbox'],
      template: 'systems/svnsea2e/templates/toolbox/toolbox.html',
      title: game.i18n.localize('SVNSEA2E.Toolbox'),
      left: x - 650,
      top: 20,
      width: 300,
      closeOnSubmit: false,
      submitOnClose: false,
      submitOnChange: true,
      minimizable: true,
      resizable: true,
      dragDrop: [{ dropSelector: '.items' }],
    });
  }

  /**
   * Constructor
   * @param {ApplicationOptions} options
   */
  constructor(options = {}) {
    super(options);
    this._initialize();
  }

  /**
   * Refresh data (used from socket)
   */
  async refresh() {
    if (!game.user.isGM) {
      return;
    }
    this.object.showActors = this.object.items.map((it) =>
      game.actors.find((a) => `Actor.${a.id}` === it),
    );
    this.render(false);
  }

  /**
   * Initialize the values
   * @private
   */
  _initialize() {
    this.object = {
      items: [],
    };
  }

  /**
   * @override
   */
  render(force = false, options = {}) {
    if (!game.user.isGM) {
      return;
    }
    this.position.height = 'auto';
    return super.render(force, options);
  }

  /**
   * Construct and return the data object used to render the HTML template for this form application.
   * @param options
   * @return {Object}
   * @override
   */
  async getData(options = null) {
    const data = await super.getData(options);
    return {
      ...data,
    };
  }

  /**
   * Listen to html elements
   * @param {jQuery} html HTML content of the sheet.
   * @override
   */
  activateListeners(html) {
    super.activateListeners(html);
  }

  /**
   * This method is called upon form submission after form data is validated
   * @param event    The initial triggering submission event
   * @param formData The object of validated form data with which to update the object
   * @returns        A Promise which resolves once the update operation has completed
   * @override
   */
  async _updateObject(event, formData) {
    this.render(false);
  }

  /** @override */
  async _onDrop(event) {
    if (!game.user.isGM) {
      return;
    }
    event.preventDefault();

    // Get dropped data
    let data;
    try {
      data = JSON.parse(event.dataTransfer.getData('text/plain'));
    } catch (err) {
      return false;
    }
    if (!data) return false;

    // Case 2 - Dropped Actor
    if (data.type === 'Actor') {
      return this._onDropActor(event, data);
    }
  }

  /**
   * Handle dropping an Actor on the sheet to trigger a Polymorph workflow
   * @param {DragEvent} event   The drop event
   * @param {Object} data       The data transfer
   * @return {Object}           OwnedItem data _getIndexeso create
   * @private
   */
  async _onDropActor(event, data) {
    this.object.items.push(data.uuid);
    this.refresh();
  }
}
