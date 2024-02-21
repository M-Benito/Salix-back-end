const admin = require("firebase-admin");
const express = require('express');
const cors = require("cors");
const app = express();

app.use(cors({ origin: true }));
const db = admin.firestore();

// Create new user
app.post('/api/create/user/', async (req, res) => {
    try {
        await db
            .collection('users')
            .add({
                name: req.body.name,
                surname: req.body.surname,
                email: req.body.email,
                password: req.body.password,
                imageUrl: req.body.imageUrl,
                isAlergic: req.body.isAlergic,
                points: req.body.points,
                trees: req.body.trees,
                createdAt: req.body.createdAt
            });
        return res.status(200).send();
    } catch (error) {
        return res.status(500).send(error);
    }
});

// get user by Id
app.get('/api/get/user/:id', async (req, res) => {
    try {
        const doc = db
            .collection('users')
            .doc(req.params.id);
        let action = await doc.get();
        let response = action.data();
        return res.status(200).send(response);
    } catch (error) {
        return res.status(500).send(error);
    }
});

// Update user by Id
app.put('/api/update/user/:id', async (req, res) => {
    try {
        let userExist = false;
        let users = await db.collection('users').get();

        users.docs.map(async (doc) => {
            if (req.params.id == doc.id) {
                userExist = true;
                const user = db
                    .collection('users')
                    .doc(req.params.id);
                await user.update({
                    name: req.body.name,
                    surname: req.body.surname,
                    email: req.body.email,
                    password: req.body.password,
                    imageUrl: req.body.imageUrl,
                    isAlergic: req.body.isAlergic,
                    points: req.body.points,
                    trees: req.body.trees,
                    createdAt: req.body.createdAt
                });
            }
        });
        return userExist ? res.status(200).send() : res.status(400).send("ERROR BUSINESS LOGIC: Not user found");
    } catch (error) {
        return res.status(500).send(error);
    }
});

// Delete user by Id (soft delete?)

module.exports = app;