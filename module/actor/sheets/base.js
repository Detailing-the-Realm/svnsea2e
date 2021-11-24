import LanguageSelector from "../../apps/language-selector.js";

/**
 * Extend the basic ActorSheet class to do all the 7th Sea things!
 * This sheet is an Abstract layer which is not used.
 * @extends {ActorSheet}
 */
export default class ActorSheetSS2e extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      width: 730,
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
      cssClass: owner ? "editable" : "locked",
      isCorrupt: this.document.data.data.corruptionpts > 0,
      isPlayerCharacter: this.document.data.type === "playercharacter",
      isHero: this.document.data.type === "hero",
      isVillain: this.document.data.type === "villain",
      isMonster: this.document.data.type === "monster",
      isNotBrute: this.document.data.type !== "brute",
      hasSkills: typeof this.document.data.data.skills !== "undefined",
      hasLanguages: typeof this.document.data.data.languages !== "undefined",
      config: CONFIG.SVNSEA2E,
      dtypes: ["String", "Number", "Boolean"],

      // Core Actor data:
      name: this.actor.name,
      img: this.actor.img,
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

      // Inventory Tab
      equipment: baseData.data.data.equipment,
    };

    // Prepare items.
    if (this.actor.data.type === "playercharacter") {
      this._prepareCharacterItems(baseData, sheetData);
    } else if (this.actor.data.type === "hero") {
      this._prepareHeroItems(baseData, sheetData);
      sheetData.selectedlangs = this._prepareLanguages(baseData);
    } else if (this.actor.data.type === "villain") {
      this._prepareVillainItems(baseData, sheetData);
      sheetData.selectedlangs = this._prepareLanguages(baseData);
    } else if (this.actor.data.type === "monster") {
      this._prepareMonsterItems(baseData, sheetData);
    } else if (this.actor.data.type === "ship") {
      this._prepareShipItems(baseData, sheetData);
      this._processFlags(baseData, baseData.data.flags, sheetData);
    } else if (this.actor.data.type === "dangerpts") {
      sheetData.points = baseData.data.data.points;
    }
    return sheetData;
  }

  /* -------------------------------------------- */

  _prepareButtonTitles(data) {
    for (const item of Object.values(data)) {
      item.editlabel = game.i18n.format("SVNSEA2E.EditLabel", {
        label: data.name,
      });
      item.deletelabel = game.i18n.format("SVNSEA2E.DeleteLabel", {
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
    return !["ship", "dangerpts"].includes(baseData.data.type)
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
      .find(".language-selector")
      .on("click", this._onLanguageSelector.bind(this));

    html.find(".item-create").on("click", this._onItemCreate.bind(this));

    // Update Inventory Item
    html.find(".item-edit").on("click", (ev) => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.getOwnedItem(li.data("itemId"));
      item.sheet.render(true);
    });

    // Delete Inventory Item
    html.find(".item-delete").on("click", this._onItemDelete.bind(this));

    html
      .find(".item h4.item-name")
      .on("click", (event) => this._onItemSummary(event));

    // Rollable abilities.
    if (
      this.actor.data.type === "playercharacter" ||
      this.actor.data.type === "hero"
    ) {
      html.find(".rollable").on("click", this._onHeroRoll.bind(this));
    } else if (
      this.actor.data.type === "villain" ||
      this.actor.data.type === "monster"
    ) {
      html.find(".rollable").on("click", this._onVillainRoll.bind(this));
    }

    html
      .find(".fillable.fa-circle")
      .on("click", (event) => this._processCircle(event));
    if (this.actor.data.type === "brute") {
      html
        .find(".fillable.fa-heart")
        .on("click", (event) => this._processBruteWounds(event));
    } else {
      html
        .find(".fillable.fa-heart")
        .on("click", (event) => this._processWounds(event));
    }

    // Drag events for macros.
    if (this.actor.isOwner) {
      const handler = (ev) => this._onDragItemStart(ev);
      html.find("li.item").each((i, li) => {
        if (li.classList.contains("inventory-header")) return;
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
    }
  }

  /* -------------------------------------------- */

  /**
   * Prepare the Languages that the Actor has selected for use with the LanguageSelector application
   * @param {Object} baseData       The base data
   * @private
   */
  _prepareLanguages(baseData) {
    // Languages only apply to PCs, heroes, or villains.
    if (!["playercharacter", "hero", "villain"].includes(baseData.data.type))
      return undefined;

    return baseData.actor.data.data.languages.reduce(
      (languages, language) => ({
        ...languages,
        [language]: CONFIG.SVNSEA2E.languages[language],
      }),
      {}
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
        case "skill":
          tval = actorData.skills[dataSet.key].value;
          break;
        case "trait":
          if (dataSet.key === "influence" || dataSet.key === "strength") {
            tval = actorData.traits[dataSet.key].value;
          } else {
            dataSetValue = 2;
          }
          break;
        case "corrupt":
          tval = actorData[dataSet.key];
          break;
        case "fear":
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
    updateObj["data.wounds.value"] = event.target.dataset.value;
    if (
      this.actor.data.data.wounds.value == 1 &&
      event.target.dataset.value == 1
    )
      updateObj["data.wounds.value"] = 0;

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

    if (edata.type === "wounds") {
      wounds = edata.value;
      dwounds = data.dwounds.value;
      const dwestimate = Math.trunc(wounds / 5);

      if (dwestimate > data.dwounds.value) dwounds = dwestimate;

      if (edata.value == 1 && data.wounds.value == 1) wounds = 0;
    } else {
      // If the event dramatic wound is larger than the current dramatic wound
      // increase the dramatic wound and the regular wounds
      if (edata.value > data.dwounds.value) dwounds = edata.value;
      else if (edata.value == data.dwounds.value)
        dwounds = data.dwounds.value - 1;
      else dwounds = edata.value;

      if (data.wounds.value > edata.value * 5) wounds = edata.value * 5;
    }

    updateObj["data.wounds.value"] = wounds;
    updateObj["data.dwounds.value"] = dwounds;

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
      title: game.i18n.localize("SVNSEA2E.Languages"),
      choices: CONFIG.SVNSEA2E[a.dataset.options],
    };
    new LanguageSelector(this.actor, options).render(true);
  }

  /* -------------------------------------------- */

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
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
      data: duplicate(header.dataset),
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.data.type;

    // Finally, create the item!
    return this.actor.createOwnedItem(itemData);
  }
  /* -------------------------------------------- */

  /**
   * Handle deleting a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemDelete(event) {
    event.preventDefault();
    const li = event.currentTarget.closest(".item");
    const itemid = li.dataset.itemId;

    const item = this.actor.getOwnedItem(itemid);
    if (item && item.data.type === "background")
      await this._processBackgroundDelete(item.data.data);

    await this.actor.deleteOwnedItem(itemid);
  }

  /* -------------------------------------------- */

  /**
   * Handle rolling of an item from the Actor sheet, obtaining the Item instance and dispatching to it's roll method
   * @private
   */
  async _onItemSummary(event) {
    event.preventDefault();
    const li = $(event.currentTarget).parents(".item");
    const item = this.actor.getOwnedItem(li.data("item-id"));
    const chatData = item.getChatData({ secrets: this.actor.owner });

    // Toggle summary
    if (li.hasClass("expanded")) {
      const summary = li.children(".item-summary");
      summary.slideUp(200, () => summary.remove());
    } else {
      const div = $(`<div class="item-summary">${chatData.description}</div>`);
      const metadata = $(
        `<div class="item-metdata">${chatData.metadatahtml}</div>`
      );
      div.append(metadata);
      li.append(div.hide());
      div.slideDown(200);
    }
    li.toggleClass("expanded");
  }

  /* -------------------------------------------- */

  /** @override */
  async _onDrop(event) {
    event.preventDefault();

    // Get dropped data
    let data;
    try {
      data = JSON.parse(event.dataTransfer.getData("text/plain"));
    } catch (err) {
      return false;
    }
    if (!data) return false;

    // Case 1 - Dropped Item
    if (data.type === "Item") {
      return this._onDropItem(event, data);
    }

    // Case 2 - Dropped Actor
    if (data.type === "Actor") {
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

    if (itemData.type !== "sorcery") {
      if (await this._doesActorHaveItem(itemData.type, itemData.name)) {
        return ui.notifications.error(
          game.i18n.format("SVNSEA2E.ItemExists", {
            type: itemData.type,
            name: itemData.name,
          })
        );
      }
    }

    if (itemData.type === "background") {
      if (
        itemData.data.nation === "gisles" &&
        (this.actor.data.data.nation === "highland" ||
          this.actor.data.data.nation === "avalon" ||
          this.actor.data.data.nation === "insmore")
      ) {
        await this._processBackgroundDrop(itemData);
        return await this.actor.createEmbeddedDocuments("Item", [itemData]);
      }
      if (
        itemData.data.nation !== "none" &&
        itemData.data.nation !== this.actor.data.data.nation
      ) {
        return ui.notifications.error(
          game.i18n.format("SVNSEA2E.WrongNation", {
            bgnation: game.i18n.localize(
              CONFIG.SVNSEA2E.nations[itemData.data.nation]
            ),
            anation: game.i18n.localize(
              CONFIG.SVNSEA2E.nations[this.actor.data.data.nation]
            ),
            name: itemData.name,
          })
        );
      }
      await this._processBackgroundDrop(itemData);
    }
    // Create the owned item
    return await this.actor.createEmbeddedDocuments("Item", [itemData]);
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
      if (pack.metadata.entity !== "Actor") return;
      actorData = await pack.getEntry(data.id);
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
      if (pack.metadata.entity !== "Item") return;
      itemData = await pack.getEntry(data.id);
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
      if (pack.metadata.entity !== "Item") return;
      bkgData = await pack.getEntry(data.id);
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
      updateData["data.skills." + skill + ".value"] =
        actorData.skills[skill].value + 1;
    }
    await this.actor.update(updateData);

    for (let a = 0; a < bkgData.advantages.length; a++) {
      // need to grab the advantage first from world then compendium
      let advantage = game.items.entities.find(
        (entry) => entry.data.name === bkgData.advantages[a]
      );
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
          game.i18n.format("SVNSEA2E.ItemDoesntExist", {
            name: bkgData.advantages[a],
          })
        );
        continue;
      }
      if (!advantage.name.toLowerCase().includes("sorcery")) {
        if (await this._doesActorHaveItem("advantage", advantage.name)) {
          ui.notifications.error(
            game.i18n.format("SVNSEA2E.ItemExists", {
              name: advantage.name,
            })
          );
          continue;
        }
      }
      await this.actor.createEmbeddedDocuments("Item", [duplicate(advantage)]);
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
      updateData["data.skills." + skill + ".value"] =
        actorData.skills[skill].value - 1;
    }
    await this.actor.update(updateData);

    const charAdvs = await this._getAdvantages();
    for (let i = 0; i < bkgData.advantages.length; i++) {
      for (let j = 0; j < charAdvs.length; j++) {
        if (charAdvs[j].data.name === bkgData.advantages[i]) {
          await this.actor.deleteEmbeddedDocuments("Item", [charAdvs[j].id]);
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
      .filter((item) => item.type === "advantage")
      .map((item) => item.name);
  }

  /* -------------------------------------------- */

  /**
   * Retrieve all advantages the character has assigned
   * @private
   */
  async _getAdvantages() {
    return this.actor.items.filter((item) => item.type === "advantage");
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

    let skillValue = data.skills[dataset.label]["value"];
    console.log(typeof skillValue);
    let rolled = false;
    let rolldata = {
      threshold: 10,
      explode: false,
      reroll: false,
      skilldice: skillValue,
    };

    if (skillValue > 2) rolldata["reroll"] = true;

    // if the character's skill is 4 or more then they can get 2 raises when matching to a 15
    if (skillValue >= 4) rolldata["threshold"] = 15;

    if (skillValue === 5 || data.dwounds.value === 3)
      rolldata["explode"] = true;

    const traits = {};
    for (const trait of Object.keys(data.traits)) {
      traits[CONFIG.SVNSEA2E.traits[trait]] = data.traits[trait].value;
    }

    // Render modal dialog
    const template = "systems/svnsea2e/templates/chats/skill-roll-dialog.html";
    const dialogData = { data, traits };

    const html = await renderTemplate(template, dialogData);

    // Create the Dialog window
    let roll;
    const title = game.i18n.format("SVNSEA2E.ApproachPromptTitle", {
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
              label: game.i18n.localize("SVNSEA2E.Roll"),
              callback: (html) =>
                (roll = this._roll({
                  rolldata,
                  actor,
                  data,
                  form: html[0].querySelector("form"),
                  template: "systems/svnsea2e/templates/chats/roll-card.html",
                  title: game.i18n.format("SVNSEA2E.ApproachRollChatTitle", {
                    trait:
                      html[0].querySelector("form").trait[
                        html[0].querySelector("form").trait.selectedIndex
                      ].text,
                    skill: CONFIG.SVNSEA2E.skills[dataset.label],
                  }),
                })),
            },
          },
          close: (html) => {
            resolve(rolled ? roll : false);
          },
        },
        {}
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

    let rolled = false;
    let rolldata = {
      threshold: 10,
      explode: false,
      reroll: false,
      skilldice: 0,
    };

    // Render modal dialog
    const template = "systems/svnsea2e/templates/chats/trait-roll-dialog.html";
    const dialogData = {
      data: data,
      traitmax: data.traits[dataset.label]["value"],
    };

    const html = await renderTemplate(template, dialogData);

    // Create the Dialog window
    let roll;
    const title = game.i18n.format("SVNSEA2E.TraitRollTitle", {
      trait: CONFIG.SVNSEA2E.traits[dataset.label],
    });
    return new Promise((resolve) => {
      new Dialog(
        {
          title: title,
          content: html,
          buttons: {
            roll: {
              icon: '<img src="systems/svnsea2e/icons/d10.svg" class="d10">',
              label: game.i18n.localize("SVNSEA2E.Roll"),
              callback: (html) =>
                (roll = this._roll({
                  rolldata: rolldata,
                  actor: actor,
                  data: data,
                  form: html[0].querySelector("form"),
                  template: "systems/svnsea2e/templates/chats/roll-card.html",
                  title: title,
                })),
            },
          },
          close: (html) => {
            resolve(rolled ? roll : false);
          },
        },
        {}
      ).render(true);
    });
  }

  /* -------------------------------------------- */

  /**
   * Handle clickable rolls.
   * @param rolldata
   * @param actor
   * @param data
   * @param form
   * @param template
   * @param title
   * @private
   */
  async _roll({
    rolldata = {},
    actor = {},
    data = {},
    form = {},
    template,
    title,
  }) {
    /**
     * get the indexes in the rolls array that matches the dice combos
     */
    const _getIndexes = function (rolls, tomatch) {
      const values = [];
      values.push(rolls.indexOf(tomatch[0]));
      if (tomatch[0] === tomatch[1]) {
        values.push(rolls.indexOf(tomatch[1], values[0] + 1));
      } else {
        values.push(rolls.indexOf(tomatch[1]));
      }
      if (tomatch.length > 2) {
        if (tomatch[0] === tomatch[2]) {
          values.push(rolls.indexOf(tomatch[2], values[1] + 1));
        } else {
          values.push(rolls.indexOf(tomatch[2]));
        }
      }
      return values;
    };

    // Increase the raise value based on the threshold matched.
    const _addRaise = function (threshold = 10, incThreshold = false) {
      let raises = 1;
      let combos = [];
      if (
        (threshold === 15 && !incThreshold) ||
        (threshold === 20 && incThreshold)
      )
        raises++;
      return raises;
    };

    const _leftOverDice = function (
      rolls,
      threshold = 10,
      incThreshold = false
    ) {
      let total = 0;
      let combotxt = "";
      let data = {
        rolls: [],
        combos: [],
        raises: 0,
      };

      //Loop through the left over rolls and create die combos that are greater than the threshold
      while (i--) {
        if (i > 0 && total === 0) {
          total += rolls[0] + rolls[i];
          combotxt = rolls[0].toString() + " + " + rolls[i].toString();
          rolls.splice(i, 1);
          rolls.splice(0, 1);
          i--; // length needs to shrink twice because we removed two elements from the array
        } else {
          total += rolls[0];
          combotxt = combotxt + " + " + rolls[0].toString();
          rolls.splice(0, 1);
        }

        if (total >= threshold) {
          data["raises"] += _addRaise(threshold, incThreshold);
          data["combos"].push(combotxt);
          combotxt = "";
          total = 0;
        }
      }

      data["rolls"] = rolls;
      return data;
    };

    const nd =
      parseInt(rolldata["skilldice"]) +
      parseInt(form.trait.value) +
      parseInt(form.bonusDice.value);
    let incThreshold = 0;
    if (form.increaseThreshold !== undefined)
      incThreshold = form.increaseThreshold.checked;
    let d10 = new Die({ faces: 10, number: nd }).evaluate();
    let exploded = false;

    // GM spent a danger point and increased the threshold by 5
    if (incThreshold) rolldata.threshold += 5;

    let matcharr = CONFIG.SVNSEA2E.match10;
    if (rolldata["threshold"] == 15) matcharr = CONFIG.SVNSEA2E.match15;
    if (rolldata["threshold"] == 20) matcharr = CONFIG.SVNSEA2E.match20;

    // explode the dice on 10s if the character has a high enough skill or has taken 3 dynamic wounds
    if (rolldata["explode"]) {
      exploded = true;
      d10.explode("X", false);
    }

    // deep copy of the rolls
    const rolls = d10.values;

    rolls.sort(function (a, b) {
      return a - b;
    });

    let raises = 0;
    let combos = [];

    // If the threshold is 10 then count all 10s as raises
    if (rolldata["threshold"] == 10) {
      let i = rolls.length;
      while (i--) {
        if (rolls[i] == 10) {
          raises++;
          combos.push("10");
          rolls.splice(i, 1);
        } else if (rolls[i] < 10) {
          break;
        }
      }
    }

    // Loop through the dice and add raises for all two dice combos that match the threshold.
    for (let c = 0; c < matcharr.two.length; c++) {
      let vals = _getIndexes(rolls, matcharr.two[c]);
      while (vals[0] > -1 && vals[1] > -1) {
        raises += _addRaise(rolldata["threshold"], incThreshold);
        combos.push(
          rolls[vals[0]].toString() + " + " + rolls[vals[1]].toString()
        );
        rolls.splice(vals[0], 1);
        rolls.splice(rolls.indexOf(matcharr.two[c][1]), 1);
        vals = _getIndexes(rolls, matcharr.two[c]);
      }
    }

    // Loop through the rolls and identify any three die combos and add raises for them.
    for (let c = 0; c < matcharr.three.length; c++) {
      var vals = _getIndexes(rolls, matcharr.three[c]);
      while (vals[0] > -1 && vals[1] > -1 && vals[2] > -1) {
        raises += _addRaise(rolldata["threshold"], incThreshold);
        combos.push(
          rolls[vals[0]].toString() +
            " + " +
            rolls[vals[1]].toString() +
            " + " +
            rolls[vals[2]].toString()
        );
        rolls.splice(vals[0], 1);
        rolls.splice(rolls.indexOf(matcharr.three[c][1]), 1);
        rolls.splice(rolls.indexOf(matcharr.three[c][2]), 1);
        vals = _getIndexes(rolls, matcharr.three[c]);
      }
    }

    let i = rolls.length;
    let rerolled = false;
    let reroll = "";

    const sortedRolls = d10.values;
    sortedRolls.sort(function (a, b) {
      return a - b;
    });

    // reroll the first die in our results if it is less than 5
    if (i > 0 && rolldata["reroll"] && rolls[0] < 5) {
      const orgroll = rolls[0];
      rolls[0] = Math.floor(Math.random() * 10) + 1;
      reroll = game.i18n.format("SVNSEA2E.Reroll", {
        roll1: orgroll,
        roll2: rolls[0],
      });
      rerolled = true;

      for (let k = 0; k < sortedRolls.length && sortedRolls[k] < 5; k++) {
        if (sortedRolls[k] == orgroll) sortedRolls[k] = rolls[0];
      }

      sortedRolls.sort(function (a, b) {
        return a - b;
      });
    }

    let leftdata = _leftOverDice(rolls, rolldata["threshold"], incThreshold);
    combos.push(...leftdata["combos"]);
    raises += leftdata["raises"];

    // If the threshold is 15 and we have left over dice check for matching 10s for a single rais
    if (
      leftdata["rolls"].length > 0 &&
      ((!incThreshold && rolldata["threshold"] == 15) ||
        (incThreshold && rolldata["threshold"] == 20))
    ) {
      let leftdata2 = _leftOverDice(
        leftdata["rolls"],
        rolldata["threshold"] - 5,
        incThreshold
      );
      combos.push(...leftdata2["combos"]);
      raises += leftdata2["raises"];
    }

    const messageOptions = {
      rollmode: "gmroll",
    };

    let thresholdmsg = rolldata["threshold"].toString();

    if (incThreshold)
      thresholdmsg =
        rolldata["threshold"].toString() +
        " " +
        game.i18n.localize("SVNSEA2E.GMIncreasedThreshold");

    const templateData = {
      actor: actor,
      raisetxt:
        raises > 1
          ? game.i18n.localize("SVNSEA2E.Raises")
          : game.i18n.localize("SVNSEA2E.Raise"),
      data: data,
      exploded: exploded,
      explosions: game.i18n.format("SVNSEA2E.RollsExploded"),
      labels: data.labels,
      rolls: sortedRolls,
      raises: raises,
      rCombos: game.i18n.localize("SVNSEA2E.RaiseCombos"),
      combos: combos,
      rerolled: rerolled,
      reroll: reroll,
      threshold: game.i18n.format("SVNSEA2E.RollThreshold", {
        threshold: thresholdmsg,
      }),
    };

    const html = await renderTemplate(template, templateData);

    // Basic chat message
    const chatData = {
      user: game.user._id,
      type: CONST.CHAT_MESSAGE_TYPES.OTHER,
      content: html,
      image: actor.img,
      speaker: {
        actor: actor._id,
        token: actor.token,
        alias: actor.name,
      },
      flavor: title,
    };

    // Toggle default roll mode
    const rollMode = game.settings.get("core", "rollMode");
    if (["gmroll", "blindroll"].includes(rollMode))
      chatData.whisper = ChatMessage.getWhisperRecipients("GM");
    if (rollMode === "blindroll") chatData.blind = true;

    // Create the chat message
    const chatmsg = ChatMessage.create(chatData);
    return d10;
  }
}
