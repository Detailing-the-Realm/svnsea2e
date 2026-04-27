import { ActorType } from "../enums";

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
  if ((threshold === 15 && !incThreshold) || (threshold === 20 && incThreshold))
    raises++;
  return raises;
};

const _leftOverDice = function (rolls, threshold = 10, incThreshold = false) {
  let total = 0;
  const response = {
    rolls: [],
    combos: [],
    raises: 0,
  };
  let currentUsedDice = [];

  //Loop through the left over rolls and create die combos that are greater than the threshold
  let index = rolls.length;
  while (index > 0) {
    index--;
    if (index > 0 && total === 0) {
      total += parseInt(rolls[0]) + parseInt(rolls[index]);
      currentUsedDice.push(rolls.splice(index, 1));
      currentUsedDice.push(rolls.splice(0, 1));
      index--; // length needs to shrink twice because we removed two elements from the array
    } else {
      total += parseInt(rolls[0]);
      currentUsedDice.push(rolls.splice(0, 1));
    }

    if (total >= threshold) {
      response['raises'] += _addRaise(threshold, incThreshold);
      response['combos'].push(
        currentUsedDice.sort((a, b) => a - b).join(' + '),
      );
      currentUsedDice = [];
      total = 0;
    }
  }

  response['rolls'] = currentUsedDice;
  return response;
};

/**
 * Bottom-up bitmask DP over leftover dice. When a second-chance pass
 * exists (natural 15 or GM-increased 20), splits dice between primary
 * combos (2 raises) and secondary combos (1 raise) to maximize raises.
 * Ties prefer more leftover dice (tighter combos). Subset sums and
 * popcounts are precomputed so the inner loop is branch-light. Falls
 * back to the greedy `_leftOverDice` when no second-chance pass applies.
 *
 * @param {number[]} rolls dice values; mutated to empty on return
 * @param {number} [threshold=10] raise threshold (10, 15, or 20)
 * @param {boolean} [incThreshold=false] GM increased threshold by 5
 * @returns {{rolls: number[], combos: string[], raises: number}}
 *   leftover dice, combo strings, and total raises earned
 */
const _optimizedLeftOverDice = function (
  rolls,
  threshold = 10,
  incThreshold = false,
) {
  const hasSecondChance =
    (!incThreshold && threshold === 15) || (incThreshold && threshold === 20);

  if (!hasSecondChance) {
    return _leftOverDice(rolls, threshold, incThreshold);
  }

  const dice = [...rolls].map(Number).sort((a, b) => a - b);
  const n = dice.length;

  if (n === 0) {
    rolls.length = 0;
    return { rolls: [], combos: [], raises: 0 };
  }

  const primaryRaiseVal = _addRaise(threshold, incThreshold);
  const secondaryThreshold = threshold - 5;
  const total = 1 << n;

  const sums = new Int32Array(total);
  const popcounts = new Int8Array(total);
  for (let m = 1; m < total; m++) {
    const low = m & -m;
    sums[m] = sums[m ^ low] + dice[31 - Math.clz32(low)];
    popcounts[m] = popcounts[m >> 1] + (m & 1);
  }

  // Per-mask DP. chosenSub=0 marks the base case (no combo taken).
  const memoRaises = new Int32Array(total);
  const memoChosenSub = new Int32Array(total);
  const memoUnusedMask = new Int32Array(total);

  for (let mask = 1; mask < total; mask++) {
    let bestRaises = 0;
    let bestChosenSub = 0;
    let bestUnusedMask = mask;

    let sub = mask;
    while (sub > 0) {
      const subSum = sums[sub];
      if (subSum >= secondaryThreshold) {
        // A subset meeting primary always scores >= splitting into
        // secondaries on the same dice, so don't double-evaluate.
        const raiseVal = subSum >= threshold ? primaryRaiseVal : 1;
        const rest = mask ^ sub;
        const totalRaises = raiseVal + memoRaises[rest];
        const restUnused = memoUnusedMask[rest];
        if (
          totalRaises > bestRaises ||
          (totalRaises === bestRaises &&
            popcounts[restUnused] > popcounts[bestUnusedMask])
        ) {
          bestRaises = totalRaises;
          bestChosenSub = sub;
          bestUnusedMask = restUnused;
        }
      }
      sub = (sub - 1) & mask;
    }

    memoRaises[mask] = bestRaises;
    memoChosenSub[mask] = bestChosenSub;
    memoUnusedMask[mask] = bestUnusedMask;
  }

  // Walk the chain to materialize combos. Bits of dice are ascending,
  // so extracting via (s & -s) yields each combo already sorted.
  const combos = [];
  let cur = total - 1;
  while (memoChosenSub[cur] !== 0) {
    const sub = memoChosenSub[cur];
    const subsetDice = [];
    let s = sub;
    while (s) {
      const low = s & -s;
      subsetDice.push(dice[31 - Math.clz32(low)]);
      s ^= low;
    }
    combos.push(subsetDice.join(' + '));
    cur ^= sub;
  }

  const remaining = [];
  let u = memoUnusedMask[total - 1];
  while (u) {
    const low = u & -u;
    remaining.push(dice[31 - Math.clz32(low)]);
    u ^= low;
  }

  rolls.length = 0;
  return { rolls: remaining, combos, raises: memoRaises[total - 1] };
};

