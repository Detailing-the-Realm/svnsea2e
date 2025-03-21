// Import Modules
import './assets/svnsea2e.scss';
import { SVNSEA2E } from './config.js';
import { registerSystemSettings } from './settings.js';
import { preloadHandlebarsTemplates } from './templates.js';
import { ActorType, ItemTypes } from './enums';

// Import System Data Models
import { BruteModel } from './actor/models/bruteModel';
import { DangerPointsModel } from './actor/models/dangerPointsModel';
import { HeroModel } from './actor/models/heroModel';
import { MonsterModel } from './actor/models/monsterModel';
import { PlayerModel } from './actor/models/playerModel';
import { ShipModel } from './actor/models/shipModel';
import { VillainModel } from './actor/models/villainModel';

import { AdvantageModel } from './item/models/advantageModel';
import { ArtifactModel } from './item/models/artifactModel';
import { BackgroundModel } from './item/models/backgroundModel';
import { DuelStyleModel } from './item/models/duelStyleModel';
import { MonsterQualityModel } from './item/models/monsterQualityModel';
import { SchemeModel } from './item/models/schemeModel';
import { ShipAdventureModel } from './item/models/shipAdventureModel';
import { ShipBackgroundModel } from './item/models/shipBackgroundModel';
import { VirtueModel } from './item/models/virtueModel';
import { HubrisModel } from './item/models/hubrisModel';
import { SecretSocietyModel } from './item/models/secretSocietyModel';
import { SorceryModel } from './item/models/sorceryModel';
import { StoryModel } from './item/models/storyModel';

// Import Applications
import { SvnSea2EActor } from './actor/actor.js';
import { ActorSheetSS2eBrute } from './actor/sheets/brute.js';
import { ActorSheetSS2eDangerPts } from './actor/sheets/dangerpts.js';
import { ActorSheetSS2eHero } from './actor/sheets/hero.js';
import { ActorSheetSS2eMonster } from './actor/sheets/monster.js';
import { ActorSheetSS2ePlayerCharacter } from './actor/sheets/playercharacter.js';
import { ActorSheetSS2eShip } from './actor/sheets/ship.js';
import { ActorSheetSS2eVillain } from './actor/sheets/villain.js';
import { SvnSea2EItem } from './item/item.js';
import { ItemSheetSS2eAdvantage } from './item/sheets/advantage.js';
import { ItemSheetSS2eArtifact } from './item/sheets/artifact.js';
import { ItemSheetSS2eBackground } from './item/sheets/background.js';
import { ItemSheetSS2eDuelStyle } from './item/sheets/duelstyle.js';
import { ItemSheetSS2eMonsterQuality } from './item/sheets/monsterquality.js';
import { ItemSheetSS2eScheme } from './item/sheets/scheme.js';
import { ItemSheetSS2eSecretSociety } from './item/sheets/secretsociety.js';
import { ItemSheetSS2eShipAdventure } from './item/sheets/shipadventure.js';
import { ItemSheetSS2eShipBackground } from './item/sheets/shipbackground.js';
import { ItemSheetSS2eSorcery } from './item/sheets/sorcery.js';
import { ItemSheetSS2eStory } from './item/sheets/story.js';

