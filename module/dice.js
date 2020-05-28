export async function skillRoll ({
  skillnd,
  data = {},
  event = {},
  template,
  title,
  speaker
}) {
  // Handle input arguments
  speaker = speaker || ChatMessage.getSpeaker()
  let rolled = false
  // Define inner roll function
  const _roll = async function (skillnd, form = null) {
    const nd = skillnd + parseInt(form.trait.value) + parseInt(form.bonusDice.value)
    const formula = nd.toString() + 'd10'
    const roll = new Roll(formula).roll()
    const messageOptions = { rollmode: 'gmroll' }
    const token = this.actor.token;
    const templateData = {
      actor: this.actor,
      skill: this.data,
      trait: form.trait.name,
      data: this.getChatData(),
      labels: this.labels,
      roll: '54'
    };

    const template = `systems/svnsea2e/templates/chats/skillroll-card.html`;
    const html = await renderTemplate(template, templateData);

    // Basic chat message data
    const chatData = {
      title: title,
      user: game.user._id,
      type: CONST.CHAT_MESSAGE_TYPES.OTHER,
      content: html,
      speaker: {
        actor: this.actor._id,
        token: this.actor.token,
        alias: this.actor.name
      }
    }

    // Toggle default roll mode
    let rollMode = game.settings.get("core", "rollMode")
    if ( ["gmroll", "blindroll"].includes(rollMode) ) chatData["whisper"] = ChatMessage.getWhisperIDs("GM")
    if ( rollMode === "blindroll" ) chatData["blind"] = true

    // Create the chat message
    let chatmsg = ChatMessage.create(chatData)
    rolled = true
    return roll
  }

  let traits = {}
  for(let trait of Object.keys(data.traits)) {
    traits[CONFIG.SVNSEA2E.traits[trait]] = data.traits[trait].value
  }

  // Render modal dialog
  template = template || 'systems/svnsea2e/templates/chats/roll-dialog.html'
  let dialogData = {
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
          label: game.i18n.localize("SVNSEA2E.Roll"),
          callback: html => roll = _roll(skillnd, html[0].children[0])
        }
      },
      close: html => {
        if (onClose) onClose(html, data)
        resolve(rolled ? roll : false)
      }
    }, dialogOptions).render(true)
  })
}
