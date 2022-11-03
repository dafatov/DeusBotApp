const {CATEGORIES, TYPES} = require('./db/repositories/audit');
const {Server} = require('socket.io');
const {audit} = require('./actions/auditor');
const bodyParser = require('body-parser');
const cors = require('cors');
const {createServer} = require('http');
const express = require('express');
const fs = require('fs');
const {t} = require('i18next');

module.exports.init = async client => {
  const app = express();
  app.use(bodyParser.json({type: '*/*'}));
  app.use(cors());
  const httpServer = createServer(app);
  const io = new Server(httpServer, {cors: {origin: '*'}});

  fs.readdirSync('./src/api/rest')
    .filter(f => !f.startsWith('_'))
    .filter(f => f.endsWith('js'))
    .map(f => require(`./api/rest/${f}`))
    .forEach(api => {
      api.execute({app});
    });

  io.on('connection', socket => {
    fs.readdirSync('./src/api/socket')
      .filter(f => !f.startsWith('_'))
      .filter(f => f.endsWith('js'))
      .map(f => require(`./api/socket/${f}`))
      .forEach(api => {
        api.execute({io, socket, client});
      });
  });

  httpServer.listen(process.env.PORT);
  await audit({
    guildId: null,
    type: TYPES.INFO,
    category: CATEGORIES.INIT,
    message: t('inner:audit.init.server'),
  });
};