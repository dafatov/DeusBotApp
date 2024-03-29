const client = require('./client');
const guild = require('./guild');
const member = require('./member');
const user = require('./user');

module.exports = {
  client,
  commandName: null,
  deferred: null,
  deferReply: jest.fn(),
  editReply: jest.fn(),
  followUp: jest.fn(),
  guild,
  guildId: guild.id,
  isRepliable: jest.fn(),
  member,
  options: {
    getAttachment: jest.fn(),
    getChannel: jest.fn(),
    getInteger: jest.fn(),
    getString: jest.fn(),
    getSubcommand: jest.fn(),
  },
  replied: null,
  reply: jest.fn(),
  showModal: jest.fn(),
  user,
};