const _calculBonusDice = function (form) {
  const flairDice = form.flairDice?.checked ? 1 : 0;
  const interpretationDice = form.interpretationDice?.checked ? 1 : 0;
  const heroDices = parseInt(form.useForMe?.value || 0);
  const helpDices = parseInt(form.useForHelpMe?.value || 0) * 3;

  return (
    parseInt(form.bonusDice.value) +
    flairDice +
    interpretationDice +
    heroDices +
    helpDices
  );
};

const _spendHeroPoint = function (form, actor) {
  const heroDices = parseInt(form.useForMe?.value || 0);
  const heroPts = actor.system.heropts || 0;
  if (heroDices > heroPts) {
    ui.notifications.error(game.i18n.format('SVNSEA2E.NotEnoughHero', {}));
    return false;
  }

  if (heroDices > 0) {
    actor.update({
      data: { heropts: heroPts - heroDices },
    });
  }
  return true;
};

/**
 * Handle clickable rolls.
 * @param rolldata roll data from actor
 * @param rolldata.threshold the threshold to have a raise
 * @param rolldata.skilldice the skill value
 * @param rolldata.explode indicate if 10 explode or not
 * @param rolldata.reroll indicate if dice explose
 *
 * @param actor the actor use for roll
 * @param data the actor data
 *
 * @param form data of roll dialog
 * @param form.trait value of attribute
 * @param form.flairDice indicate if flairDice must be add
 * @param form.interpretationDice indicate if interpretationDice must be add
 * @param form.useForMe
 * @param form.useForHelpMe
 * @param form.bonusDice
 * @param form.increaseThreshold
 * @param form.addOneToDice
 * @param form.joieDeVivreAdvantage
 *
 * @param template url of roll chat template
 * @param title
 * @private
 */
