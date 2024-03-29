const {APPLICATIONS, getUnshown, shown} = require('../../db/repositories/changelog');
const {compareVersions, escaping} = require('../../utils/string');
const {EmbedBuilder} = require('discord.js');
const config = require('../../configs/config');
const {ifPromise} = require('../../utils/promises');
const {t} = require('i18next');

module.exports = {
  content: () => getUnshown()
    .then(changelogs => changelogs
      .sort((a, b) => compareVersions(a.version, b.version)))
    .then(changelogs => ifPromise(changelogs.length > 0, () => ({
      default: {
        embeds: changelogs.map(changelog =>
          new EmbedBuilder()
            .setColor(config.colors.info)
            .setTitle(createTitle(changelog.version, changelog.application))
            .setThumbnail('https://i.ibb.co/dK5VJcd/ancient.png')
            .setDescription(createDescription(changelog.message))
            .setTimestamp()
            .setFooter({
              text: t('discord:embed.publicist.changelog.footer', {year: new Date().getFullYear()}),
              iconURL: 'https://e7.pngegg.com/pngimages/330/725/png-clipart-computer-icons-public-key-certificate-organization-test-certificate-miscellaneous-company.png',
            }),
        ),
      },
      variables: {
        shownChangelogs: changelogs,
      },
    }), () => Promise.resolve({}))),
  condition: () => getUnshown().then(unshowns => unshowns.length > 0),
  onPublished: (messages, variables) => ifPromise(messages && variables?.shownChangelogs, () => Promise.all(messages
    .map(message => message.react('👍')
      .then(() => message.react('👎')))
    .concat(variables.shownChangelogs
      .map(({version, application}) => shown(version, application))))),
};

const createDescription = message => {
  const getFeatures = () => message.features
    .map(feature => t('common:markItem', {item: escaping(feature)}))
    .join('\n');
  const getBugfixes = () => message.bugfixes
    .map(bugfix => t('common:markItem', {item: escaping(bugfix)}))
    .join('\n');

  const parts = [
    message.ad && `_${escaping(message.ad)}_\n`,
    message.announce && `\`\`\`\n${escaping(message.announce)}\n\`\`\``,
    message.features.length > 0 && `\n**Нововведения:**\n${getFeatures()}\n`,
    message.bugfixes.length > 0 && `\n**Исправления:**\n${getBugfixes()}\n`,
    message.footer && `\n_${escaping(message.footer)}_`,
  ];

  return ''.concat(...parts.filter(p => p));
};

const createTitle = (version, application) => {
  switch (application) {
    case APPLICATIONS.DEUS_BOT:
      return t('discord:embed.publicist.changelog.title.deusBot', {version: version});
    case APPLICATIONS.DEUS_BOT_APP:
      return t('discord:embed.publicist.changelog.title.deusBotWeb', {version: version});
    default:
      return t('discord:embed.publicist.changelog.title.error');
  }
};
