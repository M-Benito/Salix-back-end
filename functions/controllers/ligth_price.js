const admin = require("firebase-admin");
const express = require('express');
const cors = require("cors");
const app = express();

app.use(cors({ origin: true }));
const db = admin.firestore();

// Read (GET)
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



// Update (PUT)
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

module.exports = app;