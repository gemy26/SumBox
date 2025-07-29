const dotenv = require('dotenv').config();
const express = require('express');
const kafkaConsumer = require('./kafka/kafkaConsumer');
const storageService = require('./services/storageService');
const {register} = require('./metrics/prometheusMetrices');
const metricsMiddleware = require('./middlewares/metricsMiddleware');

const app = express();

// Initialize Kafka consumer with retry mechanism
async function initializeKafkaConsumer() {
    let retries = 0;
    const maxRetries = 5;

    while (retries < maxRetries) {
        try {
            await kafkaConsumer.RecieveMessages();
            console.log('Kafka consumer initialized successfully');
            break;
        } catch (err) {
            retries++;
            console.error(`Failed to initialize Kafka consumer (attempt ${retries}/${maxRetries}):`, err);
            
            if (retries >= maxRetries) {
                console.error('Failed to initialize Kafka consumer after max retries');
                process.exit(1);
            }
            
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(2, retries), 10000)));
        }
    }
}

initializeKafkaConsumer();

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

app.get('/random', (req, res) => {
    let random = Math.floor(Math.random() * 10);
    let status = [200, 201, 300, 400, 401, 405, 500];
    let randomStatus = status[random % 7];
    res.status(randomStatus);
    res.end();
})

app.listen(3000, "0.0.0.0", () => {
    console.log("Rest service is running on port 3000");
});

