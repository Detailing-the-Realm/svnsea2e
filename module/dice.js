export async function skillRoll ({
  skill,
  data = {},
  event = {},
  template,
  title,
  speaker,
  flavor,
  onClose,
  dialogOptions
}) {
  // Handle input arguments
  flavor = flavor || title
  speaker = speaker || ChatMessage.getSpeaker()
  let rolled = false;
  // Define inner roll function
  const _roll = function (skill, form = null) {
    let roll = new Roll('10d10').roll()
    roll.toMessage({
      speaker: speaker,
      flavor: flavor
    }, {})
    rolled = true
    return roll
  }
  let traits = {}
  for(let trait of Object.keys(data.traits)) {
    console.log(CONFIG.SVNSEA2E.traits[trait])
    traits[CONFIG.SVNSEA2E.traits[trait]] = data.traits[trait].value
  }
  console.log(traits)

  // Render modal dialog
  template = template || 'systems/svnsea2e/templates/chats/roll-dialog.html'
  let dialogData = {
    data: data,
    traits: traits
  }

  const html = await renderTemplate(template, dialogData)

  console.log(html)
  // Create the Dialog window
  let roll
  return new Promise(resolve => {
    new Dialog({
      title: 'Skill Roll',
      content: html,
      buttons: {
        roll: {
          label: game.i18n.localize("SVNSEA2E.Roll"),
          callback: html => roll = _roll(skill, html[0].children[0])
        }
      },
      close: html => {
        if (onClose) onClose(html, data)
        resolve(rolled ? roll : false)
      }
    }, dialogOptions).render(true)
  })
}
