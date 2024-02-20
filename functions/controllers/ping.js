const express = require('express');
const cors = require("cors");
const app = express();

app.use(cors({ origin: true }));

// Routes
app.get('/hello-world', (req, res) => {
    return res.status(200).send('Hello world!');
});

module.exports = app;