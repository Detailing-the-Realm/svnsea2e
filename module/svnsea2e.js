// Import Modules
import { SVNSEA2E } from './config.js';
import { preloadHandlebarsTemplates } from './templates.js';
import { registerSystemSettings } from './settings.js';

// Import Applications
import { SvnSea2EActor } from './actor/actor.js';
import { ActorSheetSS2ePlayerCharacter } from './actor/sheets/playercharacter.js';
import { ActorSheetSS2eHero } from './actor/sheets/hero.js';
import { ActorSheetSS2eBrute } from './actor/sheets/brute.js';
import { ActorSheetSS2eMonster } from './actor/sheets/monster.js';
import { ActorSheetSS2eVillain } from './actor/sheets/villain.js';
import { ActorSheetSS2eShip } from './actor/sheets/ship.js';
import { ActorSheetSS2eDangerPts } from './actor/sheets/dangerpts.js';
import { SvnSea2EItem } from './item/item.js';
import { ItemSheetSS2eAdvantage } from './item/sheets/advantage.js';
import { ItemSheetSS2eArtifact } from './item/sheets/artifact.js';
import { ItemSheetSS2eBackground } from './item/sheets/background.js';
import { ItemSheetSS2eDuelStyle } from './item/sheets/duelstyle.js';
import { ItemSheetSS2eMonsterQuality } from './item/sheets/monsterquality.js';
import { ItemSheetSS2eSecretSociety } from './item/sheets/secretsociety.js';
import { ItemSheetSS2eScheme } from './item/sheets/scheme.js';
import { ItemSheetSS2eShipAdventure } from './item/sheets/shipadventure.js';
import { ItemSheetSS2eShipBackground } from './item/sheets/shipbackground.js';
import { ItemSheetSS2eSorcery } from './item/sheets/sorcery.js';
import { ItemSheetSS2eStory } from './item/sheets/story.js';
import LanguageSelector from './apps/language-selector.js';
import SkillSelector from './apps/skill-selector.js';

import * as migrations from './migration.js';
import { ItemSheetSS2eVirtue } from './item/sheets/virtue.js';
import { ItemSheetSS2eHubris } from './item/sheets/hubris.js';
import { chatEventHandler } from './eventhandler.js';

Hooks.once('init', async function () {
  console.log(`7th Sea 2E | Initializing 7th Sea Second Edition System
    ${SVNSEA2E.ASCII}`);
  game.svnsea2e = {
    applications: {
      SvnSea2EActor,
      SvnSea2EItem,
    },
    config: SVNSEA2E,
    migrations: migrations,
  };

  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: '1d20',
    decimals: 2,
  };

  CONFIG.SVNSEA2E = SVNSEA2E;
  CONFIG.SVNSEA2E.natTypes = duplicate(SVNSEA2E.nations);
  CONFIG.SVNSEA2E.natTypes.gisles = 'SVNSEA2E.RegionGlamourIsles';

  // Define custom Entity classes
  CONFIG.Actor.entityClass = SvnSea2EActor;
  CONFIG.Item.entityClass = SvnSea2EItem;

  // Register System Settings
  registerSystemSettings();

  // Register sheet application classes
  Actors.unregisterSheet('core', ActorSheet);
  Actors.registerSheet('svnsea2e', ActorSheetSS2ePlayerCharacter, {
    types: ['playercharacter'],
    makeDefault: true,
  });
  Actors.registerSheet('svnsea2e', ActorSheetSS2eHero, {
    types: ['hero'],
    makeDefault: true,
  });
  Actors.registerSheet('svnsea2e', ActorSheetSS2eBrute, {
    types: ['brute'],
    makeDefault: true,
  });
  Actors.registerSheet('svnsea2e', ActorSheetSS2eMonster, {
    types: ['monster'],
    makeDefault: true,
  });
  Actors.registerSheet('svnsea2e', ActorSheetSS2eVillain, {
    types: ['villain'],
    makeDefault: true,
  });
  Actors.registerSheet('svnsea2e', ActorSheetSS2eShip, {
    types: ['ship'],
    makeDefault: true,
  });
  Actors.registerSheet('svnsea2e', ActorSheetSS2eDangerPts, {
    types: ['dangerpts'],
    makeDefault: true,
  });

  Items.unregisterSheet('core', ItemSheet);
  Items.registerSheet('svnsea2e', ItemSheetSS2eAdvantage, {
    types: ['advantage'],
    makeDefault: true,
  });
  Items.registerSheet('svnsea2e', ItemSheetSS2eArtifact, {
    types: ['artifact'],
    makeDefault: true,
  });
  Items.registerSheet('svnsea2e', ItemSheetSS2eBackground, {
    types: ['background'],
    makeDefault: true,
  });
  Items.registerSheet('svnsea2e', ItemSheetSS2eDuelStyle, {
    types: ['duelstyle'],
    makeDefault: true,
  });
  Items.registerSheet('svnsea2e', ItemSheetSS2eMonsterQuality, {
    types: ['monsterquality'],
    makeDefault: true,
  });
  Items.registerSheet('svnsea2e', ItemSheetSS2eScheme, {
    types: ['scheme'],
    makeDefault: true,
  });
  Items.registerSheet('svnsea2e', ItemSheetSS2eSecretSociety, {
    types: ['secretsociety'],
    makeDefault: true,
  });
  Items.registerSheet('svnsea2e', ItemSheetSS2eShipAdventure, {
    types: ['shipadventure'],
    makeDefault: true,
  });
  Items.registerSheet('svnsea2e', ItemSheetSS2eShipBackground, {
    types: ['shipbackground'],
    makeDefault: true,
  });
  Items.registerSheet('svnsea2e', ItemSheetSS2eSorcery, {
    types: ['sorcery'],
    makeDefault: true,
  });
  Items.registerSheet('svnsea2e', ItemSheetSS2eStory, {
    types: ['story'],
    makeDefault: true,
  });
  Items.registerSheet('svnsea2e', ItemSheetSS2eVirtue, {
    types: ['virtue'],
    makeDefault: true,
  });
  Items.registerSheet('svnsea2e', ItemSheetSS2eHubris, {
    types: ['hubris'],
    makeDefault: true,
  });

  // If you need to add Handlebars helpers, here are a few useful examples:
  Handlebars.registerHelper('concat', function () {
    var outStr = '';
    for (var arg in arguments) {
      if (typeof arguments[arg] !== 'object') {
        outStr += arguments[arg];
      }
    }
    return outStr;
  });

  Handlebars.registerHelper('toLowerCase', function (str) {
    return str.toLowerCase();
  });

  Handlebars.registerHelper('capitalize', function (str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  });

  Handlebars.registerHelper('for', function (from, to, incr, block) {
    var accum = '';

    const count = parseInt(from) + parseInt(to);
    for (var i = from; i < count; i += incr) {
      block.data.index = i;
      block.data.first = i === 0;
      block.data.last = i === to;
      block.data.mod = Math.trunc(i / 5);
      block.data.remain = i % 5;
      accum += block.fn(this);
    }
    return accum;
  });

  Handlebars.registerHelper('iff', function (a, operator, b, opts) {
    var bool = false;
    switch (operator) {
      case '==':
        bool = a == b;
        break;
      case '!=':
        bool = a != b;
        break;
      case '>=':
        bool = a >= b;
        break;
      case '<=':
        bool = a <= b;
        break;
      case '>':
        bool = a > b;
        break;
      case '<':
        bool = a < b;
        break;
      default:
        throw 'Unknown operator ' + operator;
    }

    if (bool) {
      return opts.fn(this);
    } else {
      return opts.inverse(this);
    }
  });

  // Preload Handlebars Templates
  preloadHandlebarsTemplates();
});

