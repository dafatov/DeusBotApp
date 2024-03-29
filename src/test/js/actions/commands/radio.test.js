const cloneDeep = require('lodash/cloneDeep');
const expectedParamsRadio = require('../../../resources/actions/commands/radio/expectedParamsRadio');
const expectedRadio = require('../../../resources/actions/commands/radio/expectedRadio');
let interaction;
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

beforeEach(() => {
  interaction = cloneDeep(require('../../../resources/mocks/commandInteraction'));
});

describe('execute', () => {
  test('forbidden', async () => {
    permissionMocked.isForbidden.mockImplementationOnce(() => Promise.resolve(true));

    const result = await execute(interaction);

    expect(result).toEqual({'result': 'Доступ к команде radio запрещен'});
    expect(permissionMocked.isForbidden).toHaveBeenCalledWith('348774809003491329', 'command.radio');
    expect(commandsMocked.notifyForbidden).toHaveBeenCalledWith('radio', interaction);
    expect(playerMocked.addAll).not.toHaveBeenCalled();
    expect(playerMocked.playPlayer).not.toHaveBeenCalled();
    expect(commandsMocked.notify).not.toHaveBeenCalledWith();
    expect(auditorMocked.audit).not.toHaveBeenCalled();
  });

  describe('unequal channels', () => {
    test('member connected', async () => {
      permissionMocked.isForbidden.mockImplementationOnce(() => Promise.resolve(false));
      playerMocked.isConnected.mockReturnValueOnce(true);
      playerMocked.isSameChannel.mockReturnValueOnce(false);

      const result = await execute(interaction);

      expect(result).toEqual({'result': 'Не совпадают каналы'});
      expect(permissionMocked.isForbidden).toHaveBeenCalledWith('348774809003491329', 'command.radio');
      expect(commandsMocked.notifyForbidden).not.toHaveBeenCalled();
      expect(playerMocked.isConnected).toHaveBeenCalledWith('301783183828189184');
      expect(playerMocked.isSameChannel).toHaveBeenCalledWith('301783183828189184', '343847059612237824');
      expect(commandsMocked.notifyUnequalChannels).toHaveBeenCalledWith('radio', interaction, true);
      expect(playerMocked.addAll).not.toHaveBeenCalled();
      expect(playerMocked.playPlayer).not.toHaveBeenCalled();
      expect(commandsMocked.notify).not.toHaveBeenCalled();
      expect(auditorMocked.audit).not.toHaveBeenCalled();
    });

    test('member not connected', async () => {
      permissionMocked.isForbidden.mockImplementationOnce(() => Promise.resolve(false));
      jest.replaceProperty(interaction.member.voice, 'channelId', null);

      const result = await execute(interaction);

      expect(result).toEqual({'result': 'Не совпадают каналы'});
      expect(permissionMocked.isForbidden).toHaveBeenCalledWith('348774809003491329', 'command.radio');
      expect(commandsMocked.notifyForbidden).not.toHaveBeenCalled();
      expect(playerMocked.isConnected).not.toHaveBeenCalled();
      expect(playerMocked.isSameChannel).not.toHaveBeenCalled();
      expect(commandsMocked.notifyUnequalChannels).toHaveBeenCalledWith('radio', interaction, true);
      expect(commandsMocked.notify).not.toHaveBeenCalled();
      expect(auditorMocked.audit).not.toHaveBeenCalled();
    });
  });

  test('success', async () => {
    interaction.options.getString.mockReturnValueOnce('stationKey');
    permissionMocked.isForbidden.mockImplementationOnce(() => Promise.resolve(false));
    playerMocked.getNowPlaying.mockReturnValueOnce({});
    playerMocked.getDuration.mockResolvedValueOnce(0);
    playerMocked.getSize.mockResolvedValueOnce(0);
    playerMocked.hasLive.mockResolvedValueOnce(false);
    playerMocked.isConnected.mockReturnValueOnce(false);
    playerMocked.isSameChannel.mockReturnValueOnce(true);
    radiosMocked.getRadios.mockResolvedValueOnce({
      stationKey: {
        channel: {
          url: 'https://youtube.com',
          preview: 'https://youtube.com/preview',
        },
      },
    });

    const result = await execute(interaction);

    expect(result).toEqual({
      info: {
        duration: 0,
        isLive: true,
        preview: 'https://youtube.com/preview',
        title: 'stationKey',
        type: 'radio',
        url: 'https://youtube.com',
        userId: '348774809003491329',
      },
    });
    expect(permissionMocked.isForbidden).toHaveBeenCalledWith('348774809003491329', 'command.radio');
    expect(commandsMocked.notifyForbidden).not.toHaveBeenCalled();
    expect(commandsMocked.notifyUnequalChannels).not.toHaveBeenCalled();
    expect(playerMocked.addAll).toHaveBeenCalledWith('301783183828189184', expectedRadio);
    expect(playerMocked.playPlayer).toHaveBeenCalledWith(interaction);
    expect(commandsMocked.notify).toHaveBeenCalledWith(...expectedParamsRadio);
    expect(auditorMocked.audit).toHaveBeenCalled();
  });
});
