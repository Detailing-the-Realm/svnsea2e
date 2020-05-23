import {
  SVNSEA2E
} from 'config.js'

export async function skillRoll({
  actor,
  data,
  event = {},
  skill,
  trait,
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

  let rolled = false

  // Define inner roll function
  const _roll = function(parts, skill, trait) {
    var rdata = {
      rolls: [],
      orgrolls: '',
      raises: 0,
      threshold: 10,
      formulas: [],
      curformula: '',
      curresult: 0,
      unused: []
    }
    var tomatch = SVNSEA2E.match10
    if (skill >= 4) {
      rdata.threshold = 15
      tomatch = SVNSEA2E.match15
    }
    for (var i = 0; i < (trait + skill); i++) {
      var roll = rolld10()
      if (roll == 10) {
        if (skill == 5) {
          var explode = rolld10()
          rdata.rolls.push(explode)
        }
        if (skill >= 4) {
          rdata.rolls.push(roll)
        } else {
          rdata.raises++
        }
      } else {
        rdata.rolls.push(roll)
      }
    }
    rdata.rolls.sort(function(a, b) {
      return a - b
    })
    rdata.orgrolls = JSON.parse(JSON.stringify(rdata.rolls))
    console.log('Beginning rolls are: ' + rdata.rolls.toString())

    // Look for two number matches that will equal the match threshold excactly
    for (var c = 0; c < tomatch.two.length; c++) {
      var vals = getIndexes(rdata, tomatch.two[c])
      while (vals[0] > -1 && vals[1] > -1) {
        rdata.raises = rdata.raises + addRaise(rdata.threshold)
        rdata.formulas.push(rdata.rolls[vals[0]].toString() + ' + ' + rdata.rolls[vals[1]].toString())
        rdata.rolls.splice(vals[0], 1)
        rdata.rolls.splice(rdata.rolls.indexOf(tomatch.two[c][1]), 1)

        vals = getIndexes(rdata, tomatch.two[c])
      }
    }

    console.log('Raises are: ' + rdata.raises.toString())
    console.log('Calculations for far to meet threshold: ' + rdata.formulas.toString())
    console.log('Rolls left are: ' + rdata.rolls.toString())

    // Looks for matches based on 3 roll combos that add up to the threshold
    for (c = 0; c < tomatch.three.length; c++) {
      vals = getIndexes(rdata, tomatch.three[c])
      while (vals[0] > -1 && vals[1] > -1 && vals[2] > -1) {
        rdata.raises = rdata.raises + addRaise(rdata.threshold)
        rdata.formulas.push(rdata.rolls[vals[0]].toString() + ' + ' + rdata.rolls[vals[1]].toString() + ' + ' + rdata.rolls[vals[2]].toString())
        rdata.rolls.splice(vals[0], 1)
        rdata.rolls.splice(rdata.rolls.indexOf(tomatch.three[c][1]), 1)
        rdata.rolls.splice(rdata.rolls.indexOf(tomatch.three[c][2]), 1)

        vals = getIndexes(rdata, tomatch.three[c])
      }
    }

    console.log('Raises are: ' + rdata.raises.toString())
    console.log('Calculations for far to meet threshold: ' + rdata.formulas.toString())
    console.log('Rolls left are: ' + rdata.rolls.toString())

    // Now start adding the list elements together in order and see if they are greater than the threshold.
    // Should consider the reroll at this point. Probably reroll the lowest number.
    var rerolled = false
    if (skill > 2 && rdata.rolls[0] <= 2) {
      var introll = rdata.rolls[0]
      rdata.rolls[0] = rolld10()
      console.log('Rerolled ' + introll.toString() + ' to ' + rdata.rolls[0].toString())
      rerolled = true
    }
    rdata.rolls.sort(function(a, b) {
      return b - a
    })
    rdata = addUnused(rdata)
    console.log(rdata.unused)
    //      if(unused.length > 0 && skill > 2 && rerolled = false && result < rdata['threshold']){
    //        introll = rdata['rolls'][0]
    //        rdata['rolls'][0] = rolld10()
    //        console.log('Rerolled ' + introll.toString() + ' to ' + rdata['rolls'][0].toString())
    //        rerolled = true
    //      }
    // If the threshold is 15 then we want to capture a 10 as one raise if it is left over.
    if (rdata.curresult >= 10) {
      rdata.raises++
      rdata.formulas.push(rdata.curformula.substring(3, rdata.curformula.length))
      rdata.unused = []
    }

    console.log('Rolls are: ' + rdata.orgrolls.toString())
    console.log('Raises are: ' + rdata.raises.toString())
    console.log('Calculations for far to meet threshold: ' + rdata.formulas.toString())
    console.log('left Over: ' + rdata.unused.toString())

    roll.toMessage({
      speaker: speaker,
      flavor: flavor
    }, {})
    rolled = true
    return rdata
  }

  // Render modal dialog
  template = template || 'systems/svnsea2e/templates/chat/roll-dialog.html'
  let dialogData = {
    data: data,
    config: CONFIG
  }
  const html = await renderTemplate(template, dialogData)

  // Create the Dialog window
  let roll
  return new Promise(resolve => {
    new Dialog({
      title: 'Skill Roll',
      content: html,
      buttons: {
        brawn: {
          label: game.i18n.localize('SVNSEA2E.TraitBrawn'),
          callback: () => console.log('Chose One')
        },
        finesse: {
          label: game.i18n.localize('SVNSEA2E.TraitFinesse'),
          callback: () => console.log('Chose Two')
        },
        panache: {
          label: game.i18n.localize('SVNSEA2E.TraitPanache'),
          callback: () => console.log('Chose Three')
        },
        resolve: {
          label: game.i18n.localize('SVNSEA2E.TraitResolve'),
          callback: () => console.log('Chose Four')
        },
        wits: {
          label: game.i18n.localize('SVNSEA2E.TraitWits'),
          callback: () => console.log('Chose Five')
        }
      },
      close: () => console.log('This always is logged no matter which option is chosen')
    }, dialogOptions).render(true)
  })
}

export async function getIndexes(rdata, tomatch) {
  console.log('Matching these values: ' + tomatch.toString())
  var values = []
  values.push(rdata.rolls.indexOf(tomatch[0]))
  if (tomatch[0] == tomatch[1]) {
    values.push(rdata.rolls.indexOf(tomatch[1], values[0] + 1))
  } else {
    values.push(rdata.rolls.indexOf(tomatch[1]))
  }
  if (tomatch.length > 2) {
    if (tomatch[0] == tomatch[2]) {
      values.push(rdata.rolls.indexOf(tomatch[2], values[1] + 1))
    } else {
      values.push(rdata.rolls.indexOf(tomatch[2]))
    }
  }
  console.log('Comparing these indexes: ' + values.toString())
  return values
}

export async function addUnused (rdata) {
  rdata.curformula = ''
  var i = rdata.rolls.length
  while (i--) {
    rdata.unused.push(rdata.rolls[i])
    rdata.curresult = rdata.curresult + rdata.rolls[i]
    rdata.curformula = rdata.curformula + ' + ' + rdata.rolls[i].toString()
    rdata.rolls.splice(i, 1)
    if (rdata.curresult >= rdata.threshold) {
      rdata.formulas.push(rdata.curformula.substring(3, rdata.curformula.length))
      rdata.raises = rdata.raises + addRaise(rdata.threshold)
      rdata.result = 0
      rdata.unused = []
      rdata.curformula = ''
    }
  }
  return rdata
}

export async function addRaise (threshold = 10) {
  var raises = 1
  if (threshold == 15) {
    raises++
  }
  return raises
}

export async function rolld10 () {
  return Math.floor(Math.random() * 10) + 1
}