/* -------------------------------------------- */

Hooks.once('ready', async function () {
  game.svnsea2e.packAdvs = await getAllPackAdvantages();
  console.log('7th Sea 2E | Loaded Compendium Advantages');
  // Wait to register hotbar drop hook on ready so that
  // modules could register earlier if they want to
  // Hooks.on('hotbarDrop', (bar, data, slot) => createSvnSea2EMacro(data, slot))
  let currentVersion = game.settings.get('svnsea2e', 'systemMigrationVersion');
  if (!currentVersion) {
    currentVersion = 0.6;
  }
  const NEEDS_MIGRATION_VERSION = 2.6;
  // const COMPATIBLE_MIGRATION_VERSION = 0.6
  const needMigration = currentVersion < NEEDS_MIGRATION_VERSION;

  // Perform the migration
  if (needMigration && game.user.isGM) {
    migrations.migrateWorld();
  }

  chatEventHandler();
});

/* -------------------------------------------- */

/**
 * This function runs after game data has been requested
 * and loaded from the servers, so entities exist
 */
Hooks.once('setup', function () {
  // Localize CONFIG objects once up-front
  const toLocalize = [
    'actorTypes',
    'natTypes',
    'artifactTypes',
    'crewStatuses',
    'durations',
    'itemTypes',
    'languages',
    'nations',
    'traits',
    'shipRoles',
    'skills',
    'sorceryTypes',
    'sorceryCats',
    'sorcerySubcats',
    'storyStatuses',
  ];

  // Exclude some from sorting where the default order matters
  const noSort = [];

  // Localize and sort CONFIG objects
  for (const o of toLocalize) {
    const localized = Object.entries(CONFIG.SVNSEA2E[o]).map((e) => {
      return [e[0], game.i18n.localize(e[1])];
    });
    if (!noSort.includes(o)) localized.sort((a, b) => a[1].localeCompare(b[1]));
    CONFIG.SVNSEA2E[o] = localized.reduce((obj, e) => {
      obj[e[0]] = e[1];
      return obj;
    }, {});
  }
});

/* -------------------------------------------- */

/**
 * Set the default image for an item type instead of the mystery man
 **/
Hooks.on('preCreateItem', function (document, options, userId) {
  document.data.update({
    img: 'systems/svnsea2e/icons/' + document.data.type + '.jpg',
  });
});

/* -------------------------------------------- */

/**
 * Set the default image for an actor type instead of the mystery man
 **/
Hooks.on('preCreateActor', function (entity, options, userId) {
  entity.img = 'systems/svnsea2e/icons/' + entity.type + '.jpg';
  if (entity.name == '') {
    entity.name = 'New ' + entity.type[0].toUpperCase() + entity.type.slice(1);
  }
});

async function getAllPackAdvantages() {
  const advantages = [];
  const packs = game.packs.entries;
  for (var i = 0; i < packs.length; i++) {
    const pack = packs[i];
    if (pack.metadata.entity === 'Item') {
      const pitems = await pack.getIndex();
      for (let j = 0; j < pitems.length; j++) {
        const entry = await pack.getEntry(pitems[j]._id);
        if (entry.type === 'advantage') {
          advantages.push(entry);
        }
      }
    }
  }
  return advantages;
}

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */
