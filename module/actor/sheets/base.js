import { SVNSEA2E } from '../../config.js'
import LanguageSelector from '../../apps/language-selector.js'
/**
 * Extend the basic ActorSheet class to do all the D&D5e things!
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
    data.dtypes = ['String', 'Number', 'Boolean']
    // Prepare items.
    if (this.actor.data.type === 'character') {
      this._prepareCharacterItems(data)
      // Update traits
      this._prepareLanguages(data.actor.data)
    }
    return data
  }

  /* -------------------------------------------- */
  /** @override */
  activateListeners (html) {
    super.activateListeners(html)

    // Editable Only Listeners
    if (this.isEditable) {
      html.find('.language-selector').click(this._onLanguageSelector.bind(this))
      html.find('.story-create').click(this._onStoryCreate.bind(this))
    }

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return
    // Trait Selector

    // Add Inventory Item
    html.find('.item-create').click(this._onItemCreate.bind(this))

    // Update Inventory Item
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents('.item')
      const item = this.actor.getOwnedItem(li.data('itemId'))
      item.sheet.render(true)
    })

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents('.item')
      this.actor.deleteOwnedItem(li.data('itemId'))
      li.slideUp(200, () => this.render(false))
    })

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

  _prepareLanguages (data) {
    data.selectedlangs = {}
    console.log(data)
    for (let i = 0; i < data.languages.length; i++) {
      console.log(data.languages[i], CONFIG.SVNSEA2E.languages[data.languages[i]])
      data.selectedlangs[data.languages[i]] = CONFIG.SVNSEA2E.languages[data.languages[i]]
    }
    console.log(data.selectedlangs)
  }

  /* -------------------------------------------- */

  /**
   * Handle spawning the TraitSelector application which allows a checkbox of multiple language options
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

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  _onStoryCreate (event) {
    event.preventDefault()
    const header = event.currentTarget
    // Get the type of item to create.
    const type = header.dataset.type
    // Grab any data associated with this control.
    const data = duplicate(header.dataset)
    // Initialize a default name.
    const name = `New ${type.capitalize()}`
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      data: data
    }
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.data.type

    // Finally, create the item!
    return this.actor.createOwnedItem(itemData)
  }

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
    // Grab any data associated with this control.
    const data = duplicate(header.dataset)
    // Initialize a default name.
    const name = `New ${type.capitalize()}`
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      data: data
    }
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.data.type

    // Finally, create the item!
    return this.actor.createOwnedItem(itemData)
  }

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

      // explode the dice on 10s if the character has a high enough skill
      if (skill.nd === 5) {
        exploded = true
        explosions++
        d10.explode(10)
      }

      // deep copy of the rolls
      const rolls = JSON.parse(JSON.stringify(d10.results))

      rolls.sort(function (a, b) {
        return a - b
      })

      console.log(rolls)

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
      console.log(rolls)
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
        reroll = game.i18n.format('SVNSEA2E.Reroll', { roll1: orgroll, roll2: rolls[0] })
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

      console.log(form.trait[form.trait.selectedIndex].text)
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
        explosions: game.i18n.format('SVNSEA2E.RollsExploded', { explosions: explosions.toString() }),
        labels: data.labels,
        rolls: game.i18n.format('SVNSEA2E.Rolls', { rolls: sortedRolls.join(', ') }),
        raises: raises,
        rCombos: game.i18n.format('SVNSEA2E.RaiseCombos', { combos: raiseCombos.join(', ') }),
        rerolled: rerolled,
        reroll: reroll,
        threshold: game.i18n.format('SVNSEA2E.RollThreshold', { threshold: threshold.toString() })
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
            icon: '<i class="fas fa-dice-d20"></i>',
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
