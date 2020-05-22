export async function skillRoll (skill, trait) {
  var match10 = {
    two: [
      [1, 9],
      [2, 8],
      [3, 7],
      [4, 6],
      [5, 5]
    ],
    three: [
      [1, 1, 8],
      [1, 2, 7],
      [1, 3, 6],
      [1, 4, 5],
      [2, 2, 6],
      [2, 3, 5],
      [4, 4, 2],
      [3, 3, 4]
    ]
  }
  var match15 = {
    two: [
      [5, 10],
      [6, 9],
      [7, 8]
    ],
    three: [
      [1, 4, 10],
      [1, 5, 9],
      [1, 6, 8],
      [1, 7, 7],
      [2, 3, 10],
      [2, 4, 9],
      [2, 5, 8],
      [2, 6, 7],
      [3, 3, 9],
      [3, 4, 8],
      [3, 5, 7],
      [6, 6, 3],
      [4, 4, 7],
      [4, 5, 6],
      [5, 5, 5]
    ]
  }

  var data = {
    rolls: [],
    orgrolls: '',
    raises: 0,
    threshold: 10,
    formulas: [],
    curformula: '',
    curresult: 0,
    unused: []
  }
  var tomatch = match10
  if (skill >= 4) {
    data.threshold = 15
    tomatch = match15
  }
  for (var i = 0; i < (trait + skill); i++) {
    var roll = rolld10()
    if (roll == 10) {
      if (skill == 5) {
        var explode = rolld10()
        data.rolls.push(explode)
      }
      if (skill >= 4) {
        data.rolls.push(roll)
      } else {
        data.raises++
      }
    } else {
      data.rolls.push(roll)
    }
  }
  data.rolls.sort(function (a, b) {
    return a - b
  })
  data.orgrolls = JSON.parse(JSON.stringify(data.rolls))
  console.log('Beginning rolls are: ' + data.rolls.toString())

  // Look for two number matches that will equal the match threshold excactly
  for (var c = 0; c < tomatch.two.length; c++) {
    var vals = getIndexes(data, tomatch.two[c])
    while (vals[0] > -1 && vals[1] > -1) {
      data.raises = data.raises + addRaise(data.threshold)
      data.formulas.push(data.rolls[vals[0]].toString() + ' + ' + data.rolls[vals[1]].toString())
      data.rolls.splice(vals[0], 1)
      data.rolls.splice(data.rolls.indexOf(tomatch.two[c][1]), 1)

      vals = getIndexes(data, tomatch.two[c])
    }
  }

  console.log('Raises are: ' + data.raises.toString())
  console.log('Calculations for far to meet threshold: ' + data.formulas.toString())
  console.log('Rolls left are: ' + data.rolls.toString())

  // Looks for matches based on 3 roll combos that add up to the threshold
  for (c = 0; c < tomatch.three.length; c++) {
    vals = getIndexes(data, tomatch.three[c])
    while (vals[0] > -1 && vals[1] > -1 && vals[2] > -1) {
      data.raises = data.raises + addRaise(data.threshold)
      data.formulas.push(data.rolls[vals[0]].toString() + ' + ' + data.rolls[vals[1]].toString() + ' + ' + data.rolls[vals[2]].toString())
      data.rolls.splice(vals[0], 1)
      data.rolls.splice(data.rolls.indexOf(tomatch.three[c][1]), 1)
      data.rolls.splice(data.rolls.indexOf(tomatch.three[c][2]), 1)

      vals = getIndexes(data, tomatch.three[c])
    }
  }

  console.log('Raises are: ' + data.raises.toString())
  console.log('Calculations for far to meet threshold: ' + data.formulas.toString())
  console.log('Rolls left are: ' + data.rolls.toString())

  // Now start adding the list elements together in order and see if they are greater than the threshold.
  // Should consider the reroll at this point. Probably reroll the lowest number.
  var rerolled = false
  if (skill > 2 && data.rolls[0] <= 2) {
    var introll = data.rolls[0]
    data.rolls[0] = rolld10()
    console.log('Rerolled ' + introll.toString() + ' to ' + data.rolls[0].toString())
    rerolled = true
  }
  data.rolls.sort(function (a, b) {
    return b - a
  })
  data = addUnused(data)
  console.log(data.unused)
  //      if(unused.length > 0 && skill > 2 && rerolled = false && result < data['threshold']){
  //        introll = data['rolls'][0]
  //        data['rolls'][0] = rolld10()
  //        console.log('Rerolled ' + introll.toString() + ' to ' + data['rolls'][0].toString())
  //        rerolled = true
  //      }
  // If the threshold is 15 then we want to capture a 10 as one raise if it is left over.
  if (data.curresult >= 10) {
    data.raises++
    data.formulas.push(data.curformula.substring(3, data.curformula.length))
    data.unused = []
  }

  console.log('Rolls are: ' + data.orgrolls.toString())
  console.log('Raises are: ' + data.raises.toString())
  console.log('Calculations for far to meet threshold: ' + data.formulas.toString())
  console.log('left Over: ' + data.unused.toString())
}

export async function getIndexes (data, tomatch) {
  console.log('Matching these values: ' + tomatch.toString())
  var values = []
  values.push(data.rolls.indexOf(tomatch[0]))
  if (tomatch[0] == tomatch[1]) {
    values.push(data.rolls.indexOf(tomatch[1], values[0] + 1))
  } else {
    values.push(data.rolls.indexOf(tomatch[1]))
  }
  if (tomatch.length > 2) {
    if (tomatch[0] == tomatch[2]) {
      values.push(data.rolls.indexOf(tomatch[2], values[1] + 1))
    } else {
      values.push(data.rolls.indexOf(tomatch[2]))
    }
  }
  console.log('Comparing these indexes: ' + values.toString())
  return values
}
export async function addUnused(data) {
  data.curformula = ''
  var i = data.rolls.length
  while (i--) {
    data.unused.push(data.rolls[i])
    data.curresult = data.curresult + data.rolls[i]
    data.curformula = data.curformula + ' + ' + data.rolls[i].toString()
    data.rolls.splice(i, 1)
    if (data.curresult >= data.threshold) {
      data.formulas.push(data.curformula.substring(3, data.curformula.length))
      data.raises = data.raises + addRaise(data.threshold)
      data.result = 0
      data.unused = []
      data.curformula = ''
    }
  }
  return data
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
