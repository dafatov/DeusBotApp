const {Collection} = require('discord.js');
const member = require('./member');

module.exports = {
  channels: {
    resolve: jest.fn(() => ({name: 'deus-bot-news'})),
  },
  fetch: () => Promise.resolve({
    channels: {
      fetch: jest.fn(() => Promise.resolve(new Collection([
        ['922163692940951574', {send: module.exports.send}],
      ]))),
    },
    id: module.exports.id,
    members: {
      fetch: jest.fn(fetchMembersOptions => Promise.resolve(getMembers(fetchMembersOptions))),
    },
  }),
  id: '301783183828189184',
  name: 'CRINGE-A-LOT',
  voiceAdapterCreator: {},
};

module.exports.send = jest.fn(args => ({
  guildId: module.exports.id,
  ...args,
}));

const getMembers = fetchMembersOptions => {
  const members = [
    member,
    {
      user: {
        id: '233923369685352449',
      },
    },
    {
      user: {
        id: '381845173384249356',
      },
    },
    {
      displayName: 'Кагомэ',
      user: {
        id: '268080849172430850',
      },
    },
  ];

  if (typeof fetchMembersOptions === 'object') {
    return members.filter(member => fetchMembersOptions?.user?.includes(member.user.id) ?? true);
  } else if (fetchMembersOptions) {
    return members.find(member => fetchMembersOptions === member.user.id);
  } else {
    return members;
  }
};
