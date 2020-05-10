// ABOUT
// Runs the SyncLounge Web App - handles serving the static web content and link shortening services
// Port defaults to 8088
// REQUIRED: Access URL must be set. See documentation for how to set this.

const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const Waterline = require('waterline');
const WaterlineMysql = require('waterline-mysql');
const SailsDisk = require('sails-disk');

const SettingsHelper = require('./SettingsHelper');
let settings = new SettingsHelper();

let PORT = 8088;

const bootstrap = () => new Promise(async (resolve, reject) => {
  if (!settings.webapp_port) {
    console.log('Defaulting webapp to port 8088');
  }
  else{
    PORT = settings.webapp_port;
  }
  PORT = parseInt(PORT);
  const baseSettings = require('./waterline_settings.json');
  //console.log('Basesettings', baseSettings);
  baseSettings.waterline.adapters = {
    'waterline-mysql': WaterlineMysql,
    'sails-disk': SailsDisk,
  };
  baseSettings.waterline.datastores = baseSettings.database.datastores;
  baseSettings.waterline.models.invite.beforeCreate = async (data, cb) => {
    console.log('Creating Invite', data);
    let fullUrl;
    const params = {
      server: data.server,
      room: data.room,
      owner: data.owner,
    };
    if (data.password) {
      params.password = data.password;
    }
    let query = '';
    for (const key in params) {
      query += `${encodeURIComponent(key)}=${params[key]}&`;
    }
    fullUrl = `${settings.accessUrl || data.urlOrigin}/#/join?${query}`;
    data.fullUrl = fullUrl;
    data.code = (0 | Math.random() * 9e6).toString(36);
    cb();
  };
  Waterline.start(baseSettings.waterline, (err, orm) => {
    if (err) {
      return reject(err);
    }
    resolve(orm);
  });
});

const app = async (orm) => {
  const root = express();
  // Setup our web app
  root.use(cors());
  root.use(bodyParser.json());
  root.use(bodyParser.urlencoded({
    extended: true
  }));
  root.use(`${settings.webroot}/`, express.static(path.join(__dirname, 'dist')));
  // Invite handling
  root.get(`${settings.webroot}/invite/:id`, async (req, res) => {
    console.log('handling an invite', req.params.id);
    const shortObj = await Waterline.getModel('invite', orm).findOne({ code: req.params.id });
    console.log('Invite data', shortObj);
    if (!shortObj) {
      return res.redirect(settings.webroot);
    }
    console.log('Redirecting an invite link', shortObj);
    return res.redirect(shortObj.fullUrl);
  });
  root.post(`${settings.webroot}/invite`, async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    if (!req.body) {
      return res.send({
        success: false,
        msg: 'ERR: You did not send any POST data',
      }).end();
    }

    const data = {};
    const fields = ['urlOrigin', 'server', 'room', 'password', 'owner'];
    for (let i = 0; i < fields.length; i++) {
      if (req.body[fields[i]] === undefined) {
        return res.send({
          success: false,
          msg: `ERR: You did not specify ${fields[i]}`,
          field: fields[i],
        }).end();
      }
      data[fields[i]] = req.body[fields[i]];
    }

    const result = await Waterline.getModel('invite', orm).create(data).fetch();
    return res.send({
      url: `${settings.accessUrl || data.urlOrigin}/invite/${result.code}`,
      success: true,
      generatedAt: new Date().getTime(),
      details: result,
    }).end();
  });
  // Config handling
  root.get(`${settings.webroot}/config`, (req, res) => {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    res.send(settings);
  });
  // Catch anything else and redirect to the base URL
  root.get('*', (req, res) => {
    console.log('Catch all:', req.url);
    return res.redirect(`${settings.webroot}/`);
  });

  const rootserver = require('http').createServer(root);
  rootserver.listen(PORT);
  console.log(`SyncLounge WebApp successfully started on port ${PORT}`);
  if (settings.webroot) {
    console.log(`Running with base URL: ${settings.webroot}`);
  }
  if(settings.accessUrl) {
    console.log(`Access URL is ${settings.accessUrl}`);
    if(settings.webroot && !settings.accessUrl.includes(settings.webroot)) {
      console.log(`- Your Access URL does not contain your 'webroot', '${settings.webroot}'. Make sure this is correct.`)
    }
  }
};

bootstrap().then((orm) => {
  app(orm);
}).catch((e) => {
  console.log('Error bootstrapping webapp:', e);
});
