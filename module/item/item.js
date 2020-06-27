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
    const fn = this[`_${this.data.type}ChatData`]
    if (fn) fn.bind(this)(data, htmlOptions)

    return data
  }

  /**
   * Prepare chat data for an advantage
   * @param {Object} data    Options used by the TextEditor.enrichHTML function
   * @return {Object}               An object of chat data to render
   */
  _advantageChatData (data, htmlOptions) {
    data.metadata.push({
      name: 'cost',
      txt: game.i18n.format('SVNSEA2E.ChatAdvantageCost', {
        cost: data.cost.normal,
        special: data.cost.specreq ? ' (' + data.cost.specreq + ')' : ''
      })
    }, {
      name: 'knack',
      txt: data.knack ? game.i18n.localize('SVNSEA2E.Knack') : ''
    }, {
      name: 'innate',
      txt: data.innate ? game.i18n.localize('SVNSEA2E.Innate') : ''
    })
    return data
  }

  _artifactChatData (data, htmlOptions) {
    data.metadatahtml = `${CONFIG.SVNSEA2E.artifacttypes[data.type]}`
    return data
  }

  _backgroundChatData (data, htmlOptions) {
    let skillNames = ''
    data.skills.forEach(skl => skillNames += `<li>${CONFIG.SVNSEA2E.skills[skl]}</li>`)

    let advNames = ''
    data.advantages.forEach(adv => {
      const item = game.items.get(adv)
      advNames += `<li>${item.name}</li>`
    })

    data.metadatahtml = `<h4>${game.i18n.localize('SVNSEA2E.Quirk')}</h4>
    <p>${data.quirk}</p>
    <h4>${game.i18n.localize('SVNSEA2E.Skills')}</h4>
    <ul class="skills">
    ${skillNames}
    </ul>
    <h4>${game.i18n.localize('SVNSEA2E.Advantages')}</h4>
    <ul class="advantages">
    ${advNames}
    </ul>
`
    return data
  }

  _duelstyleChatData (data, htmlOptions) {
    data.metadatahtml = game.i18n.format('SVNSEA2E.ChatDuelStyleBonus', {
      bonus: data.bonus.toString()
    })
    return data
  }

  _schemeChatData (data, htmlOptions) {
    data.metadata = game.i18n.format('SVNSEA2E.ChatInfluence', {
      influence: data.influence.toString()
    })
    return data
  }

  _secretsocietyChatData (data, htmlOptions) {
    data.metadata = `
    <h4>${game.i18n.localize('SVNSEA2E.Charter')}</h4>
    <p>${data.charter}</p>
    <h4>${game.i18n.localize('SVNSEA2E.Concern')}</h4>
    <p>${data.concern}</p>
    <h4>${game.i18n.localize('SVNSEA2E.EarnFavor')}</h4>
    <p>${data.earnfavor}</p>
    <h4>${game.i18n.localize('SVNSEA2E.UseFavor')}</h4>
    <p>${data.callupon}</p>
`
    return data
  }

  _sorceryChatData (data, htmlOptions) {
    data.metadata = `
    <p>${data.sorcsource},${data.subsource}</p>
    <p>${game.i18n.format('SVNSEA2E.Scale')}: ${data.scale} ${game.i18n.format('SVNSEA2E.Duration')}: ${data.duration}</p>
`
    return data
  }

  _storyChatData (data, htmlOptions) {
    data.metadata = `
    <h4>${game.i18n.localize('SVNSEA2E.Endings')}</h4>
    <p>${data.endings}</p>
    <h4>${game.i18n.localize('SVNSEA2E.Steps')}</h4>
    <p>${data.steps}</p>
`
    return data
  }
}
