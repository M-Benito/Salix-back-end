//const {onRequest} = require("firebase-functions/v2/https");
//const logger = require("firebase-functions/logger");

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require('express');
const cors = require("cors");
const app = express();
const serviceAccount = require("./credentials.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
app.use(cors({ origin: true }));
const db = admin.firestore();

// Routes
app.get('/hello-world', (req, res) => {
    //return res.status(200).json({ message: 'Hello world' })
    return res.status(200).send('Hello world!');
});

// Create (POST)
app.post('/api/create/product', async (req, res) => {
    try {
        await db
            .collection('products')
            .doc('/' + req.body.id + '/')
            .create({ name: req.body.name });
        return res.status(200).send();
    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
});

// Read (GET)
app.get('/api/get/daily_action/:id', async (req, res) => {
    try {
        const doc = db
            .collection('daily_actions')
            .doc(req.params.id);
        let action = await doc.get();
        let response = action.data();
        return res.status(200).send(response);
    } catch (error) {
        return res.status(500).send(error);
    }
});

app.get('/api/get/daily_actions', async (req, res) => {
    try {
        let query = db
            .collection('daily_actions');
        let response = [];

        await query.get().then(querySnapshot => {
            let docs = querySnapshot.docs;
            for (let doc of docs) {
                const selectedItem = {
                    id: doc.id,
                    title: doc.data().title,
                    body: doc.data().body,
                    points: doc.data().points
                }
                response.push(selectedItem);
            }
            return response;
        });
        return res.status(200).send(response);
    } catch (error) {
        return res.status(500).send(error);
    }
});

// Update (PUT)
app.put('/api/update/daily_action/:id', async (req, res) => {
    try {
        const doc = db
            .collection('daily_actions')
            .doc(req.params.id);
        await doc.update({
            title: req.body.title,
            body: req.body.body,
            points: req.body.points
        });

        return res.status(200).send();
    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
});

// Delete (DELETE)
app.delete('/api/delete/product/:id', async (req, res) => {
    try {
        const doc = db
            .collection('products')
            .doc(req.params.id);
        await doc.delete();
        return res.status(200).send();
    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
});


// Export API to Firebase Cloud Functions
exports.app = functions.https.onRequest(app);