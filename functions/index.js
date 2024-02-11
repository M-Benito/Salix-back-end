//const {onRequest} = require("firebase-functions/v2/https");
//const logger = require("firebase-functions/logger");

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require('express');

const app = express();
const serviceAccount = require("./credentials.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore;

app.get('/hello-world', (req, res) => {
    return res.status(200).json({ message: 'Hello world' })
});

app.post('/api/products', async (req, res) => {
    try {
        await db
            .collection('products')
            .doc('/' + req.body.id + '/')
            .create({ name: req.body.name });
        return res.status(200).json();
    } catch (error) {
        return res.status(500).send(error);
    }
});

app.get('/api/daily_actions/:id', async (req, res) => {
    try {
        const doc = db.collection('daily_actions').doc(req.params.id);
        const item = await doc.get();
        const response = item.data();
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).send(error);
    }
});

app.get('/api/daily_actions/', async (req, res) => {
    try {
        const doc = db.collection('daily_actions');
        const item = await doc.get();
        const response = item.docs;
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).send(error);
    }
});


exports.app = functions.https.onRequest(app);