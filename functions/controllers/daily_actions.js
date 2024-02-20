const admin = require("firebase-admin");
const express = require('express');
const cors = require("cors");
const app = express();

app.use(cors({ origin: true }));
const db = admin.firestore();

// Get all the daily actions of a user
app.get('/api/get/user/:id/daily_actions/', async (req, res) => {
    try {
        let DAQuery = await db.collection('daily_actions').get();
        let userDAQuery = await db.collection('users_daily_actions').get();
        let responseDA = [];
        let responseUserDAU = [];

        DAQuery.docs.map((doc) => {
            const dailyActions = {
                id: doc.id,
                body: doc.data().body,
                points: doc.data().points,
                title: doc.data().title
            }
            responseDA.push(dailyActions);
        });

        userDAQuery.docs.map((doc) => {
            if (doc.data().userId == req.params.id) {
                const userAction = {
                    dailyActionId: doc.data().dailyActionId,
                    title: responseDA[doc.data().dailyActionId - 1].title,
                    body: responseDA[doc.data().dailyActionId - 1].body,
                    points: responseDA[doc.data().dailyActionId - 1].points,
                    isCompleted: doc.data().isCompleted,
                }
                responseUserDAU.push(userAction);
            }
        });

        return responseUserDAU.length != 0 ? res.status(200).send(responseUserDAU) : res.status(400).send("ERROR BUSINESS LOGIC: Not user found");
    } catch (error) {
        return res.status(500).send(error);
    }
});

// Get a generic daily action by id
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

// Get all the generics daily actions
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

// Update a daily action
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
        return res.status(500).send(error);
    }
});

module.exports = app;