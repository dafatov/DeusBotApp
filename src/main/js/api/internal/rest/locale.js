const {CATEGORIES, TYPES} = require('../../../db/repositories/audit');
const {audit} = require('../../../actions/auditor');
const i18next = require('i18next');
const {stringify} = require('../../../utils/string');

module.exports = {
  execute({app}) {
    app.get('/api/locales/:lng/:ns', async (req, res) => {
      try {
        await audit({
          guildId: null,
          type: TYPES.INFO,
          category: CATEGORIES.LOCALE,
          message: i18next.t('inner:audit.locale.get', {ns: req.params.ns, lng: req.params.lng}),
        }).then(() => res.json(i18next.getResourceBundle(req.params.lng, req.params.ns)));
      } catch (e) {
        await audit({
          guildId: null,
          type: TYPES.ERROR,
          category: CATEGORIES.LOCALE,
          message: stringify(e),
        }).then(() => res.status(500));
      } finally {
        res.end();
      }
    });

    app.post('/api/locales/add/:lng/:ns', async (request, response) => {
      try {
        Object.keys(request.body).filter(key => key).forEach(key => {
          i18next.services.backendConnector.saveMissing(request.params.lng, request.params.ns, key, request.body[key]);
        });
        await audit({
          guildId: null,
          type: TYPES.WARNING,
          category: CATEGORIES.LOCALE,
          message: i18next.t('inner:audit.locale.missing', {key: Object.keys(request.body).map(key => request.params.ns + ':' + key)}),
        }).then(() => response.status(200));
      } catch (e) {
        await audit({
          guildId: null,
          type: TYPES.ERROR,
          category: CATEGORIES.LOCALE,
          message: stringify(e),
        }).then(() => response.status(500));
      } finally {
        response.end();
      }
    });
  },
};
