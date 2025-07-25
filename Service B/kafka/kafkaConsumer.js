const { Kafka } = require('kafkajs')
const {queue_latency} = require('../metrics/prometheusMetrices')
const storageService = require('../services/storageService');

class KafkaConsumer {
    constructor() {
        this.kafka = new Kafka({
            clientId: process.env.KAFKA_CLIENT_ID,
            brokers: [process.env.KAFKA_BROKERS]
        });
        this.consumer = this.kafka.consumer({ groupId: 'summation-group' });
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
                "eachMessage" : async ({ topic, partition, message }) => {
                    try{
                        const raw = message.value.toString();
                        const parsed = JSON.parse(raw);

                        const now = Date.now() / 1000;
                        const latency = now - parsed.produced_at;
                        queue_latency.observe(
                            { topic, partition: partition.toString(), status: 'success' },
                            latency
                        );


                        console.log(`Recieved message: ${JSON.stringify(parsed)} on topic: ${topic}`);

                        let recievedData = parseInt(parsed.message.payload.sum) || 0;
                        storageService.saveFileData(recievedData + storageService.getFileData());
                    }catch (err){
                        console.error(`There is an error ${err}`);
                    }
                }
            })

        }catch (err) {
            console.log(`There is an error ${err}`);
            throw err;
        }
    }

}

module.exports = new KafkaConsumer();