import { SVNSEA2E } from '../../config.js';
import SkillSelector from '../../apps/skill-selector.js';
import AdvantageSelector from '../../apps/advantage-selector.js';

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class ItemSheetSS2e extends ItemSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['svnsea2e', 'sheet', 'item'],
      width: 600,
      height: 700,
    });
  }

  /* -------------------------------------------- */

  /** @override */
  getData(options) {
    const data = super.getData(options);
    const item = data.document;
    const itemData = item.system;
    const { isOwner } = this.document;

    // foundry.utils.mergeObject(data, {
    //   owner: isOwner,
    //   itemType: SVNSEA2E.itemTypes[data.item.type],
    //   options: this.options,
    //   editable: this.isEditable,
    //   cssClass: isOwner ? "editable" : "locked",
    //   config: CONFIG.SVNSEA2E,
    //   dtypes: ["String", "Number", "Boolean"],
    // });

    const sheetData = {
      owner: isOwner,
      itemType: SVNSEA2E.itemTypes[item.type],
      options: this.options,
      editable: this.isEditable,
      cssClass: isOwner ? 'editable' : 'locked',
      config: CONFIG.SVNSEA2E,
      dtypes: ['String', 'Number', 'Boolean'],

      name: item.name,
      img: item.img,
      type: item.type,
      infosource: itemData.infosource,
      description: itemData.description,
      quirk: itemData.quirk,
    };

    if (item.type === 'background') {
      sheetData.selectedskills = itemData.skills.map(
        (s) => CONFIG.SVNSEA2E.skills[s],
      );
      sheetData.selectedadvantages = itemData.advantages;

      sheetData.nation = itemData.nation;
    } else if (item.type === 'advantage') {
      sheetData.normalCost = itemData.cost.normal;
      sheetData.reducedCost = itemData.cost.reducecost;
      sheetData.knack = itemData.knack;
      sheetData.innate = itemData.innate;
    } else if (item.type === 'duelstyle') {
      sheetData.bonus = itemData.bonus;
    } else if (item.type === 'scheme') {
      sheetData.influence = itemData.influence;
    } else if (item.type === 'secretsociety') {
      sheetData.concern = itemData.concern;
      sheetData.favor = itemData.favor;
      sheetData.earnFavor = itemData.earnfavor;
      sheetData.callUpon = itemData.callupon;
    } else if (item.type === 'sorcery') {
      sheetData.sorceryType = itemData.sorctype;
      sheetData.sorceryDuration = itemData.sorcdur;
      sheetData.sorceryCategory = itemData.sorccat;
      sheetData.sorcerySubCategory = itemData.sorcsubcat;
    } else if (item.type === 'story') {
      sheetData.storyStatus = itemData.status;
      sheetData.reward = itemData.reward;
      sheetData.endings = itemData.endings;
      sheetData.steps = itemData.steps;
    } else if (item.type === 'artifact') {
      sheetData.artifactType = itemData.artifactType;
    }
    return sheetData;
  }

  /* -------------------------------------------- */

  /** @override */
  setPosition(options = {}) {
    const position = super.setPosition(options);
    const sheetBody = this.element.find('.sheet-body');
    const bodyHeight = position.height - 192;
    sheetBody.css('height', bodyHeight);
    return position;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    html.find('.skill-selector').on('click', this._onSkillSelector.bind(this));
    html
      .find('.advantage-selector')
      .on('click', this._onAdvantageSelector.bind(this));
  }

  /* -------------------------------------------- */

  _advCompare(object, value) {
    for (const property in object) {
      if (object[property] === value) {
        return true;
      }
    }
    return false;
  }

  async _getAllAdvantages() {
    const advantages = [];
    const items = game.items.directory.documents;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type === 'advantage') {
        advantages.push(items[i].name);
      }
    }

    const packs = game.packs.entries;
    const worldAdv = duplicate(advantages);
    for (var i = 0; i < packs.length; i++) {
      const pack = packs[i];
      if (pack.metadata.entity === 'Item') {
        const pitems = await pack.getIndex();
        for (let j = 0; j < pitems.length; j++) {
          const document = await pack.getDocument(pitems[j]._id);
          const entry = document.data;
          if (entry.type === 'advantage' && !worldAdv.includes(entry.name)) {
            advantages.push(entry.name);
          }
        }
      }
    }
    return advantages;
  }

  /* -------------------------------------------- */

  /**
   * Handle spawning the skillSelector application which allows a checkbox of multiple skill options
   * @param {Event} event   The click event which originated the selection
   * @private
   */
  _onSkillSelector(event) {
    event.preventDefault();
    const a = event.currentTarget;
    const options = {
      title: game.i18n.localize('SVNSEA2E.Skills'),
      choices: CONFIG.SVNSEA2E[a.dataset.options],
    };
    new SkillSelector(this.item, options).render(true);
  }

  /* -------------------------------------------- */

  /**
   * Handle spawning the advantageSelector application which allows a checkbox of multiple advantage options
   * @param {Event} event   The click event which originated the selection
   * @private
   */
  async _onAdvantageSelector(event) {
    event.preventDefault();
    const options = {
      title: game.i18n.localize('SVNSEA2E.Advantages'),
      choices: await this._getAllAdvantages(),
    };
    new AdvantageSelector(this.item, options).render(true);
  }
}
