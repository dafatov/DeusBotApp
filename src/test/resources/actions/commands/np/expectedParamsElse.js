const {MessageEmbed} = require('discord.js');
const interaction = require('../../../mocks/commandInteraction');

module.exports = [
  interaction, {
    embeds: [
      new MessageEmbed({
        color: 16777040,
        description: '00:00:23/00:00:50—_username_\n■■■■■■■■■■■■■■■■■■□□□□□□□□□□□□□□□□□□□□□□ [46%]',
        'thumbnail': {
          'url': 'https://urlThumnail.com',
        },
        'footer': {
          'icon_url': 'https://urlIcon.com',
          'text': 'Играет композиция от username',
        },
        timestamp: new Date('2023-02-06T10:20:27.013Z'),
        title: 'title',
        url: 'https://url.com',
      }),
    ],
    files: [
      [32, 43, 11, 55],
    ],
  },
];