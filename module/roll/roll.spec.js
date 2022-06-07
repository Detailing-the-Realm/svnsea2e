import { roll } from './roll';
import { SVNSEA2E } from '../config';

const actor = { update: jest.fn(), data: { data: { heropts: 3 } } };

let standardRollConfiguration = {
  rolldata: {
    threshold: 10,
    skilldice: 2,
    explode: false,
    reroll: false,
  },
  actor,
  data: {},
  form: {
    flairDice: { checked: false },
    interprerationDice: { checked: false },
    useForMe: { value: 0 },
    useForHelpMe: { value: 0 },
    bonusDice: { value: 0 },
    increaseThreshold: { checked: false },
    addOneToDice: { checked: false },
    joieDeVivreAdvantage: { checked: false },
    trait: 3,
  },
  template: '',
  title: '',
};

describe('roll', () => {
  let mockTerms;

  beforeEach(() => {
    standardRollConfiguration.rolldata.threshold = 10;
    mockTerms = [
      {
        results: [],
      },
    ];
    global.Roll = function () {
      this.roll = jest.fn();
      this.terms = mockTerms;
    };
    global.ChatMessage = {
      create: jest.fn(),
    };
    global.CONFIG = {
      SVNSEA2E,
    };
    global.CONST = {
      CHAT_MESSAGE_TYPES: {},
    };
    global.game = {
      user: {},
      i18n: {
        localize: jest.fn().mockImplementation((str) => str),
        format: jest.fn().mockImplementation((str) => str),
      },
      settings: {
        get: jest.fn(),
      },
    };
    global.renderTemplate = jest.fn();
  });

  afterEach(() => {
    delete global.Roll;
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('raise computing', () => {
    describe('with threshold of 10', () => {
      let rollConfig;

      const dicesTestsConfigurations = [
        { results: [5, 10, 1, 2, 10], raises: 2, combos: ['10', '10'] },
        {
          results: [10, 10, 10, 10, 10],
          raises: 5,
          combos: ['10', '10', '10', '10', '10'],
        },
        { results: [3, 2, 1, 5, 8], raises: 1, combos: ['2 + 8'] },
        { results: [9, 2, 8, 1], raises: 2, combos: ['2 + 8', '1 + 9'] },
        {
          results: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
          raises: 5,
          combos: ['10', '1 + 9', '2 + 8', '3 + 7', '4 + 6'],
        },
        {
          results: [1, 1, 1, 1, 1, 1, 1, 1, 1],
          raises: 0,
          combos: [],
        },
      ];

      beforeEach(() => {
        rollConfig = {
          ...standardRollConfiguration,
        };
      });

      dicesTestsConfigurations.forEach((testConfig) => {
        it(`should have ${
          testConfig.raises
        } raises when roll is ${testConfig.results.join('/')}`, async () => {
          mockTerms[0].results = testConfig.results.map((d) => ({ result: d }));

          await roll(rollConfig);

          expect(global.renderTemplate).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
              raises: testConfig.raises,
              combos: expect.arrayContaining(testConfig.combos),
            }),
          );
        });
      });
    });

    describe('with threshold of 15', () => {
      const dicesTestsConfigurations = [
        { results: [5, 10, 1, 2, 10], raises: 1, combos: ['5 + 10'] },
        {
          results: [10, 10, 10, 10, 10],
          raises: 2,
          combos: ['10 + 10', '10 + 10'],
        },
        { results: [3, 2, 1, 5, 8], raises: 1, combos: ['2 + 5 + 8'] },
        { results: [9, 2, 8, 1], raises: 1, combos: ['1 + 9 + 2 + 8'] }, // /!\ Resultat non optimum
        {
          results: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
          raises: 3,
          combos: ['5 + 10', '6 + 9', '7 + 8'],
        },
        {
          results: [1, 1, 1, 1, 1, 1, 1, 1, 1],
          raises: 0,
          combos: [],
        },
      ];

      let rollConfig;

      beforeEach(() => {
        rollConfig = {
          ...standardRollConfiguration,
          form: {
            ...standardRollConfiguration.form,
            increaseThreshold: { checked: true },
          },
        };
      });

      dicesTestsConfigurations.forEach((testConfig) => {
        it(`should have ${
          testConfig.raises
        } raises when roll is ${testConfig.results.join('/')}`, async () => {
          mockTerms[0].results = testConfig.results.map((d) => ({ result: d }));

          await roll(rollConfig);

          expect(global.renderTemplate).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
              raises: testConfig.raises,
              combos: expect.arrayContaining(testConfig.combos),
            }),
          );
        });
      });
    });

    describe('with joieDeVivreAdvantage', () => {
      const dicesTestsConfigurations = [
        { results: [5, 10, 4, 5], raises: 2, combos: ['10', '5 + 5'] },
        { results: [1, 10, 2, 5], raises: 3, combos: ['1', '2', '10'] },
      ];

      let rollConfig;

      beforeEach(() => {
        rollConfig = {
          ...standardRollConfiguration,
          form: {
            ...standardRollConfiguration.form,
            joieDeVivreAdvantage: { checked: true },
          },
        };
      });

      dicesTestsConfigurations.forEach((testConfig) => {
        it(`should have ${
          testConfig.raises
        } raises when roll is ${testConfig.results.join('/')}`, async () => {
          mockTerms[0].results = testConfig.results.map((d) => ({ result: d }));

          await roll(rollConfig);

          expect(global.renderTemplate).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
              raises: testConfig.raises,
              combos: expect.arrayContaining(testConfig.combos),
            }),
          );
        });
      });
    });

    describe('with addOneToDice', () => {
      const dicesTestsConfigurations = [
        { results: [4, 4, 3, 6], raises: 2, combos: ['5 + 5', '4 + 7'] },
        { results: [3, 2, 1], raises: 0, combos: [] },
      ];

      let rollConfig;

      beforeEach(() => {
        rollConfig = {
          ...standardRollConfiguration,
          form: {
            ...standardRollConfiguration.form,
            addOneToDice: { checked: true },
          },
        };
      });

      dicesTestsConfigurations.forEach((testConfig) => {
        it(`should have ${
          testConfig.raises
        } raises when roll is ${testConfig.results.join('/')}`, async () => {
          mockTerms[0].results = testConfig.results.map((d) => ({
            result: d,
          }));

          await roll(rollConfig);

          expect(global.renderTemplate).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
              raises: testConfig.raises,
              combos: expect.arrayContaining(testConfig.combos),
            }),
          );
        });
      });
    });
  });

  describe('dices number computing', () => {
    beforeEach(() => {
      mockTerms[0].results = ['10', '10'].map((d) => ({ result: d }));
    });

    it('should add skill(1) and trait (4) values', async () => {
      const rollConfig = {
        ...standardRollConfiguration,
        rolldata: {
          ...standardRollConfiguration.rolldata,
          skilldice: 1,
        },
        form: {
          ...standardRollConfiguration.form,
          trait: { value: 4 },
        },
      };

      await roll(rollConfig);

      expect(global.renderTemplate).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          dicesNumber: 5,
        }),
      );
    });

    it('should add skill(3) and trait (5) values', async () => {
      const rollConfig = {
        ...standardRollConfiguration,
        rolldata: {
          ...standardRollConfiguration.rolldata,
          skilldice: 3,
        },
        form: {
          ...standardRollConfiguration.form,
          trait: { value: 5 },
        },
      };

      await roll(rollConfig);

      expect(global.renderTemplate).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          dicesNumber: 8,
        }),
      );
    });

    describe('with skill (3) and trait (2)', () => {
      let rollConfig;

      beforeEach(() => {
        rollConfig = {
          ...standardRollConfiguration,
          rolldata: {
            ...standardRollConfiguration.rolldata,
            skilldice: 3,
          },
          form: {
            ...standardRollConfiguration.form,
            trait: { value: 2 },
          },
        };
      });

      it('should add bonus dices', async () => {
        rollConfig.form.bonusDice = { value: 3 };
        await roll(rollConfig);

        expect(global.renderTemplate).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            dicesNumber: 8,
          }),
        );
      });

      it('should add 3 bonus if anyone help me', async () => {
        rollConfig.form.useForHelpMe = { value: 1 };
        await roll(rollConfig);

        expect(global.renderTemplate).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            dicesNumber: 8,
          }),
        );
      });

      it('should add 1 die if i spend hero point', async () => {
        rollConfig.form.useForMe = { value: 1 };
        await roll(rollConfig);

        expect(global.renderTemplate).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            dicesNumber: 6,
          }),
        );
      });

      it('should add 1 die if i checked flairDice', async () => {
        rollConfig.form.flairDice = { checked: true };
        await roll(rollConfig);

        expect(global.renderTemplate).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            dicesNumber: 6,
          }),
        );
      });

      it('should add 1 die if i checked interpretationDice', async () => {
        rollConfig.form.interpretationDice = { checked: true };
        await roll(rollConfig);

        expect(global.renderTemplate).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            dicesNumber: 6,
          }),
        );
      });

      it('should add dice for all bonus', async () => {
        rollConfig.form.bonusDice = { value: 1 };
        rollConfig.form.useForHelpMe = { value: 1 };
        rollConfig.form.useForMe = { value: 1 };
        rollConfig.form.flairDice = { checked: true };
        rollConfig.form.interpretationDice = { checked: true };
        await roll(rollConfig);

        expect(global.renderTemplate).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            dicesNumber: 12,
          }),
        );
      });
    });
  });
});