export async function roll({
  rolldata = {},
  actor = {},
  data = {},
  form = {},
  template,
  title,
}) {
  //We don't use Hero points with a Villain or a monster
  if (
    actor.type !== ActorType.VILLAIN &&
    actor.type !== ActorType.MONSTER &&
    !_spendHeroPoint(form, actor)
  ) {
    console.error('not enought hero point');
    return false;
  }

  const skillDice = parseInt(rolldata['skilldice']);
  const nd = skillDice + parseInt(form.trait.value) + _calculBonusDice(form);

  const incThreshold =
    form.increaseThreshold !== undefined ? form.increaseThreshold.checked : 0;
  const addOneToDice =
    form.addOneToDice !== undefined ? form.addOneToDice.checked : false;

  const r = new Roll(`${nd}d10${rolldata['explode'] ? 'x' : ''}`);
  await r.evaluate();
  const rolls = getSortedRolls(r).map((d) => (addOneToDice ? d + 1 : d));
  const exploded = rolldata['explode'];

  // GM spent a danger point and increased the threshold by 5
  if (incThreshold) rolldata.threshold += 5;

  const matcharr =
    rolldata['threshold'] === 15
      ? CONFIG.SVNSEA2E.match15
      : rolldata['threshold'] === 20
      ? CONFIG.SVNSEA2E.match20
      : CONFIG.SVNSEA2E.match10;

  let raises = 0;
  let combos = [];

  // If the threshold is 10 then count all 10s as raises
  if (rolldata['threshold'] === 10) {
    let i = rolls.length;
    while (i--) {
      if (rolls[i] >= 10) {
        raises++;
        combos.push(rolls[i]);
        rolls.splice(i, 1);
      } else if (rolls[i] < 10) {
        break;
      }
    }
  }

  // Count all dice <= skills as raise
  if (form.joieDeVivreAdvantage?.checked) {
    let i = rolls.length;
    while (i--) {
      if (rolls[i] <= skillDice) {
        raises++;
        combos.push(rolls[i]);
        rolls.splice(i, 1);
      }
    }
  }

  // Loop through the dice and add raises for all two dice combos that match the threshold.
  for (let c = 0; c < matcharr.two.length; c++) {
    let vals = _getIndexes(rolls, matcharr.two[c]);
    while (vals[0] > -1 && vals[1] > -1) {
      raises += _addRaise(rolldata['threshold'], incThreshold);
      combos.push(
        rolls[vals[0]].toString() + ' + ' + rolls[vals[1]].toString(),
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
      raises += _addRaise(rolldata['threshold'], incThreshold);
      combos.push(
        rolls[vals[0]].toString() +
          ' + ' +
          rolls[vals[1]].toString() +
          ' + ' +
          rolls[vals[2]].toString(),
      );
      rolls.splice(vals[0], 1);
      rolls.splice(rolls.indexOf(matcharr.three[c][1]), 1);
      rolls.splice(rolls.indexOf(matcharr.three[c][2]), 1);
      vals = _getIndexes(rolls, matcharr.three[c]);
    }
  }

  let i = rolls.length;
  let rerolled = false;
  let reroll = '';

  const sortedRolls = getSortedRolls(r);

  // reroll the first unused die in our results
  if (i > 0 && rolldata['reroll']) {
    const orgroll = addOneToDice ? rolls[0] - 1 : rolls[0];
    rolls[0] = Math.floor(Math.random() * 10) + 1;

    reroll = game.i18n.format('SVNSEA2E.Reroll', {
      roll1: orgroll,
      roll2: rolls[0],
    });
    rerolled = true;

    for (let k = 0; k < sortedRolls.length; k++) {
      if (sortedRolls[k] == orgroll) {
        sortedRolls[k] = rolls[0];
        break;
      }
    }

    if (addOneToDice) rolls[0] = rolls[0] + 1;

    sortedRolls.sort(rollComparator);
    rolls.sort(rollComparator);
  }

  // If the threshold is 10 then count all 10s as raises
  if (rolldata['threshold'] == 10) {
    let j = rolls.length;
    while (j--) {
      if (rolls[j] >= 10) {
        raises++;
        combos.push(rolls[j]);
        rolls.splice(j, 1);
        i = rolls.length;
      } else if (rolls[j] < 10) {
        break;
      }
    }
  }

  let leftdata = _optimizedLeftOverDice(
    rolls,
    rolldata['threshold'],
    incThreshold,
  );
  combos.push(...leftdata['combos']);
  raises += leftdata['raises'];

  const messageOptions = {
    rollmode: 'gmroll',
  };

  let thresholdmsg = rolldata['threshold'].toString();

  if (incThreshold)
    thresholdmsg =
      rolldata['threshold'].toString() +
      ' ' +
      game.i18n.localize('SVNSEA2E.GMIncreasedThreshold');

  const unusedDice = leftdata['rolls'].length;

  const templateData = {
    actor: actor,
    raisetxt:
      raises > 1
        ? game.i18n.localize('SVNSEA2E.Raises')
        : game.i18n.localize('SVNSEA2E.Raise'),
    unusedDiceTxt:
      unusedDice > 1
        ? game.i18n.localize('SVNSEA2E.UnusedDice')
        : game.i18n.localize('SVNSEA2E.UnusedDie'),
    data: data,
    exploded: exploded,
    explosions: game.i18n.format('SVNSEA2E.RollsExploded'),
    hasAddOneToDice: addOneToDice,
    addOneToDiced: game.i18n.format('SVNSEA2E.AddOneToDiced'),
    labels: data.labels,
    rolls: sortedRolls,
    raises: raises,
    rCombos: game.i18n.localize('SVNSEA2E.RaiseCombos'),
    combos: combos.map((c) => `${c}`),
    rerolled: rerolled,
    reroll: reroll,
    unusedDice,
    dicesNumber: nd,
    threshold: game.i18n.format('SVNSEA2E.RollThreshold', {
      threshold: thresholdmsg,
    }),
  };

  const html = await renderTemplate(template, templateData);
  const rollMode = game.settings.get('core', 'rollMode');
  // Basic chat message
  const chatData = {
    user: game.user.id,
    type: CONST.CHAT_MESSAGE_STYLES.OTHER,
    content: html,
    image: actor.img,
    speaker: {
      actor: actor.id,
      token: actor.token,
      alias: actor.name,
    },
    flavor: title,
    blind: rollMode === 'blindroll',
    // Toggle default roll mode
    whisper: ['gmroll', 'blindroll'].includes(rollMode)
      ? ChatMessage.getWhisperRecipients('GM')
      : undefined,
  };

  // Check if the dice3d module exists (Dice So Nice). If it does, post a roll in that and then send to chat after the roll has finished. If not just send to chat.
  if (game.dice3d) {
    game.dice3d.showForRoll(r).then(() => {
      // Create the chat message
      ChatMessage.create(chatData);
    });
  } else {
    // Create the chat message
    ChatMessage.create(chatData);
  }

  return r;
}

function rollComparator(a, b) {
  return a - b;
}

function getSortedRolls(roll) {
  return roll.terms[0].results.map((dr) => dr.result).sort((a, b) => a - b);
}
