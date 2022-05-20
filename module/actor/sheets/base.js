import LanguageSelector from '../../apps/language-selector.js';
import { updateInitiative } from '../../combat.js';
import { roll } from '../../roll/roll.js';

/**
 * Extend the basic ActorSheet class to do all the 7th Sea things!
 * This sheet is an Abstract layer which is not used.
 * @extends {ActorSheet}
 */
export default class ActorSheetSS2e extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      width: 850,
      height: 750,
    });
  }

  /* -------------------------------------------- */

  /** @override */
  getData(options) {
    const baseData = super.getData(options);
    console.log(baseData);
    const { isOwner: owner, limited } = this.document;
    const sheetData = {
      owner,
      limited,
      options: this.options,
      editable: this.isEditable,
      cssClass: owner ? 'editable' : 'locked',
      isCorrupt: this.document.data.data.corruptionpts > 0,
      isPlayerCharacter: this.document.data.type === 'playercharacter',
      isHero: this.document.data.type === 'hero',
      isVillain: this.document.data.type === 'villain',
      isMonster: this.document.data.type === 'monster',
      isNotBrute: this.document.data.type !== 'brute',
      hasSkills: typeof this.document.data.data.skills !== 'undefined',
      hasLanguages: typeof this.document.data.data.languages !== 'undefined',
      config: CONFIG.SVNSEA2E,
      dtypes: ['String', 'Number', 'Boolean'],

      // Core Actor data:
      name: this.actor.name,
      img: this.actor.img,
      initiative: this.actor.data.data.initiative,
      age: this.actor.data.data.age,
      nation: this.actor.data.data.nation,
      wealth: this.document.data.data.wealth,
      heropts: this.document.data.data.heropts,
      corruptionpts: this.document.data.data.corruptionpts,
      wounds: this.document.data.data.wounds,
      dwounds: this.document.data.data.dwounds,
      traits: this._prepareTraits(baseData),
      selectedlangs: this._prepareLanguages(baseData),

      // Concept tab.
      religion: baseData.data.data.religion,
      reputation: baseData.data.data.reputation,
      concept: baseData.data.data.concept,
      arcana: baseData.data.data.arcana,

      // Inventory Tab
      equipment: baseData.data.data.equipment,
    };

    // Prepare items.
    if (this.actor.data.type === 'playercharacter') {
      this._prepareCharacterItems(baseData, sheetData);
    } else if (this.actor.data.type === 'hero') {
      this._prepareHeroItems(baseData, sheetData);
      sheetData.selectedlangs = this._prepareLanguages(baseData);
    } else if (this.actor.data.type === 'villain') {
      this._prepareVillainItems(baseData, sheetData);
      sheetData.selectedlangs = this._prepareLanguages(baseData);
    } else if (this.actor.data.type === 'monster') {
      this._prepareMonsterItems(baseData, sheetData);
    } else if (this.actor.data.type === 'ship') {
      this._prepareShipItems(baseData, sheetData);
      this._processFlags(baseData, baseData.data.flags, sheetData);
    } else if (this.actor.data.type === 'dangerpts') {
      sheetData.points = baseData.data.data.points;
    } else if (this.actor.data.type === 'brute') {
      sheetData.ability = baseData.data.data.ability;
    }
    return sheetData;
  }

  /* -------------------------------------------- */

  _prepareButtonTitles(data) {
    for (const item of Object.values(data)) {
      item.editlabel = game.i18n.format('SVNSEA2E.EditLabel', {
        label: data.name,
      });
      item.deletelabel = game.i18n.format('SVNSEA2E.DeleteLabel', {
        label: data.name,
      });
    }
  }

  /* -------------------------------------------- */

  /**
   * Returns a sheet-friendly list of traits with the localized label.
   *
   * @param baseData
   * @returns {(*&{name: *, label: *})[]|*[]}
   * @private
   */
  _prepareTraits(baseData) {
    return !['ship', 'dangerpts'].includes(baseData.data.type)
      ? Object.entries(baseData.actor.data.data.traits).map(([t, trait]) => ({
          ...trait,
          name: t,
          label: CONFIG.SVNSEA2E.traits[t],
        }))
      : [];
  }

  /* -------------------------------------------- */
  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // language Selector
    html
      .find('.language-selector')
      .on('click', this._onLanguageSelector.bind(this));

    html
      .find('.add-1-initiative')
      .on('click', this._onAddInitiative.bind(this));
    html
      .find('.minus-1-initiative')
      .on('click', this._onMinusInitiative.bind(this));

    //Create Inventory Item
    html.find('.item-create').on('click', this._onItemCreate.bind(this));

    // Update Inventory Item
    html.find('.item-edit').on('click', this._onItemEdit.bind(this));

    // Delete Inventory Item
    html.find('.item-delete').on('click', this._onItemDelete.bind(this));

    //Expand item summary
    html
      .find('.item h4.item-name')
      .on('click', (event) => this._onItemSummary(event));

    // Rollable abilities.
    if (
      this.actor.data.type === 'playercharacter' ||
      this.actor.data.type === 'hero'
    ) {
      html.find('.rollable').on('click', this._onHeroRoll.bind(this));
    } else if (
      this.actor.data.type === 'villain' ||
      this.actor.data.type === 'monster'
    ) {
      html.find('.rollable').on('click', this._onVillainRoll.bind(this));
    }

    html
      .find('.fillable.fa-circle')
      .on('click', (event) => this._processCircle(event));
    if (this.actor.data.type === 'brute') {
      html
        .find('.fillable.fa-heart')
        .on('click', (event) => this._processBruteWounds(event));
    } else {
      html
        .find('.fillable.fa-heart')
        .on('click', (event) => this._processWounds(event));
    }

    // Drag events for macros.
    if (this.actor.isOwner) {
      const handler = (ev) => this._onDragItemStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains('inventory-header')) return;
        li.setAttribute('draggable', true);
        li.addEventListener('dragstart', handler, false);
      });
    }
  }

  _onAddInitiative(event) {
    event.preventDefault();
    const initiative = (this.actor.data.data.initiative || 0) + 1;
    updateInitiative(this.actor.id, initiative);
  }

  _onMinusInitiative(event) {
    event.preventDefault();
    const initiative = (this.actor.data.data.initiative || 0) - 1;
    updateInitiative(this.actor.id, initiative);
  }

  /* -------------------------------------------- */

  /**
   * Prepare the Languages that the Actor has selected for use with the LanguageSelector application
   * @param {Object} baseData       The base data
   * @private
   */
  _prepareLanguages(baseData) {
    // Languages only apply to PCs, heroes, or villains.
    if (!['playercharacter', 'hero', 'villain'].includes(baseData.data.type))
      return undefined;

    return baseData.actor.data.data.languages.reduce(
      (languages, language) => ({
        ...languages,
        [language]: CONFIG.SVNSEA2E.languages[language],
      }),
      {},
    );
  }

  /* -------------------------------------------- */

  /**
   * Process the effects of clicking on a circle
   * @param {Object} event      event sent
   * @private
   */
  async _processCircle(event) {
    const actor = this.actor;
    const actorData = actor.data.data;
    const dataSet = event.target.dataset;
    let updateObj = {};
    let dataSetValue = parseInt(dataSet.value);

    let tval = 0;
    if (dataSetValue === 1) {
      switch (dataSet.type) {
        case 'skill':
          tval = actorData.skills[dataSet.key].value;
          break;
        case 'trait':
          if (dataSet.key === 'influence' || dataSet.key === 'strength') {
            tval = actorData.traits[dataSet.key].value;
          } else {
            dataSetValue = 2;
          }
          break;
        case 'corrupt':
          tval = actorData[dataSet.key];
          break;
        case 'fear':
          tval = actorData[dataSet.key].value;
          break;
      }

      if (tval === 1) {
        dataSetValue = 0;
      }
    }

    updateObj[dataSet.name] = dataSetValue;
    return actor.update(updateObj);
  }

  /* -------------------------------------------- */

  /**
   * When a wound heart is click properly set the values
   * @param {Object} event      event sent
   * @private
   */
  _processBruteWounds(event) {
    const actor = this.actor;
    let updateObj = {};
    updateObj['data.wounds.value'] = event.target.dataset.value;
    if (
      this.actor.data.data.wounds.value == 1 &&
      event.target.dataset.value == 1
    )
      updateObj['data.wounds.value'] = 0;

    actor.update(updateObj);
  }

  /* -------------------------------------------- */

  /**
   * When a wound heart is click properly set the values
   * @param {Object} event      event sent
   * @private
   */
  _processWounds(event) {
    const actor = this.actor;
    const data = this.actor.data.data;
    const edata = event.target.dataset;
    let updateObj = {};
    let wounds = data.wounds.value;
    let dwounds = data.dwounds.value;

    const eValue = +edata.value;

    if (edata.type === 'wounds') {
      wounds = eValue;
      dwounds = data.dwounds.value;
      const dwestimate = Math.trunc(wounds / 5);

      if (dwestimate > data.dwounds.value) dwounds = dwestimate;

      if (edata.value == 1 && data.wounds.value == 1) wounds = 0;
    } else {
      // If the event dramatic wound is larger than the current dramatic wound
      // increase the dramatic wound and the regular wounds
      if (eValue > data.dwounds.value) dwounds = eValue;
      else if (eValue == data.dwounds.value) dwounds = data.dwounds.value - 1;
      else dwounds = eValue;

      if (data.wounds.value > eValue * 5) wounds = eValue * 5;
    }

    updateObj['data.wounds.value'] = wounds;
    updateObj['data.dwounds.value'] = dwounds;

    actor.update(updateObj);
  }

  /* -------------------------------------------- */

  /**
   * Handle spawning the languageSelector application which allows a checkbox of multiple language options
   * @param {Event} event   The click event which originated the selection
   * @private
   */
  _onLanguageSelector(event) {
    event.preventDefault();
    const a = event.currentTarget;
    const options = {
      title: game.i18n.localize('SVNSEA2E.Languages'),
      choices: CONFIG.SVNSEA2E[a.dataset.options],
    };
    new LanguageSelector(this.actor, options).render(true);
  }

  /* -------------------------------------------- */

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset.
   * @param {Event} event          The originating click event.
   * @returns {Promise<Item5e[]>}  The newly created item.
   * @private
   */
  _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Prepare the item object.
    const itemData = {
      name: game.i18n.localize(`SVNSEA2E.New${type}`),
      img: `systems/svnsea2e/icons/${type}.jpg`,
      type: type,
      data: foundry.utils.deepClone(header.dataset),
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.data.type;

    // Finally, create the item!
    return this.actor.createEmbeddedDocuments('Item', [itemData]);
  }

  /* -------------------------------------------- */

  /**
   * Handle editing an existing Owned Item for the Actor.
   * @param {Event} event    The originating click event.
   * @returns {ItemSheet5e}  The rendered item sheet.
   * @private
   */
  _onItemEdit(event) {
    event.preventDefault();
    const li = event.currentTarget.closest('.item');
    const item = this.actor.items.get(li.dataset.itemId);
    return item.sheet.render(true);
  }

  /* -------------------------------------------- */

  /**
   * Handle deleting a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemDelete(event) {
    event.preventDefault();
    const li = event.currentTarget.closest('.item');
    const item = this.actor.items.get(li.dataset.itemId);

    if (item) {
      if (item.data.type === 'background')
        await this._processBackgroundDelete(item.data.data);

      return item.delete();
    }
  }

  /* -------------------------------------------- */

  /**
   * Handle rolling of an item from the Actor sheet, obtaining the Item instance and dispatching to it's roll method
   * @private
   */
  async _onItemSummary(event) {
    event.preventDefault();
    const li = $(event.currentTarget).closest('.item');
    const item = this.actor.items.get(li.data('itemId'));
    const chatData = item.getChatData({ secrets: this.actor.owner });

    // Toggle summary
    if (li.hasClass('expanded')) {
      const summary = li.children('.item-summary');
      summary.slideUp(200, () => summary.remove());
    } else {
      const div = $(`<div class="item-summary">${chatData.description}</div>`);
      const metadata = $(
        `<div class="item-metdata">${chatData.metadatahtml}</div>`,
      );
      div.append(metadata);
      li.append(div.hide());
      div.slideDown(200);
    }
    li.toggleClass('expanded');
  }

  /* -------------------------------------------- */

  /** @override */
  async _onDrop(event) {
    event.preventDefault();

    // Get dropped data
    let data;
    try {
      data = JSON.parse(event.dataTransfer.getData('text/plain'));
    } catch (err) {
      return false;
    }
    if (!data) return false;

    // Case 1 - Dropped Item
    if (data.type === 'Item') {
      return this._onDropItem(event, data);
    }

    // Case 2 - Dropped Actor
    if (data.type === 'Actor') {
      return this._onDropActor(event, data);
    }
  }

  /* -------------------------------------------- */

  /**
   * Handle dropping an Actor on the sheet to trigger a Polymorph workflow
   * @param {DragEvent} event   The drop event
   * @param {Object} data       The data transfer
   * @return {Object}           OwnedItem data _getIndexeso create
   * @private
   */
  async _onDropActor(event, data) {}

  /* -------------------------------------------- */

  /**
   * Handle dropping of an item reference or item data onto an Actor Sheet
   * @param {DragEvent} event     The concluding DragEvent which contains drop data
   * @param {Object} data         The data transfer extracted from the event
   * @return {Object}             OwnedItem data to create
   * @private
   */
  async _onDropItem(event, data) {
    if (!this.actor.isOwner) return false;
    const itemData = await this._getItemDropData(event, data);
    // Handle item sorting within the same Actor
    const actor = this.actor;
    const sameActor =
      data.actorId === actor.id ||
      (actor.isToken && data.tokenId === actor.token.id);
    if (sameActor) return this._onSortItem(event, itemData);

    if (itemData.type !== 'sorcery') {
      if (await this._doesActorHaveItem(itemData.type, itemData.name)) {
        return ui.notifications.error(
          game.i18n.format('SVNSEA2E.ItemExists', {
            type: itemData.type,
            name: itemData.name,
          }),
        );
      }
    }

    if (itemData.type === 'background') {
      if (
        itemData.data.nation === 'gisles' &&
        (this.actor.data.data.nation === 'highland' ||
          this.actor.data.data.nation === 'avalon' ||
          this.actor.data.data.nation === 'insmore')
      ) {
        await this._processBackgroundDrop(itemData);
        return await this.actor.createEmbeddedDocuments('Item', [itemData]);
      }
      if (
        itemData.data.nation !== 'none' &&
        itemData.data.nation !== this.actor.data.data.nation
      ) {
        return ui.notifications.error(
          game.i18n.format('SVNSEA2E.WrongNation', {
            bgnation: game.i18n.localize(
              CONFIG.SVNSEA2E.nations[itemData.data.nation],
            ),
            anation: game.i18n.localize(
              CONFIG.SVNSEA2E.nations[this.actor.data.data.nation],
            ),
            name: itemData.name,
          }),
        );
      }
      await this._processBackgroundDrop(itemData);
    }
    // Create the owned item
    return await this.actor.createEmbeddedDocuments('Item', [itemData]);
  }

  /* -------------------------------------------- */

  /**
   * TODO: A temporary shim method until Item.getDropData() is implemented
   * https://gitlab.com/foundrynet/foundryvtt/-/issues/2866
   * @param {DragEvent} event     The concluding DragEvent which contains drop data
   * @param {Object} data         The data transfer extracted from the event
   * @private
   */
  async _getActorDropData(event, data) {
    let actorData = null;

    // Case 1 - Import from a Compendium pack
    if (data.pack) {
      const pack = game.packs.get(data.pack);
      if (pack.metadata.entity !== 'Actor') return;
      const document = await pack.getDocument(data.id);
      actorData = document.data;
    } else if (data.data) {
      // Case 2 - Data explicitly provided
      actorData = data.data;
    } else {
      // Case 3 - Import from World entity
      const actor = game.actors.get(data.id);
      if (!actor) return;
      actorData = actor.data;
    }

    // Return a copy of the extracted data
    return duplicate(actorData);
  }

  /* -------------------------------------------- */

  /**
   * TODO: A temporary shim method until Item.getDropData() is implemented
   * https://gitlab.com/foundrynet/foundryvtt/-/issues/2866
   * @param {DragEvent} event     The concluding DragEvent which contains drop data
   * @param {Object} data         The data transfer extracted from the event
   * @private
   */
  async _getItemDropData(event, data) {
    let itemData = null;

    // Case 1 - Import from a Compendium pack
    if (data.pack) {
      const pack = game.packs.get(data.pack);
      if (pack.metadata.entity !== 'Item') return;
      const document = await pack.getDocument(data.id);
      itemData = document.data;
    } else if (data.data) {
      // Case 2 - Data explicitly provided
      itemData = data.data;
    } else {
      // Case 3 - Import from World entity
      const item = game.items.get(data.id);
      if (!item) return;
      itemData = item.data;
    }

    // Return a copy of the extracted data
    return duplicate(itemData);
  }

  /* -------------------------------------------- */

  /**
   * Process for modifying the character sheet when a background is dropped on it.
   * Backgrouds increase skills and add advantages
   * @param itemData for the item that has been dropped on the character sheet
   */
  async _processBackgroundDrop(data) {
    const actorData = this.actor.data.data;
    const packAdvs = game.svnsea2e.packAdvs;
    let bkgData = null;
    const updateData = {};

    // Case 1 - Import from a Compendium pack
    if (data.pack) {
      const pack = game.packs.get(data.pack);
      if (pack.metadata.entity !== 'Item') return;
      const document = await pack.getDocument(data.id);
      bkgData = document.data;
    } else if (data.data) {
      // Case 2 - Data explicitly provided
      bkgData = data.data;
    } else {
      // Case 3 - Import from World entity
      const item = game.items.get(data.id);
      if (!item) return;
      bkgData = item.data;
    }

    const skills = bkgData.skills;

    for (let i = 0; i < skills.length; i++) {
      const skill = skills[i];
      updateData['data.skills.' + skill + '.value'] =
        actorData.skills[skill].value + 1;
    }
    await this.actor.update(updateData);

    for (let a = 0; a < bkgData.advantages.length; a++) {
      // need to grab the advantage first from world then compendium
      let advantage = game.items
        .values()
        .find((entry) => entry.data.name === bkgData.advantages[a]);
      if (!advantage) {
        // now we see if it is in a compendium
        for (var p = 0; p < packAdvs.length; p++) {
          if (
            packAdvs[p].name.toLowerCase() ===
            bkgData.advantages[a].toLowerCase()
          ) {
            advantage = packAdvs[p];
            break;
          }
        }
      }

      if (!advantage) {
        ui.notifications.error(
          game.i18n.format('SVNSEA2E.ItemDoesntExist', {
            name: bkgData.advantages[a],
          }),
        );
        continue;
      }
      if (!advantage.name.toLowerCase().includes('sorcery')) {
        if (await this._doesActorHaveItem('advantage', advantage.name)) {
          ui.notifications.error(
            game.i18n.format('SVNSEA2E.ItemExists', {
              name: advantage.name,
            }),
          );
          continue;
        }
      }
      await this.actor.createEmbeddedDocuments('Item', [duplicate(advantage)]);
    }
  }

  /* -------------------------------------------- */

  /**
   * Process for modifying the character sheet when a background is dropped on it.
   * Backgrouds increase skills and add advantages
   * @param itemData data for the item that is being deleted
   */
  async _processBackgroundDelete(bkgData) {
    const actorData = this.actor.data.data;
    const updateData = {};
    for (let i = 0; i < bkgData.skills.length; i++) {
      const skill = bkgData.skills[i];
      updateData['data.skills.' + skill + '.value'] =
        actorData.skills[skill].value - 1;
    }
    await this.actor.update(updateData);

    const charAdvs = await this._getAdvantages();
    for (let i = 0; i < bkgData.advantages.length; i++) {
      for (let j = 0; j < charAdvs.length; j++) {
        if (charAdvs[j].data.name === bkgData.advantages[i]) {
          await this.actor.deleteEmbeddedDocuments('Item', [charAdvs[j].id]);
        }
      }
    }
  }

  /* -------------------------------------------- */

  /**
   * Determine if the actor as any item records associated with it.
   * @private
   */
  async _doesActorHaveItem(type, name) {
    let retVal = false;
    this.actor.items.forEach((element) => {
      if (element.type === type && element.name === name) {
        retVal = true;
      }
    });
    return retVal;
  }

  /* -------------------------------------------- */

  /**
   * Retrive the names of advantages
   * @private
   */
  async _getAdvantageNames() {
    return this.actor.items
      .filter((item) => item.type === 'advantage')
      .map((item) => item.name);
  }

  /* -------------------------------------------- */

  /**
   * Retrieve all advantages the character has assigned
   * @private
   */
  async _getAdvantages() {
    return this.actor.items.filter((item) => item.type === 'advantage');
  }

  /* -------------------------------------------- */

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  async _onHeroRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;
    const actor = this.actor;
    const data = this.actor.data.data;

    let skillValue = data.skills[dataset.label]['value'];
    let rolldata = {
      threshold: 10,
      explode: false,
      reroll: false,
      skilldice: skillValue,
    };

    if (skillValue > 2) rolldata['reroll'] = true;

    // if the character's skill is 4 or more then they can get 2 raises when matching to a 15
    if (skillValue >= 4) rolldata['threshold'] = 15;

    if (skillValue === 5 || data.dwounds.value === 3)
      rolldata['explode'] = true;

    const traits = {};
    for (const trait of Object.keys(data.traits)) {
      traits[CONFIG.SVNSEA2E.traits[trait]] = data.traits[trait].value;
    }

    const initialBonusDice = data.dwounds.value >= 1 ? 1 : 0;

    // Render modal dialog
    const template = 'systems/svnsea2e/templates/chats/skill-roll-dialog.html';
    const dialogData = { data, traits, initialBonusDice };

    const html = await renderTemplate(template, dialogData);

    // Create the Dialog window
    let roll;
    const title = game.i18n.format('SVNSEA2E.ApproachPromptTitle', {
      skill: CONFIG.SVNSEA2E.skills[dataset.label],
    });
    return new Promise((resolve) => {
      new Dialog(
        {
          title: title,
          content: html,
          buttons: {
            roll: {
              icon: '<img src="systems/svnsea2e/icons/d10.svg" class="d10">',
              label: game.i18n.localize('SVNSEA2E.Roll'),
              callback: (html) =>
                roll({
                  rolldata,
                  actor,
                  data,
                  form: html[0].querySelector('form'),
                  template: 'systems/svnsea2e/templates/chats/roll-card.html',
                  title: game.i18n.format('SVNSEA2E.ApproachRollChatTitle', {
                    trait:
                      html[0].querySelector('form').trait[
                        html[0].querySelector('form').trait.selectedIndex
                      ].text,
                    skill: CONFIG.SVNSEA2E.skills[dataset.label],
                  }),
                }),
            },
          },
        },
        {},
      ).render(true);
    });
  }

  /* -------------------------------------------- */

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  async _onVillainRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;
    const actor = this.actor;
    const data = this.actor.data.data;

    let rolldata = {
      threshold: 10,
      explode: false,
      reroll: false,
      skilldice: 0,
    };

    // Render modal dialog
    const template = 'systems/svnsea2e/templates/chats/trait-roll-dialog.html';

    const initialBonusDice = data.dwounds.value >= 1 ? 1 : 0;

    const dialogData = {
      data: data,
      traitmax: data.traits[dataset.label]['value'],
      initialBonusDice,
    };

    const html = await renderTemplate(template, dialogData);

    // Create the Dialog window
    const title = game.i18n.format('SVNSEA2E.TraitRollTitle', {
      trait: CONFIG.SVNSEA2E.traits[dataset.label],
    });
    return new Promise(() => {
      new Dialog(
        {
          title: title,
          content: html,
          buttons: {
            roll: {
              icon: '<img src="systems/svnsea2e/icons/d10.svg" class="d10">',
              label: game.i18n.localize('SVNSEA2E.Roll'),
              callback: (html) =>
                roll({
                  rolldata: rolldata,
                  actor: actor,
                  data: data,
                  form: html[0].querySelector('form'),
                  template: 'systems/svnsea2e/templates/chats/roll-card.html',
                  title: title,
                }),
            },
          },
        },
        {},
      ).render(true);
    });
  }

  /* -------------------------------------------- */
}
