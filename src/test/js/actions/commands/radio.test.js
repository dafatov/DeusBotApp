const expectedParamsRadio = require('../../../resources/actions/commands/radio/expectedParamsRadio');
const expectedRadio = require('../../../resources/actions/commands/radio/expectedRadio');
const interaction = require('../../../resources/mocks/commandInteraction');
const locale = require('../../configs/locale');

const permissionModuleName = '../../../../main/js/db/repositories/permission';
const commandsModuleName = '../../../../main/js/actions/commands';
const auditorModuleName = '../../../../main/js/actions/auditor';
const playerModuleName = '../../../../main/js/actions/player';
const radiosModuleName = '../../../../main/js/actions/radios';
const permissionMocked = jest.mock(permissionModuleName).requireMock(permissionModuleName);
const commandsMocked = jest.mock(commandsModuleName).requireMock(commandsModuleName);
const auditorMocked = jest.mock(auditorModuleName).requireMock(auditorModuleName);
const playerMocked = jest.mock(playerModuleName).requireMock(playerModuleName);
const radiosMocked = jest.mock(radiosModuleName).requireMock(radiosModuleName);

// eslint-disable-next-line sort-imports-requires/sort-requires
const {execute} = require('../../../../main/js/actions/commands/radio');

beforeAll(() => locale.init());

describe('execute', () => {
  test('forbidden', async () => {
    permissionMocked.isForbidden.mockImplementationOnce(() => Promise.resolve(true));

    const result = await execute(interaction);

    expect(result).toEqual({'result': 'Доступ к команде radio запрещен'});
    expect(permissionMocked.isForbidden).toHaveBeenCalledWith('348774809003491329', 'command.radio');
    expect(commandsMocked.notifyForbidden).toHaveBeenCalledWith('radio', interaction);
    expect(playerMocked.addQueue).not.toHaveBeenCalled();
    expect(playerMocked.playPlayer).not.toHaveBeenCalled();
    expect(commandsMocked.notify).not.toHaveBeenCalledWith();
    expect(auditorMocked.audit).not.toHaveBeenCalled();
  });

  test('unequal channels', async () => {
    permissionMocked.isForbidden.mockImplementationOnce(() => Promise.resolve(false));
    playerMocked.isConnected.mockReturnValueOnce(true);
    playerMocked.isSameChannel.mockReturnValueOnce(false);

    const result = await execute(interaction);

    expect(result).toEqual({'result': 'Не совпадают каналы'});
    expect(permissionMocked.isForbidden).toHaveBeenCalledWith('348774809003491329', 'command.radio');
    expect(commandsMocked.notifyForbidden).not.toHaveBeenCalled();
    expect(playerMocked.isConnected).toHaveBeenCalledWith('301783183828189184');
    expect(playerMocked.isSameChannel).toHaveBeenCalledWith(interaction);
    expect(commandsMocked.notifyUnequalChannels).toHaveBeenCalledWith('radio', interaction, true);
    expect(playerMocked.addQueue).not.toHaveBeenCalled();
    expect(playerMocked.playPlayer).not.toHaveBeenCalled();
    expect(commandsMocked.notify).not.toHaveBeenCalled();
    expect(auditorMocked.audit).not.toHaveBeenCalled();
  });

  test('success', async () => {
    interaction.options.getString.mockReturnValue('stationKey');
    permissionMocked.isForbidden.mockImplementationOnce(() => Promise.resolve(false));
    playerMocked.getQueue.mockReturnValue({songs: [], nowPlaying: {}});
    playerMocked.isConnected.mockReturnValueOnce(false);
    playerMocked.isSameChannel.mockReturnValueOnce(true);
    radiosMocked.getRadios.mockReturnValue({
      get: jest.fn().mockReturnValue({
        channel: {
          url: 'url',
          preview: 'preview',
        },
      }),
    });

    const result = await execute(interaction);

    expect(result).toEqual({
      'info': {
        'author': {
          'iconURL': 'https://cdn.discordapp.com/avatars/348774809003491329/98e046c34d87c1b00cf6a9bf0f132959.webp',
          'username': 'DemetriouS',
        },
        'duration': 0,
        'id': '1675678827013',
        'isLive': true,
        'preview': 'preview',
        'title': 'stationKey',
        'type': 'radio',
        'url': 'url',
      },
    });
    expect(permissionMocked.isForbidden).toHaveBeenCalledWith('348774809003491329', 'command.radio');
    expect(commandsMocked.notifyForbidden).not.toHaveBeenCalled();
    expect(commandsMocked.notifyUnequalChannels).not.toHaveBeenCalled();
    expect(playerMocked.addQueue).toHaveBeenCalledWith('301783183828189184', expectedRadio);
    expect(playerMocked.playPlayer).toHaveBeenCalledWith(interaction);
    expect(commandsMocked.notify).toHaveBeenCalledWith(...expectedParamsRadio);
    expect(auditorMocked.audit).toHaveBeenCalled();
  });
});