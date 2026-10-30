const express = require('express');
const cors = require('cors');
const path = require('node:path');
const dotenv = require('dotenv');
const {createRouter} = require('./pio/contact.cjs');
const root = path.resolve(__dirname, '..');
function loadEnvironment(directory = root, env = process.env) {
  dotenv.config({path:path.join(directory,'.env'),processEnv:env,quiet:true});
  return env;
}
function createApp(options = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.get('/api/health', cors({origin:true}), (req,res) => {
    res.set('Cache-Control','no-store').json({status:'ok',service:'pio-backend'});
  });
  if (process.env.TRUST_PROXY_HOPS) app.set('trust proxy', Number(process.env.TRUST_PROXY_HOPS));
  // Public enquiry endpoint: no cookies or authenticated session required.
  app.use('/api/pio/contact', cors({origin:true,methods:['POST','OPTIONS'],allowedHeaders:['Content-Type'],credentials:false}), createRouter(options));
  return app;
}
module.exports = {createApp,loadEnvironment};
