const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const { log } = require("../../utils/logger");
const { notify } = require("../commands");
const config = require("../../configs/config.js");
const { escaping } = require("../../utils/string.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Пропустить текущую композицию'),
    async execute(interaction) {
        await skip(interaction);
    },
    async listener(interaction) {}
}

const skip = async (interaction) => {
    if (!interaction.client.queue.connection || !interaction.client.queue.player) {
        const embed = new MessageEmbed()
            .setColor(config.colors.warning)
            .setTitle('Так ничего и не играло')
            .setDescription(`Как ты жалок... Зачем пропускать, то чего нет? Или у тебя голоса в голове?`)
            .setTimestamp();
        await notify('skip', interaction, {embeds: [embed]});
        log(`[skip] Пропустить композицию не вышло: плеер не играет`);
        return;
    }

    if (interaction.client.queue.connection.joinConfig.channelId !==
        interaction.member.voice.channel.id) {
            const embed = new MessageEmbed()
                .setColor(config.colors.warning)
                .setTitle('Канал не тот')
                .setDescription(`Мда.. шиза.. перепутать каналы это надо уметь`)
                .setTimestamp();
            await notify('skip', interaction, {embeds: [embed]});
            log(`[skip] Пропустить композицию не вышло: не совпадают каналы`);
            return;
    }
    
    interaction.client.queue.player.stop();
    const embed = new MessageEmbed()
        .setColor(config.colors.info)
        .setTitle('Текущая композиция уничтожена')
        .setDescription(`Название того, что играло уже не помню. Прошлое должно остаться в прошлом.
        ...Вроде это **${escaping(interaction.client.queue.nowPlaying.song.title)}**, но уже какая разница?`);
    await notify('skip', interaction, {embeds: [embed]});
    log(`[skip] Композиция была успешно пропущена`);
}