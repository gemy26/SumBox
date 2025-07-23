const { Kafka } = require('kafkajs')
const {queue_latency} = require('../metrics/prometheusMetrices')
const storageService = require('../services/storageService');

class KafkaConsumer {
    constructor() {
        this.kafka = new Kafka({
            clientId: process.env.KAFKA_CLIENT_ID,
            brokers: [process.env.KAFKA_BROKERS]
        });
        this.consumer = this.kafka.consumer();
        this.connected = false;
    }

    async connect() {
        if(!this.connected){
            console.log("Consumer connecting...");
            await this.consumer.connect();
            console.log("Consumer connected!");
            this.connected = true;
        }
    }

    async RecieveMessages() {
        try {
            await this.connect();

            await this.consumer.subscribe({
                "topic": process.env.SUMMATION_TOPIC,
                "fromBeginning": true
            })

            await this.consumer.run({
                "eachMessage" : async (result) => {
                    const now = Date.now() / 1000;
                    const latency = now - result.message.value.produced_at;
                    queue_latency.observe(latency);

                    console.log(`Recieved message: ${JSON.stringify(result.message.value)} on topic: ${result.topic}`)

                    let recievedData = parseInt(result.message.value.payload) || 0;
                    storageService.saveFileData(recievedData + storageService.getFileData());

                }
            })

        }catch (err) {
            console.log(`There is an error ${err}`);
            throw err;
        }
    }

}

module.exports = new KafkaConsumer();