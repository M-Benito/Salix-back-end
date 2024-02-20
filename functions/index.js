//const {onRequest} = require("firebase-functions/v2/https");
//const logger = require("firebase-functions/logger");

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const serviceAccount = require("./credentials.json");

const express = require('express');
const cors = require("cors");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const app = express();
app.use(cors({ origin: true }));

app.use(require('./controllers/base'));
app.use(require('./controllers/ping'));
//app.use(require('./controllers/bearer_token'));
app.use(require('./controllers/user'));
app.use(require('./controllers/daily_actions'));
app.use(require('./controllers/ligth_price'));

// Export API to Firebase Cloud Functions
exports.app = functions.https.onRequest(app);