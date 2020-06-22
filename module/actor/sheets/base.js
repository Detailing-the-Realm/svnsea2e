import {
  SVNSEA2E
} from '../../config.js'
import LanguageSelector from '../../apps/language-selector.js'
/**
 * Extend the basic ActorSheet class to do all the 7th Sea things!
 * This sheet is an Abstract layer which is not used.
 * @extends {ActorSheet}
 */
export default class ActorSheetSS2e extends ActorSheet {
  /** @override */
  static get defaultOptions () {
    return mergeObject(super.defaultOptions, {
      width: 700,
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
      limited: this.entity.limited,
      options: this.options,
      editable: this.isEditable,
      cssClass: isOwner ? 'editable' : 'locked',
      isPlayerCharacter: this.entity.data.type === 'playercharacter',
      isHero: this.entity.data.type === 'hero',
      isVillain: this.entity.data.type === 'villain',
      isMonster: this.entity.data.type === 'monster',
      hasSkills: typeof this.entity.data.data.skills !== 'undefined',
      hasLanguages: typeof this.entity.data.data.languages !== 'undefined',
      config: CONFIG.SVNSEA2E,
      dtypes: ['String', 'Number', 'Boolean']
    })

    if (this.actor.data.type === 'ship') {
      this._prepareShipActors(data)
    } else {
      this._prepareTraits(data)
    }

    // Prepare items.
    if (this.actor.data.type === 'playercharacter') {
      this._prepareCharacterItems(data)
      // Update languages
      this._prepareLanguages(data.actor.data)
    } else if (this.actor.data.type === 'hero') {
      this._prepareHeroItems(data)
      this._prepareLanguages(data.actor.data)
    } else if (this.actor.data.type === 'villain') {
      this._prepareVillainItems(data)
      this._prepareLanguages(data.actor.data)
    } else if (this.actor.data.type === 'monster') {
      this._prepareMonsterItems(data)
    }

    return data
  }

  _prepareButtonTitles (data) {
    for (const item of Object.values(data)) {
      item.editlabel = game.i18n.format('SVNSEA2E.EditLabel', {
        label: data.name
      })
      item.deletelabel = game.i18n.format('SVNSEA2E.DeleteLabel', {
        label: data.name
      })
    }
  }

  _prepareTraits (data) {
    // Update trait labels
    for (const [t, trait] of Object.entries(data.actor.data.traits)) {
      trait.label = CONFIG.SVNSEA2E.traits[t]
    }
  }

