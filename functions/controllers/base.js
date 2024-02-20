const admin = require("firebase-admin");
const express = require('express');
const cors = require("cors");
const app = express();

app.use(cors({ origin: true }));
const db = admin.firestore();

// Create (POST)
app.post('/api/create/product', async (req, res) => {
    try {
        await db
            .collection('products')
            .doc('/' + req.body.id + '/')
            .create({ name: req.body.name });
        return res.status(200).send();
    } catch (error) {
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

module.exports = app;