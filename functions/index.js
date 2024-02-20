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
        return res.status(500).send(error);
    }
});

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

app.get('/api/get/daily_ligth_price/:zone', async (req, res) => {
    try {
        let query = req.params.zone == "PCB" ? db.collection('/light_price_cpb') : db.collection('/light_price_cym');
        let response = [];

        await query.get().then(querySnapshot => {
            let docs = querySnapshot.docs;
            for (let doc of docs) {
                const ligthSegment = {
                    id: doc.id,
                    date: doc.data().date,
                    hour: doc.data().hour,
                    isCheap: doc.data().isCheap,
                    isUnderAvg: doc.data().isUnderAvg,
                    price: doc.data().price,
                    units: doc.data().units
                }
                response.push(ligthSegment);
            }
            return response;
        });
        return res.status(200).send(response);
    } catch (error) {
        return res.status(500).send(error);
    }
});

app.get('/api/get/user_daily_actions/:id', async (req, res) => {
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
        return res.status(500).send(error);
    }
});

app.put('/api/update/daily_ligth_price/', async (req, res) => {
    fetch('https://api.preciodelaluz.org/v1/prices/all?zone=PCB')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response wasn\'t ok');
            }
            return response.json();
        })
        .then(async ligthPriceResponse => {
            try {
                for (var key in ligthPriceResponse) {
                    if (ligthPriceResponse.hasOwnProperty(key)) {
                        const doc = db
                            .collection('light_price_cpb')
                            .doc(key);
                        await doc.update({
                            date: ligthPriceResponse[key].date,
                            hour: ligthPriceResponse[key].hour,
                            isCheap: ligthPriceResponse[key]["is-cheap"],
                            isUnderAvg: ligthPriceResponse[key]["is-under-avg"],
                            price: ligthPriceResponse[key].price,
                            market: ligthPriceResponse[key].market,
                            units: ligthPriceResponse[key].units
                        });
                    }
                }
                return res.status(200).send();
            } catch (error) {
                return res.status(500).send(error);
            }
        })
        .catch(error => {
            return res.status(500).send(error);
        });

    fetch('https://api.preciodelaluz.org/v1/prices/all?zone=CYM')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response wasn\'t ok');
            }
            return response.json();
        })
        .then(async ligthPriceResponse => {
            try {
                for (var key in ligthPriceResponse) {
                    if (ligthPriceResponse.hasOwnProperty(key)) {
                        const doc = db
                            .collection('light_price_cym')
                            .doc(key);
                        await doc.update({
                            date: ligthPriceResponse[key].date,
                            hour: ligthPriceResponse[key].hour,
                            isCheap: ligthPriceResponse[key]["is-cheap"],
                            isUnderAvg: ligthPriceResponse[key]["is-under-avg"],
                            price: ligthPriceResponse[key].price,
                            market: ligthPriceResponse[key].market,
                            units: ligthPriceResponse[key].units
                        });
                    }
                }
                return res.status(200).send();
            } catch (error) {
                return res.status(500).send(error);
            }
        })
        .catch(error => {
            return res.status(500).send(error);
        });
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