  /* -------------------------------------------- */
  /** @override */
  activateListeners (html) {
    super.activateListeners(html)

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return
    // Trait Selector

    html.find('.language-selector').click(this._onLanguageSelector.bind(this))

    html.find('.item-create').click(this._onItemCreate.bind(this))

    // Update Inventory Item
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents('.item')
      const item = this.actor.getOwnedItem(li.data('itemId'))
      item.sheet.render(true)
    })

    // Delete Inventory Item
    html.find('.item-delete').click(this._onItemDelete.bind(this))

    html.find('.item h4.item-name').click(event => this._onItemSummary(event))

    // Rollable abilities.
    html.find('.rollable').click(this._onRoll.bind(this))

    // Drag events for macros.
    if (this.actor.owner) {
      const handler = ev => this._onDragItemStart(ev)
      html.find('li.item').each((i, li) => {
        if (li.classList.contains('inventory-header')) return
        li.setAttribute('draggable', true)
        li.addEventListener('dragstart', handler, false)
      })
    }
  }

  /* -------------------------------------------- */

  /**
   * Prepare the Languages that the Actor has selected for use with the LanguageSelector application
   * @param {Object} data       The data transfer
   * @private
   */
  _prepareLanguages (data) {
    data.selectedlangs = {}
    for (let i = 0; i < data.languages.length; i++) {
      data.selectedlangs[data.languages[i]] = CONFIG.SVNSEA2E.languages[data.languages[i]]
    }
  }

  /* -------------------------------------------- */

  /**
   * Handle spawning the languageSelector application which allows a checkbox of multiple language options
   * @param {Event} event   The click event which originated the selection
   * @private
   */
  _onLanguageSelector (event) {
    event.preventDefault()
    const a = event.currentTarget
    const options = {
      title: game.i18n.localize('SVNSEA2E.Languages'),
      choices: CONFIG.SVNSEA2E[a.dataset.options]
    }
    new LanguageSelector(this.actor, options).render(true)
  }

  /* -------------------------------------------- */

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  _onItemCreate (event) {
    event.preventDefault()
    const header = event.currentTarget
    // Get the type of item to create.
    const type = header.dataset.type
    // Prepare the item object.
    const itemData = {
      name: game.i18n.localize(`SVNSEA2E.New${type}`),
      type: type,
      data: duplicate(header.dataset)
    }
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.data.type

    // Finally, create the item!
    return this.actor.createOwnedItem(itemData)
  }
  /* -------------------------------------------- */

  /**
   * Handle deleting a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemDelete (event) {
    event.preventDefault()
    const li = event.currentTarget.closest('.item')
    const itemid = li.dataset.itemId

    const item = this.actor.getOwnedItem(itemid)
    if (item && item.data.type === 'background') await this._processBackgroundDelete(item.data.data)

    await this.actor.deleteOwnedItem(itemid)
  }

  /* -------------------------------------------- */

  /**
   * Handle rolling of an item from the Actor sheet, obtaining the Item instance and dispatching to it's roll method
   * @private
   */
  async _onItemSummary (event) {
    event.preventDefault()
    const li = $(event.currentTarget).parents('.item')
    const item = this.actor.getOwnedItem(li.data('item-id'))
    const chatData = item.getChatData({ secrets: this.actor.owner })
    console.log(chatData.metadatahtml)
    // Toggle summary
    if (li.hasClass('expanded')) {
      const summary = li.children('.item-summary')
      summary.slideUp(200, () => summary.remove())
    } else {
      const div = $(`<div class="item-summary">${chatData.description}</div>`)
      const metadata = $(`<div class="item-metdata">${chatData.metadatahtml}</div>`)
      div.append(metadata)
      li.append(div.hide())
      div.slideDown(200)
    }
    li.toggleClass('expanded')
  }

  /* -------------------------------------------- */

  /** @override */
  async _onDrop (event) {
    event.preventDefault()

    // Get dropped data
    let data
    try {
      data = JSON.parse(event.dataTransfer.getData('text/plain'))
    } catch (err) {
      return false
    }
    if (!data) return false

    // Case 1 - Dropped Item
    if (data.type === 'Item') {
      return this._onDropItem(event, data)
    }

    // Case 2 - Dropped Actor
    if (data.type === 'Actor') {
      return this._onDropActor(event, data)
    }
  }

  /* -------------------------------------------- */

  /**
   * Handle dropping an Actor on the sheet to trigger a Polymorph workflow
   * @param {DragEvent} event   The drop event
   * @param {Object} data       The data transfer
   * @return {Object}           OwnedItem data to create
   * @private
   */
  async _onDropActor (event, data) {
  }

  /* -------------------------------------------- */

  /**
   * Handle dropping of an item reference or item data onto an Actor Sheet
   * @param {DragEvent} event     The concluding DragEvent which contains drop data
   * @param {Object} data         The data transfer extracted from the event
   * @return {Object}             OwnedItem data to create
   * @private
   */
  async _onDropItem (event, data) {
    if (!this.actor.owner) return false
    const itemData = await this._getItemDropData(event, data)

    if (itemData.type !== 'sorcery') {
      if (await this._doesActorHaveItem(itemData.type, itemData.name)) {
        return ui.notifications.error(game.i18n.format('SVNSEA2E.ItemExists', {
          type: itemData.type,
          name: itemData.name
        }))
      }

      if (itemData.data.nation !== 'none' && itemData.data.nation !== this.actor.data.data.nation) {
        return ui.notifications.error(game.i18n.format('SVNSEA2E.WrongNation', {
          bgnation: game.i18n.localize(CONFIG.SVNSEA2E.nations[itemData.data.nation]),
          anation: game.i18n.localize(CONFIG.SVNSEA2E.nations[this.actor.data.data.nation]),
          name: itemData.name
        }))
      }
      await this._processBackgroundDrop(itemData.data)
    }

    // Handle item sorting within the same Actor
    const actor = this.actor
    const sameActor = (data.actorId === actor._id) || (actor.isToken && (data.tokenId === actor.token.id))
    if (sameActor) return this._onSortItem(event, itemData)

    // Create the owned item
    return await this.actor.createEmbeddedEntity('OwnedItem', itemData)
  }

  /* -------------------------------------------- */

  /**
   * TODO: A temporary shim method until Item.getDropData() is implemented
   * https://gitlab.com/foundrynet/foundryvtt/-/issues/2866
   * @param {DragEvent} event     The concluding DragEvent which contains drop data
   * @param {Object} data         The data transfer extracted from the event
   * @private
   */
  async _getActorDropData (event, data) {
    let actorData = null

    // Case 1 - Import from a Compendium pack
    if (data.pack) {
      const pack = game.packs.get(data.pack)
      if (pack.metadata.entity !== 'Actor') return
      actorData = await pack.getEntry(data.id)
    } else if (data.data) { // Case 2 - Data explicitly provided
      actorData = data.data
    } else { // Case 3 - Import from World entity
      const actor = game.actors.get(data.id)
      if (!actor) return
      actorData = actor.data
    }

    // Return a copy of the extracted data
    return duplicate(actorData)
  }

  /* -------------------------------------------- */

  /**
   * TODO: A temporary shim method until Item.getDropData() is implemented
   * https://gitlab.com/foundrynet/foundryvtt/-/issues/2866
   * @param {DragEvent} event     The concluding DragEvent which contains drop data
   * @param {Object} data         The data transfer extracted from the event
   * @private
   */
  async _getItemDropData (event, data) {
    let itemData = null

    // Case 1 - Import from a Compendium pack
    if (data.pack) {
      const pack = game.packs.get(data.pack)
      if (pack.metadata.entity !== 'Item') return
      itemData = await pack.getEntry(data.id)
    } else if (data.data) { // Case 2 - Data explicitly provided
      itemData = data.data
    } else { // Case 3 - Import from World entity
      const item = game.items.get(data.id)
      if (!item) return
      itemData = item.data
    }

    // Return a copy of the extracted data
    return duplicate(itemData)
  }

  /* -------------------------------------------- */

  /**
 * Process for modifying the character sheet when a background is dropped on it.
 * Backgrouds increase skills and add advantages
 * @param itemData for the item that has been dropped on the character sheet
 */
  async _processBackgroundDrop (bkgData) {
    const actorData = this.actor.data.data
    const updateData = {}

    for (let i = 0; i < bkgData.skills.length; i++) {
      const skill = bkgData.skills[i]
      updateData['data.skills.' + skill + '.value'] = actorData.skills[skill].value + 1
    }
    await this.actor.update(updateData)

    for (let i = 0; i < bkgData.advantages.length; i++) {
      // Probably need to improve this to look for backgrounds in compediums/packs too.
      const item = game.items.get(bkgData.advantages[i])
      if (!item) {
        ui.notifications.error(game.i18n.format('SVNSEA2E.ItemDoesntExist', {
          name: bkgData.advantages[i]
        }))
        continue
      }
      if (await this._doesActorHaveItem('advantage', item.name)) {
        ui.notifications.error(game.i18n.format('SVNSEA2E.ItemExists', {
          name: item.name
        }))
        continue
      }
      await this.actor.createEmbeddedEntity('OwnedItem', duplicate(item.data))
    }
  }

  /* -------------------------------------------- */
  /**
 * Process for modifying the character sheet when a background is dropped on it.
 * Backgrouds increase skills and add advantages
 * @param itemData data for the item that is being deleted
 */
  async _processBackgroundDelete (bkgData) {
    const actorData = this.actor.data.data
    const updateData = {}
    for (let i = 0; i < bkgData.skills.length; i++) {
      const skill = bkgData.skills[i]
      updateData['data.skills.' + skill + '.value'] = actorData.skills[skill].value - 1
    }
    await this.actor.update(updateData)

    const charAdvs = await this._getAdvantages()
    for (let i = 0; i < bkgData.advantages.length; i++) {
      const item = game.items.get(bkgData.advantages[i])

      if (!item) {
        ui.notifications.error(game.i18n.format('SVNSEA2E.ItemDoesntExist', {
          name: bkgData.advantages[i]
        }))
        continue
      }
      for (let j = 0; j < charAdvs.length; j++) {
        if (charAdvs[i].name === item.name) {
          await this.actor.deleteOwnedItem(charAdvs[i].id)
        }
      }
    }
  }

  /* -------------------------------------------- */

  /**
   *
   * @private
   */
  async _doesActorHaveItem (type, name) {
    let retVal = false
    this.actor.items.forEach(element => {
      if (element.type === type && element.name === name) {
        retVal = true
      }
    })
    return retVal
  }

  /* -------------------------------------------- */

  /**
   *
   * @private
   */
  async _getBackgroundNames () {
    const advNames = []

    this.actor.items.forEach(element => {
      if (element.type === 'advantage') {
        advNames.push(element.name)
      }
    })
    return advNames
  }

  /* -------------------------------------------- */

  /**
   *
   * @private
   */
  async _getAdvantageNames () {
    const advNames = []

    this.actor.items.forEach(element => {
      if (element.type === 'advantage') {
        advNames.push(element.name)
      }
    })
    return advNames
  }

  /* -------------------------------------------- */

  /**
   *
   * @private
   */
  async _getAdvantages () {
    const advantages = []
    this.actor.items.forEach(element => {
      if (element.type === 'advantage') {
        advantages.push(element)
      }
    })
    return advantages
  }

  /* -------------------------------------------- */

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  _onRoll (event) {
    event.preventDefault()
    const element = event.currentTarget
    const dataset = element.dataset

    this.skillRoll({
      skill: {
        name: dataset.label,
        nd: parseInt(dataset.roll)
      },
      event: event,
      actor: this.actor,
      data: this.actor.data.data,
      title: game.i18n.format('SVNSEA2E.ApproachPromptTitle', {
        skill: CONFIG.SVNSEA2E.skills[dataset.label]
      }),
      speaker: ChatMessage.getSpeaker({
        actor: this
      })
    })
  }

  async skillRoll ({
    skill = {},
    actor = {},
    data = {},
    event = {},
    template,
    title
  }) {
    // Handle input arguments
    let rolled = false
    let exploded = false
    let explosions = 0

    // Define inner roll function
    const _roll = async function ({
      skill = {},
      actor = {},
      data = {},
      form = {}
    }) {
      const _getIndexes = function (rolls, tomatch) {
        console.log('Matching these values: ' + tomatch.toString())
        const values = []
        values.push(rolls.indexOf(tomatch[0]))
        if (tomatch[0] === tomatch[1]) {
          values.push(rolls.indexOf(tomatch[1], values[0] + 1))
        } else {
          values.push(rolls.indexOf(tomatch[1]))
        }
        if (tomatch.length > 2) {
          if (tomatch[0] === tomatch[2]) {
            values.push(rolls.indexOf(tomatch[2], values[1] + 1))
          } else {
            values.push(rolls.indexOf(tomatch[2]))
          }
        }
        console.log('Comparing these indexes: ' + values.toString())
        return values
      }

      const _addRaise = function (threshold = 10) {
        let raises = 1
        if (threshold === 15) {
          raises++
        }
        return raises
      }

      const nd = skill.nd + parseInt(form.trait.value) + parseInt(form.bonusDice.value)
      const d10 = new Die(10).roll(nd)
      let raises = 0
      let threshold = 10
      const raiseCombos = []
      let matcharr = CONFIG.SVNSEA2E.match10

      // if the character's skill is 4 or more then they can get 2 raises when matching to a 15
      if (skill.nd >= 4) {
        threshold = 15
        matcharr = CONFIG.SVNSEA2E.match15
      }

      // explode the dice on 10s if the character has a high enough skill or has taken 3 dynamic wounds
      if (skill.nd === 5 || data.dwounds === 3) {
        exploded = true
        explosions++
        d10.explode(10)
      }

      // deep copy of the rolls
      const rolls = JSON.parse(JSON.stringify(d10.results))

      rolls.sort(function (a, b) {
        return a - b
      })

      if (skill.nd < 4) {
        let i = rolls.length
        while (i--) {
          if (rolls[i] === 10) {
            raises++
            raiseCombos.push('10')
            rolls.splice(i, 1)
          }
        }
      }

      for (let c = 0; c < matcharr.two.length; c++) {
        let vals = _getIndexes(rolls, matcharr.two[c])
        while (vals[0] > -1 && vals[1] > -1) {
          console.log('adding a raise')
          raises += _addRaise(threshold)
          raiseCombos.push(rolls[vals[0]].toString() + ' + ' + rolls[vals[1]].toString())
          rolls.splice(vals[0], 1)
          rolls.splice(rolls.indexOf(matcharr.two[c][1]), 1)
          vals = _getIndexes(rolls, matcharr.two[c])
        }
      }

      for (let c = 0; c < matcharr.three.length; c++) {
        var vals = _getIndexes(rolls, matcharr.three[c])
        while (vals[0] > -1 && vals[1] > -1 && vals[2] > -1) {
          console.log('adding a raise')
          raises += _addRaise(threshold)
          raiseCombos.push(rolls[vals[0]].toString() + ' + ' + rolls[vals[1]].toString() + ' + ' + rolls[vals[2]].toString())
          rolls.splice(vals[0], 1)
          rolls.splice(rolls.indexOf(matcharr.three[c][1]), 1)
          rolls.splice(rolls.indexOf(matcharr.three[c][2]), 1)
          vals = _getIndexes(rolls, matcharr.three[c])
        }
      }

      let total = 0
      let combo = ''
      let i = rolls.length
      let rerolled = false
      let reroll = ''

      // reroll the first die in our results if it is less than 5
      if (i > 0 && skill.nd > 2 && rolls[0] < 5) {
        const orgroll = rolls[0]
        rolls[0] = Math.floor(Math.random() * 10) + 1
        reroll = game.i18n.format('SVNSEA2E.Reroll', {
          roll1: orgroll,
          roll2: rolls[0]
        })
        rerolled = true
      }

      console.log(rolls)
      while (i--) {
        console.log('i', i)
        if (i > 0 && total === 0) {
          total += rolls[0] + rolls[i]
          combo = rolls[0].toString() + ' + ' + rolls[i].toString()
          rolls.splice(i, 1)
          rolls.splice(0, 1)
          i-- // length needs to shrink twice because we removed two elements from the array
        } else {
          total += rolls[0]
          combo = combo + ' + ' + rolls[0].toString()
          rolls.splice(0, 1)
        }
        console.log('total', total, combo)
        if (total >= threshold) {
          raises += _addRaise(threshold)
          raiseCombos.push(combo)
          combo = ''
          total = 0
        }
      }

      const sortedRolls = d10.results
      sortedRolls.sort(function (a, b) {
        return a - b
      })

      const messageOptions = {
        rollmode: 'gmroll'
      }

      const templateData = {
        title: game.i18n.format('SVNSEA2E.ApproachRollChatTitle', {
          skill: CONFIG.SVNSEA2E.skills[skill.name],
          trait: form.trait[form.trait.selectedIndex].text
        }),
        actor: actor,
        skill: event.currentTarget.dataset.label,
        trait: form.trait[form.trait.selectedIndex].text,
        data: data,
        exploded: exploded,
        explosions: game.i18n.format('SVNSEA2E.RollsExploded', {
          explosions: explosions.toString()
        }),
        labels: data.labels,
        rolls: game.i18n.format('SVNSEA2E.Rolls', {
          rolls: sortedRolls.join(', ')
        }),
        raises: raises,
        rCombos: game.i18n.format('SVNSEA2E.RaiseCombos', {
          combos: raiseCombos.join(', ')
        }),
        rerolled: rerolled,
        reroll: reroll,
        threshold: game.i18n.format('SVNSEA2E.RollThreshold', {
          threshold: threshold.toString()
        })
      }

      const template = 'systems/svnsea2e/templates/chats/skillroll-card.html'
      const html = await renderTemplate(template, templateData)

      // Basic chat mes'systems/svnsea2e/templates/chats/skillroll-card.html'
      const chatData = {
        user: game.user._id,
        type: CONST.CHAT_MESSAGE_TYPES.OTHER,
        content: html,
        speaker: {
          actor: actor._id,
          token: actor.token,
          alias: actor.name
        }
      }

      // Toggle default roll mode
      const rollMode = game.settings.get('core', 'rollMode')
      if (['gmroll', 'blindroll'].includes(rollMode)) chatData.whisper = ChatMessage.getWhisperIDs('GM')
      if (rollMode === 'blindroll') chatData.blind = true

      // Create the chat message
      const chatmsg = ChatMessage.create(chatData)
      rolled = true
      return d10
    }

    const traits = {}
    for (const trait of Object.keys(data.traits)) {
      traits[CONFIG.SVNSEA2E.traits[trait]] = data.traits[trait].value
    }

    // Render modal dialog
    template = template || 'systems/svnsea2e/templates/chats/roll-dialog.html'
    const dialogData = {
      data: data,
      traits: traits
    }

    const html = await renderTemplate(template, dialogData)

    // Create the Dialog window
    let roll
    return new Promise(resolve => {
      new Dialog({
        title: title,
        content: html,
        buttons: {
          roll: {
            icon: '<img src="systems/svnsea2e/icons/d10.svg" class="d10">',
            label: game.i18n.localize('SVNSEA2E.Roll'),
            callback: html => roll = _roll({
              skill: skill,
              actor: actor,
              data: data,
              form: html[0].children[0]
            })
          }
        },
        close: html => {
          resolve(rolled ? roll : false)
        }
      }, {}).render(true)
    })
  }
}
