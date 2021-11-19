const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const { log } = require("../../utils/logger");
const { notify } = require("../commands");
const config = require("../../configs/config.js");
const { escaping } = require("../../utils/string.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Приостановить/возобновить проигрывание композиции'),
    async execute(interaction) {
        await pause(interaction);
    },
    async listener(interaction) {}
}

const pause = async (interaction) => {
    if (!interaction.client.queue.connection || !interaction.client.queue.player) {
        const embed = new MessageEmbed()
            .setColor(config.colors.warning)
            .setTitle('Так ничего и не играло')
            .setDescription(`Как ты жалок... Зачем приостанавливать, то чего нет? Или у тебя голоса в голове?`)
            .setTimestamp();
        await notify('pause', interaction, {embeds: [embed]});
        log(`[pause] Изменить состояние паузы не вышло: плеер не играет`);
        return;
    }

    if (interaction.client.queue.connection.joinConfig.channelId !==
        interaction.member.voice.channel.id) {
            const embed = new MessageEmbed()
                .setColor(config.colors.warning)
                .setTitle('Канал не тот')
                .setDescription(`Мда.. шиза.. перепутать каналы это надо уметь`)
                .setTimestamp();
            await notify('pause', interaction, {embeds: [embed]});
            log(`[pause] Изменить состояние паузы не вышло: не совпадают каналы`);
            return;
    }

    let isPause = interaction.client.queue.nowPlaying.isPause;
    if (isPause) {
        interaction.client.queue.player.unpause();
    } else {
        interaction.client.queue.player.pause();
    }
    interaction.client.queue.nowPlaying.isPause = !isPause;
    const embed = new MessageEmbed()
        .setColor(config.colors.info)
        .setTitle(`Проигрывание ${isPause ? 'возобновлено' : 'приостановлено'}`)
        .setDescription(`${isPause
            ? `-- Деда, что с тобой? Все в порядке? Ты чего завис???
                -- Да в порядке я. Уснул чутка.
                -- Слава богу
                -- Заинтриговал? Хочешь услышать продолжение истории?
                -- Да, деда. Хочу. Очень хочу
                -- Так вот. давным давно встреченный человек с необычайным разумом...
                -- Деда! Не тяни!
                -- Хорошо, внучок, хорошо. Так вот тот человек ||установил доту|| и ||пошел в рейтинг в соло с рандомами||
                -- Боже.. и что с ним стало после?
                -- Да ничего особенного. ||Апнул 5К ММР||
                -- Ничего себе, деда.
                -- Да, внучок. Теперь он в лучшем мире. Еще пару лет и я тоже туда отправлюсь
                -- Не говори такое, деда.. Такого даже врагу не пожелаешь
                -- Ха-ха-ха... Все будет в порядке внучок. Это естественно.`
            : `-- Однажды, давным давно, когда я еще был молодым, мне повстречался человек необычайных талантов. Я тогда не мог даже представить, что человеческий мозг в состоянии на такое...
                -- Что же он мог, деда?
                -- Ох, молодешь пошла, не перебивай старших, если хочешь услышать продолжение...
                -- Извини, деда
                -- Ну, так вот, на чем я остановился? Ах, да! Я встретил человека с крайне необычным разумом. До сих пор, смотря сквозь призму лет, я все еще с трудом верю, что такое могло произойти. Ну так вот, этот человек....
                -- ...
                -- ...
                -- Деда, что с тобой? Все в порядке? Ты чего завис???`}`);
    await notify('pause', interaction, {embeds: [embed]});
    log(`[pause] Композиция была успешна ${isPause ? 'возобновлена' : 'приостановлена'}`);
}