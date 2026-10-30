const serverless = require('serverless-http');
const {createApp} = require('../../backend-integration/app.cjs');

// Netlify injects server-only environment variables at function runtime.
// Do not load or bundle local .env files here.
exports.handler = serverless(createApp());
