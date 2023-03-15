const {CATEGORIES, TYPES} = require('../db/repositories/audit');
const {Collection, MessageEmbed} = require('discord.js');
const {REST} = require('@discordjs/rest');
const {Routes} = require('discord-api-types/v9');
const {audit} = require('./auditor');
const config = require('../configs/config.js');
const fs = require('fs');
const {stringify} = require('../utils/string');
const {t} = require('i18next');

module.exports.init = async client => {
  client.commands = new Collection();
  await Promise.all(fs.readdirSync('./src/main/js/actions/commands')
    .filter(f => !f.startsWith('_'))
    .filter(f => f.endsWith('.js'))
    .map(async f => {
      const command = require(`./commands/${f}`);
      const data = await this.getCommandData(command);
      client.commands.set(data.name, command);
    }));

  if (client.commands.size <= 0) {
    return;
  }

  await this.updateCommands(client);
};

module.exports.updateCommands = async client => {
  const rest = new REST({version: '9'}).setToken(process.env.DISCORD_TOKEN);

  await client.guilds.fetch()
    .then(guilds => Promise.all(guilds.map(async guild => rest.put(
      Routes.applicationGuildCommands(client.user.id, guild.id), {
        body: await Promise.all(client.commands.map(command => this.getCommandData(command)
          .then(commandData => commandData.toJSON()))),
      }))))
    .then(guildsCommands => guildsCommands.map(guildCommands =>
      `${client.guilds.resolve(guildCommands[0].guild_id).name}(${guildCommands.length})`))
    .then(guilds => audit({
      guildId: null,
      type: TYPES.INFO,
      category: CATEGORIES.INIT,
      message: t('inner:audit.init.command', {guilds}),
    }))
    .catch(e => audit({
      guildId: null,
      type: TYPES.ERROR,
      category: CATEGORIES.INIT,
      message: stringify(e),
    }));
};

module.exports.execute = async interaction => {
  const commandName = interaction.commandName;
  const command = interaction.client.commands.get(commandName);

  if (typeof command?.execute !== 'function') {
    return;
  }

  if (JSON.parse(process.env.RESTRICTED_COMMANDS ?? '[]').includes(commandName)) {
    this.notifyRestricted(commandName, interaction);
    return;
  }

  try {
    await interaction.deferReply();
    await command.execute(interaction);
    await audit({
      guildId: interaction.guildId,
      type: TYPES.INFO,
      category: CATEGORIES.COMMAND,
      message: t('inner:audit.command.executed', {name: commandName}),
    });
  } catch (e) {
    await audit({
      guildId: interaction.guildId,
      type: TYPES.ERROR,
      category: CATEGORIES.COMMAND,
      message: stringify(e),
    });
  }
};

module.exports.notify = async (commandName, interaction, content) => {
  try {
    if (interaction.commandName === commandName && !interaction.replied && !interaction.deferred) {
      await interaction.reply(content);
    } else {
      await interaction.followUp(content);
      return;
    }

    if (interaction.deferred) {
      await interaction.editReply(content);
    }
  } catch (e) {
    await audit({
      guildId: interaction.guildId,
      type: TYPES.ERROR,
      category: CATEGORIES.COMMAND,
      message: stringify(e),
    });
    interaction.message?.send(content);
  }
};

module.exports.notifyForbidden = async (commandName, interaction) => {
  const embed = new MessageEmbed()
    .setColor(config.colors.warning)
    .setTitle(t('discord:embed.forbidden.title', {command: commandName}))
    .setTimestamp()
    .setDescription(t('discord:embed.forbidden.description'));
  await this.notify(commandName, interaction, {embeds: [embed], ephemeral: true});
  await audit({
    guildId: interaction.guildId,
    type: TYPES.INFO,
    category: CATEGORIES.PERMISSION,
    message: t('inner:info.forbidden', {command: commandName}),
  });
};

module.exports.notifyRestricted = async (commandName, interaction) => {
  const embed = new MessageEmbed()
    .setColor(config.colors.warning)
    .setTitle(t('discord:embed.restricted.title', {command: commandName}))
    .setTimestamp()
    .setDescription(t('discord:embed.restricted.description'));
  await this.notify(commandName, interaction, {embeds: [embed], ephemeral: true});
  await audit({
    guildId: interaction.guildId,
    type: TYPES.INFO,
    category: CATEGORIES.COMMAND,
    message: t('inner:info.restricted', {command: commandName}),
  });
};

module.exports.notifyNoPlaying = async (commandName, interaction, isExecute) => {
  if (isExecute) {
    const embed = new MessageEmbed()
      .setColor(config.colors.warning)
      .setTitle(t('discord:embed.noPlaying.title'))
      .setDescription(t('discord:embed.noPlaying.description'))
      .setTimestamp();
    await this.notify(commandName, interaction, {embeds: [embed]});
  }
  await audit({
    guildId: interaction.guildId,
    type: TYPES.WARNING,
    category: CATEGORIES.COMMAND,
    message: t('inner:info.noPlaying', {command: commandName}),
  });
};

module.exports.notifyUnequalChannels = async (commandName, interaction, isExecute) => {
  if (isExecute) {
    const embed = new MessageEmbed()
      .setColor(config.colors.warning)
      .setTitle(t('discord:embed.unequalChannels.title'))
      .setDescription(t('discord:embed.unequalChannels.description'))
      .setTimestamp();
    await this.notify(commandName, interaction, {embeds: [embed]});
  }
  await audit({
    guildId: interaction.guildId,
    type: TYPES.WARNING,
    category: CATEGORIES.COMMAND,
    message: t('inner:info.unequalChannels', {command: commandName}),
  });
};

module.exports.notifyIsLive = async (commandName, interaction, isExecute) => {
  if (isExecute) {
    const embed = new MessageEmbed()
      .setColor(config.colors.warning)
      .setTitle(t('discord:embed.isLive.title'))
      .setDescription(t('discord:embed.isLive.description'))
      .setTimestamp();
    await this.notify(commandName, interaction, {embeds: [embed]});
  }
  await audit({
    guildId: interaction.guildId,
    type: TYPES.WARNING,
    category: CATEGORIES.COMMAND,
    message: t('inner:info.isLive'),
  });
};

module.exports.notifyError = async (commandName, e, interaction) => {
  const embed = new MessageEmbed()
    .setColor(config.colors.error)
    .setTitle(t('discord:embed.command.notifyError.title'))
    .setTimestamp()
    .setDescription(`${stringify(e)}`);
  await this.notify(`${commandName}`, interaction, {embeds: [embed]});
  await audit({
    guildId: interaction.guildId,
    type: TYPES.ERROR,
    category: CATEGORIES.COMMAND,
    message: `[${commandName}]:\n${stringify(e)}`,
  });
};

/* TODO: Временное решение пока все команды не мигрируют на функцию
 */
module.exports.getCommandData = command => Promise.resolve(typeof command.data === 'function'
  ? command.data()
  : command.data);
