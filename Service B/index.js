const dotenv = require('dotenv').config();
const express = require('express');
const kafkaConsumer = require('./kafka/kafkaConsumer');
const storageService = require('./services/storageService');
const {register} = require('./metrics/prometheusMetrices');
const metricsMiddleware = require('./middlewares/metricsMiddleware');

const app = express();

kafkaConsumer.RecieveMessages();

app.use(express.json());

app.use(metricsMiddleware);

app.get('/summation',(req, res) => {
    let sum = 0;
    try{
        sum = storageService.getFileData();
    }catch(err){
        console.log(`Error getting data from file ${err}`);
    }
    res.status(200).json({ Status: "Success", data: sum });
})

app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
})

app.listen(3000, "0.0.0.0", () => {
    console.log("Rest service is running on port 3000");
});