import { chatEventHandler } from './eventhandler.js';
import { ItemSheetSS2eHubris } from './item/sheets/hubris.js';
import { ItemSheetSS2eVirtue } from './item/sheets/virtue.js';
import * as migrations from './migration.js';
import { emitCharacterChange } from './toolbox/socket.js';
import { Toolbox } from './toolbox/toolbox.js';


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
    toolbox: new Toolbox(),
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
  CONFIG.SVNSEA2E.natTypes = foundry.utils.duplicate(SVNSEA2E.nations);
  CONFIG.SVNSEA2E.natTypes.gisles = 'SVNSEA2E.RegionGlamourIsles';

  // Define custom Entity classes
  CONFIG.Actor.documentClass = SvnSea2EActor;
  CONFIG.Item.documentClass = SvnSea2EItem;

  CONFIG.Actor.dataModels[ActorType.BRUTE] = BruteModel;
  CONFIG.Actor.dataModels[ActorType.DANGERPOINTS] = DangerPointsModel;
  CONFIG.Actor.dataModels[ActorType.HERO] = HeroModel;
  CONFIG.Actor.dataModels[ActorType.MONSTER] = MonsterModel;
  CONFIG.Actor.dataModels[ActorType.PLAYER] = PlayerModel;
  CONFIG.Actor.dataModels[ActorType.SHIP] = ShipModel;
  CONFIG.Actor.dataModels[ActorType.VILLAIN] = VillainModel;

  CONFIG.Item.dataModels[ItemTypes.ADVANTAGE] = AdvantageModel;
  CONFIG.Item.dataModels[ItemTypes.ARTIFACT] = ArtifactModel;
  CONFIG.Item.dataModels[ItemTypes.BACKGROUND] = BackgroundModel;
  CONFIG.Item.dataModels[ItemTypes.DUEL_STYLE] = DuelStyleModel;
  CONFIG.Item.dataModels[ItemTypes.MONSTER_QUALITY] = MonsterQualityModel;
  CONFIG.Item.dataModels[ItemTypes.SCHEME] = SchemeModel;
  CONFIG.Item.dataModels[ItemTypes.SECRET_SOCIETY] = SecretSocietyModel;
  CONFIG.Item.dataModels[ItemTypes.SHIP_ADVENTURE] = ShipAdventureModel;
  CONFIG.Item.dataModels[ItemTypes.SHIP_BACKGROUND] = ShipBackgroundModel;
  CONFIG.Item.dataModels[ItemTypes.VIRTUE] = VirtueModel;
  CONFIG.Item.dataModels[ItemTypes.HUBRIS] = HubrisModel;
  CONFIG.Item.dataModels[ItemTypes.SORCERY] = SorceryModel;
  CONFIG.Item.dataModels[ItemTypes.STORY] = StoryModel;

  // Register System Settings
  registerSystemSettings();

  // Register sheet application classes
  Actors.unregisterSheet('core', ActorSheet);
  Actors.registerSheet('svnsea2e', ActorSheetSS2ePlayerCharacter, {
    types: [ActorType.PLAYER],
    makeDefault: true,
  });
  Actors.registerSheet('svnsea2e', ActorSheetSS2eHero, {
    types: [ActorType.HERO],
    makeDefault: true,
  });
  Actors.registerSheet('svnsea2e', ActorSheetSS2eBrute, {
    types: [ActorType.BRUTE],
    makeDefault: true,
  });
  Actors.registerSheet('svnsea2e', ActorSheetSS2eMonster, {
    types: [ActorType.MONSTER],
    makeDefault: true,
  });
  Actors.registerSheet('svnsea2e', ActorSheetSS2eVillain, {
    types: [ActorType.VILLAIN],
    makeDefault: true,
  });
  Actors.registerSheet('svnsea2e', ActorSheetSS2eShip, {
    types: [ActorType.SHIP],
    makeDefault: true,
  });
  Actors.registerSheet('svnsea2e', ActorSheetSS2eDangerPts, {
    types: [ActorType.DANGERPOINTS],
    makeDefault: true,
  });

  Items.unregisterSheet('core', ItemSheet);
  Items.registerSheet('svnsea2e', ItemSheetSS2eAdvantage, {
    types: [ItemTypes.ADVANTAGE],
    makeDefault: true,
  });
  Items.registerSheet('svnsea2e', ItemSheetSS2eArtifact, {
    types: [ItemTypes.ARTIFACT],
    makeDefault: true,
  });
  Items.registerSheet('svnsea2e', ItemSheetSS2eBackground, {
    types: [ItemTypes.BACKGROUND],
    makeDefault: true,
  });
  Items.registerSheet('svnsea2e', ItemSheetSS2eDuelStyle, {
    types: [ItemTypes.DUEL_STYLE],
    makeDefault: true,
  });
  Items.registerSheet('svnsea2e', ItemSheetSS2eMonsterQuality, {
    types: [ItemTypes.MONSTER_QUALITY],
    makeDefault: true,
  });
  Items.registerSheet('svnsea2e', ItemSheetSS2eScheme, {
    types: [ItemTypes.SCHEME],
    makeDefault: true,
  });
  Items.registerSheet('svnsea2e', ItemSheetSS2eSecretSociety, {
    types: [ItemTypes.SECRET_SOCIETY],
    makeDefault: true,
  });
  Items.registerSheet('svnsea2e', ItemSheetSS2eShipAdventure, {
    types: [ItemTypes.SHIP_ADVENTURE],
    makeDefault: true,
  });
  Items.registerSheet('svnsea2e', ItemSheetSS2eShipBackground, {
    types: [ItemTypes.SHIP_BACKGROUND],
    makeDefault: true,
  });
  Items.registerSheet('svnsea2e', ItemSheetSS2eSorcery, {
    types: [ItemTypes.SORCERY],
    makeDefault: true,
  });
  Items.registerSheet('svnsea2e', ItemSheetSS2eStory, {
    types: [ItemTypes.STORY],
    makeDefault: true,
  });
  Items.registerSheet('svnsea2e', ItemSheetSS2eVirtue, {
    types: [ItemTypes.VIRTUE],
    makeDefault: true,
  });
  Items.registerSheet('svnsea2e', ItemSheetSS2eHubris, {
    types: [ItemTypes.HUBRIS],
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
    const nWoundByStep = Math.ceil((count - 1) / 4); // TODO: remove magic number, 4 is in reality dwounds.max (for wounds display)

    for (var i = from; i < count; i += incr) {
      block.data.index = i;
      block.data.first = i === 0;
      block.data.last = i === to;
      block.data.mod = Math.trunc(i / nWoundByStep);
      block.data.remain = i % nWoundByStep;
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
    currentVersion = '0.6';
  }

  // const needMigration = semver.lt(currentVersion, game.system.version);
  const needMigration = true;
  // Perform the migration
  if (needMigration && game.user.isGM) {
    migrations.migrateWorld();
  }

  chatEventHandler();

  game.svnsea2e.toolbox.render(true);
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
  document.updateSource({
    img: 'systems/svnsea2e/icons/' + document.type + '.jpg',
  });
});

/* -------------------------------------------- */

/**
 * Set the default image for an actor type instead of the mystery man
 **/
Hooks.on('preCreateActor', function (document, entity, options, userId) {
  document.updateSource({
    img: 'systems/svnsea2e/icons/' + document.type + '.jpg',
  });
});

Hooks.on('updateActor', function () {
  emitCharacterChange();
});

Hooks.on('renderActorDirectory', (app, html, data) => {
  if (game.user.isGM) {
    const button = document.createElement('button');
    button.style.width = '95%';
    button.innerHTML = game.i18n.localize('SVNSEA2E.OpenToolbox');
    button.addEventListener('click', () => {
      game.svnsea2e.toolbox.render(true);
    });
    html.find('.header-actions').after(button);
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
        const document = await pack.getDocument(pitems[j]._id);
        const entry = document.data;
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
