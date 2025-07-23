const express = require('express');
const fs = require('fs');
const startKafka = require('./kafka/kafkaConsumer');
const {register} = require('./metrics/prometheusMetrices');
const metricsMiddleware = require('./middlewares/metricsMiddleware');
const app = express();

startKafka();

app.use(express.json());

app.use(metricsMiddleware);

app.get('/get_data',(req, res) => {
    let sum;
    try {
        sum = fs.readFileSync('./data.txt', 'utf-8');
    } catch (err) {
        console.log(`There is an error ${err}`);
    }
    res.json({ Status: "Success", data: sum });
})

app.get('./metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
})

app.listen(3000, "localhost", () => {
    console.log("Rest service is running on port 3000");
});

