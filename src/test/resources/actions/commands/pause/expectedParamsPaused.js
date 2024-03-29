const {EmbedBuilder} = require('discord.js');
const interaction = require('../../../mocks/commandInteraction');

module.exports = [
  interaction, {
    embeds: [
      new EmbedBuilder({
        color: 16777040,
        description: '-- Однажды, давным давно, когда я еще был молодым, мне повстречался человек необычайных талантов. Я тогда не мог даже представить, что человеческий мозг в состоянии на такое...\n-- Что же он мог, деда?\n-- Ох, молодежь пошла, не перебивай старших, если хочешь услышать продолжение...\n-- Извини, деда\n-- Ну, так вот, на чем я остановился? Ах, да! Я встретил человека с крайне необычным разумом. До сих пор, смотря сквозь призму лет, я все еще с трудом верю, что такое могло произойти. Ну так вот, этот человек....\n-- ...\n-- ...\n-- Деда, что с тобой? Все в порядке? Ты чего завис???',
        timestamp: new Date('2023-02-06T10:20:27.013Z'),
        title: 'Проигрывание приостановлено',
      }),
    ],
  }
];
