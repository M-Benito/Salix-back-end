const admin = require("firebase-admin");
const express = require('express');
const cors = require("cors");
const app = express();

app.use(cors({ origin: true }));
const db = admin.firestore();

// Read (GET)
app.get('/api/get/user/:id', async (req, res) => {
    try {
        const doc = db
            .collection('Users')
            .doc(req.params.id);
        let action = await doc.get();
        let response = action.data();
        return res.status(200).send(response);
    } catch (error) {
        return res.status(500).send(error);
    }
});

module.exports = app;