const client = require('../../../resources/mocks/client');
const expectedContent = require('../../../resources/actions/publications/freebie/expectedContent');
const feed = require('../../../resources/actions/publications/freebie/feed');
const locale = require('../../configs/locale');

const variablesModuleName = '../../../../main/js/db/repositories/variables';
const variablesMocked = jest.mock(variablesModuleName).requireMock(variablesModuleName);
const parserMocked = jest.mock('rss-parser').requireMock('rss-parser');

// eslint-disable-next-line sort-imports-requires/sort-requires
const {condition, content, onPublished} = require('../../../../main/js/actions/publications/freebie');

beforeAll(() => locale.init());

describe('content', () => {
  test('success', async () => {
    variablesMocked.getAll.mockImplementationOnce(() =>
      Promise.resolve({lastFreebie: new Date('1970-01-01T00:00:00.000Z')}));
    parserMocked.mockImplementationOnce(() => ({
      parseURL: jest.fn(() => Promise.resolve(feed)),
    }));

    const result = await content(client);

    expect(result).toEqual(expectedContent);
  });

  test('empty', async () => {
    variablesMocked.getAll.mockImplementationOnce(() =>
      Promise.resolve({lastFreebie: new Date('2024-01-01T00:00:00.000Z')}));
    parserMocked.mockImplementationOnce(() => ({
      parseURL: jest.fn(() => Promise.resolve(feed)),
    }));

    const result = await content(client);

    expect(result).toBeUndefined();
  });
});

describe('condition', () => {
  test.each([
    {now: new Date('2023-02-13T09:38:00.000Z'), expected: false},
    {now: new Date('2023-02-13T02:39:00.000Z'), expected: false},
    {now: new Date('2023-02-13T12:40:00.000Z'), expected: true},
    {now: new Date('2023-02-13T07:00:00.000Z'), expected: true},
  ])('$now', ({now, expected}) => {
    const result = condition(now);

    expect(result).toBe(expected);
  });
});

describe('onPublication', () => {
  test('success', async () => {
    const crosspostMocked1 = jest.fn().mockResolvedValue();
    const crosspostMocked2 = jest.fn().mockResolvedValue();
    const variables = {lastFreebie: new Date('1970-01-01T00:00:00.000Z')};
    const messages = [
      {
        channel: {type: 'GUILD_NEWS'},
        crosspost: crosspostMocked1,
      }, {
        channel: {type: 'GUILD_TEXT'},
        crosspost: crosspostMocked2,
      },
    ];
    variablesMocked.set.mockImplementationOnce();

    await onPublished(messages, variables);

    expect(variablesMocked.set).toHaveBeenCalled();
    expect(variablesMocked.set).toHaveBeenCalledWith('lastFreebie', new Date('1970-01-01T00:00:00.000Z'));
    expect(crosspostMocked1).toHaveBeenCalled();
    expect(crosspostMocked2).not.toHaveBeenCalled();
  });

  test.each([
    {messages: [], variables: {}},
    {messages: [], variables: null},
  ])('empty: $variables', async ({messages, variables}) => {
    variablesMocked.set.mockImplementationOnce();

    await onPublished(messages, variables);

    expect(variablesMocked.set).not.toHaveBeenCalled();
  });
});