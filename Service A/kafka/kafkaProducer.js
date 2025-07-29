const { Kafka } = require('kafkajs')

class KafkaProducer {
    constructor() {
        this.kafka = new Kafka({
            clientId: process.env.KAFKA_CLIENT_ID,
            brokers: [process.env.KAFKA_BROKERS]
        });
        this.producer = this.kafka.producer();
        this.connected = false;
    }

    async connect() {
        if (!this.connected) {
            console.log("Producer connecting...");
            await this.producer.connect();
            console.log("Producer connected!");
            this.connected = true;
        }
    }

    async sendMessage(payload) {
        try {
            await this.connect();

            const result = await this.producer.send({
                topic: process.env.SUMMATION_TOPIC,
                messages: [{
                    value: JSON.stringify({
                        message: payload,
                        produced_at: Date.now() / 1000,
                    })
                }]
            });

            console.log(`Sent successfully: ${JSON.stringify(result)}`);
            return true;
        } catch(err) {
            console.log(`Error sending message: ${err}`);
            this.connected = false;
            await this.connect();
            return false;
        }
    }

    async disconnect() {
        if (this.connected) {
            await this.producer.disconnect();
            this.connected = false;
        }
    }
}

module.exports = new KafkaProducer();