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
    return mergeObject(super.defaultOptions, {
      classes: ['svnsea2e', 'sheet', 'item'],
      width: 600,
      height: 700,
    });
  }

  /* -------------------------------------------- */

  /** @override */
  getData(options) {
    // const data = super.getData();
    const baseData = super.getData(options);
    const { isOwner } = this.document;
    console.log('baseData', baseData);
    console.log('this.item', this.item);
    // mergeObject(data, {
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
      itemType: SVNSEA2E.itemTypes[baseData.item.type],
      options: this.options,
      editable: this.isEditable,
      cssClass: isOwner ? 'editable' : 'locked',
      config: CONFIG.SVNSEA2E,
      dtypes: ['String', 'Number', 'Boolean'],

      name: this.item.name,
      img: this.item.img,
      type: baseData.data.data.type,
      infosource: baseData.data.data.infosource,
      description: baseData.data.data.description,
      quirk: baseData.data.data.quirk,
    };

    if (baseData.item.type === 'background') {
      sheetData.selectedskills = baseData.data.data.skills.map(
        (s) => CONFIG.SVNSEA2E.skills[s],
      );
      sheetData.selectedadvantages = baseData.data.data.advantages;

      sheetData.nation = baseData.data.data.nation;
    } else if (baseData.item.type === 'advantage') {
      sheetData.normalCost = baseData.data.data.cost.normal;
      sheetData.reducedCost = baseData.data.data.cost.reducecost;
      sheetData.knack = baseData.data.data.knack;
      sheetData.innate = baseData.data.data.innate;
    } else if (baseData.item.type === 'duelstyle') {
      sheetData.bonus = baseData.data.data.bonus;
    } else if (baseData.item.type === 'scheme') {
      sheetData.influence = baseData.data.data.influence;
    } else if (baseData.item.type === 'secretsociety') {
      sheetData.concern = baseData.data.data.concern;
      sheetData.favor = baseData.data.data.favor;
      sheetData.earnFavor = baseData.data.data.earnfavor;
      sheetData.callUpon = baseData.data.data.callupon;
    } else if (baseData.item.type === 'sorcery') {
      sheetData.sorceryType = baseData.data.data.sorctype;
      sheetData.sorceryDuration = baseData.data.data.sorcdur;
      sheetData.sorceryCategory = baseData.data.data.sorccat;
      sheetData.sorcerySubCategory = baseData.data.data.sorcsubcat;
    } else if (baseData.item.type === 'story') {
      sheetData.storyStatus = baseData.data.data.status;
      sheetData.reward = baseData.data.data.reward;
      sheetData.endings = baseData.data.data.endings;
      sheetData.steps = baseData.data.data.steps;
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

  /**
   * Prepare the Skills that the Actor has selected for use with the SkillSelector application
   * @param {Object} data       The data transfer
   * @private
   */
  _prepareBackground(data) {
    data.selectedskills = {};
    for (let i = 0; i < data.skills.length; i++) {
      data.selectedskills[data.skills[i]] =
        CONFIG.SVNSEA2E.skills[data.skills[i]];
    }

    data.selectedadvantages = data.advantages;
  }

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
    const items = game.items.directory.entities;
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
          const entry = await pack.getEntry(pitems[j]._id);
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
