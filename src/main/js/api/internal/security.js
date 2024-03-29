const {CATEGORIES, TYPES} = require('../../db/repositories/audit');
const {getAll, getNowPlaying} = require('../../actions/player');
const {getScopes, isForbidden} = require('../../db/repositories/permission');
const {audit} = require('../../actions/auditor');
const axios = require('axios');
const {stringify} = require('../../utils/string');

//TODO добавить throw exception, когда пользователя нет или токен устарел
const authForUserId = token =>
  axios.get('https://discord.com/api/users/@me', {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Bearer ${token}`,
    },
  }).then(r => r.data.id)
    .catch(e => audit({
      guildId: null,
      type: TYPES.ERROR,
      category: CATEGORIES.SECURITY,
      message: stringify(e),
    }));

module.exports.authForScopes = token =>
  authForUserId(token)
    .then(userId => getScopes(userId));

module.exports.authCheckForbidden = (token, scope) =>
  authForUserId(token)
    .then(userId => new Promise((resolve, reject) =>
      isForbidden(userId, scope)
        .then(isForbidden => isForbidden
          ? reject()
          : resolve())
        .catch(() => reject())));

module.exports.authForVoiceMember = (token, client) =>
  authForUserId(token)
    .then(userId => client.guilds.fetch()
      .then(guilds => Promise.all(guilds.map(g => g.fetch()
        .then(guild => guild.members.fetch()
          .then(members => members.find(member => member.user.id === userId))))))
      .then(members => members.find(member => member.voice.channelId)))
    .catch(e => audit({
      guildId: null,
      type: TYPES.ERROR,
      category: CATEGORIES.SECURITY,
      message: stringify(e),
    }));

module.exports.authForNowPlaying = (token, client) =>
  this.authForVoiceMember(token, client)
    .then(member => member?.guild.id)
    .then(guildId => getNowPlaying(guildId))
    .then(nowPlaying => nowPlaying?.song
      ? {
        song: {
          ...nowPlaying?.song ?? {},
          playbackDuration: nowPlaying?.resource?.playbackDuration ?? 0,
        },
        isPause: nowPlaying?.isPause ?? false,
        isLoop: nowPlaying?.isLoop ?? false,
      }
      : {})
    .catch(e => audit({
      guildId: null,
      type: TYPES.ERROR,
      category: CATEGORIES.SECURITY,
      message: stringify(e),
    }));

module.exports.authForSongs = (token, client) =>
  this.authForVoiceMember(token, client)
    .then(member => member?.guild.id)
    .then(guildId => getAll(guildId))
    .catch(e => audit({
      guildId: null,
      type: TYPES.ERROR,
      category: CATEGORIES.SECURITY,
      message: stringify(e),
    }));
