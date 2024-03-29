const {createCanvas, loadImage} = require('canvas');
const {AttachmentBuilder} = require('discord.js');
const axios = require('axios');
const config = require('../configs/config.js');
const {getStatusIcon} = require('./resources');
const {hasLive} = require('../actions/player');
const {remained} = require('./calc');
const {t} = require('i18next');
const {timeFormatMilliseconds} = require('./dateTime.js');
const xml2js = require('xml2js');

module.exports.createStatus = async (guildId, nowPlaying) => {
  const canvas = createCanvas(510, 40);
  const context = canvas.getContext('2d');

  const remainedTmp = `-${await hasLive(guildId)
    ? t('common:player.noRemained')
    : timeFormatMilliseconds(await remained(guildId, nowPlaying)) ?? t('common:player.overDay')}`;
  context.font = '24px sans-serif';

  context.fillStyle = '#2F3136';
  context.fillRect(0, 0, 49 + context.measureText(remainedTmp).width, 40);

  context.fillStyle = config.colors.info;
  context.fillRect(0, 0, 5, 40);

  const status = await loadImage(`./src/main/resources/icons/${getStatusIcon(nowPlaying)}.png`);
  context.drawImage(status, 9, 4, 32, 32);

  context.fillStyle = config.colors.info;
  context.fillText(remainedTmp, 45, 28);

  return new AttachmentBuilder(canvas.toBuffer(), {name: 'status.png'});
};

module.exports.createCalendar = async (guild, birthdays, monthDate, {month, year}) => {
  const {w, h} = {w: 1920, h: 1080};
  const canvas = createCanvas(w, h);
  const context = canvas.getContext('2d');

  const background = await loadImage('./src/main/resources/backgrounds/cosmos.jpg');
  context.drawImage(background, 0, 0, w, h);

  context.fillStyle = config.colors.info;
  context.font = '72px sans-serif';
  const title = t('common:date', {month, year});
  context.fillText(title, (w - context.measureText(title).width) / 2, 23 * h / 160 - 40);

  // eslint-disable-next-line no-loops/no-loops
  for (let j = 0; j < 6; j++) {
    // eslint-disable-next-line no-loops/no-loops
    for (let i = 0; i < 7; i++) {
      const {x, y} = {x: (24 * i + 31) * w / 224, y: (24 * j + 27) * h / 192};

      if (monthDate.getMonth() === month) {
        context.globalAlpha = 0.25;

        const {wCard, hCard, r} = {wCard: (9 * w / 112), hCard: (9 * h / 80), r: 16};
        context.beginPath();
        context.moveTo(x + (wCard / 2), y);
        context.arcTo(x + wCard, y, x + wCard, y + (hCard / 2), r);
        context.arcTo(x + wCard, y + hCard, x + (wCard / 2), y + hCard, r);
        context.arcTo(x, y + hCard, x, y + (hCard / 2), r);
        context.arcTo(x, y, x + (wCard / 2), y, r);
        context.closePath();
        context.fill();
        context.fillText(monthDate.getDate().toString(), x + wCard - 4 - context.measureText(monthDate.getDate().toString()).width, y + hCard - 8);

        context.globalAlpha = 1;
        const users = birthdays.map(birthday => ({userId: birthday.user_id, date: new Date(birthday.date)}))
          .filter(birthday => birthday.date.getDate() === monthDate.getDate()
            && birthday.date.getMonth() === monthDate.getMonth())
          .map(birthday => birthday.userId);
        await Promise.all(users.map(async (userId, index) => {
          const avatar = await loadImage((await guild.members.fetch())
            .find(member => member.user.id === userId)
            .displayAvatarURL({extension: 'jpg'}));

          context.save();
          context.beginPath();
          context.arc(x + 29, y + 54 * index + 29, 25, 0, Math.PI * 2, true);
          context.closePath();
          context.clip();
          context.drawImage(avatar, x + 4, y + 54 * index + 4, 50, 50);
          context.restore();
        }));
      }
      monthDate.setDate(monthDate.getDate() + 1);
    }
  }
  return new AttachmentBuilder(canvas.toBuffer(), {name: 'calendar.png'});
};

module.exports.createShikimoriXml = nickname => axios.get(`${process.env.SHIKIMORI_URL}/${nickname}/list_export/animes.xml`)
  .then(response => xml2js.parseStringPromise(response.data))
  .then(animeList => ({
    myanimelist: {
      ...animeList.myanimelist,
      anime: animeList.myanimelist.anime.map(anime => ({
        my_start_date: ['0000-00-00'],
        my_finish_date: ['0000-00-00'],
        ...anime,
      })),
    },
  }))
  .then(animeList => new xml2js.Builder().buildObject(animeList))
  .then(xml => new AttachmentBuilder(Buffer.from(xml, 'utf8'), {name: `${nickname}_animes.xml`}));
