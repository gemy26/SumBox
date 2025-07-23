const { Kafka } = require('kafkajs')

async function setupKafka(){
    try{
        const kafka = new Kafka({
            "clientId": process.env.KAFKA_CLIENT_ID,
            "brokers": [process.env.KAFKA_BROKERS]
        });

        const admin = kafka.admin();
        console.log('Connecting ....');
        await admin.connect();
        console.log('Connected');

        await admin.createTopics({
            topics: [
                { topic: process.env.SUMMATION_TOPIC }
            ]
        });

        console.log("Created Successfully!")
        await admin.disconnect();

    }catch(err){
        console.log(`There is some error ${err}`);
    }
}

module.exports = setupKafka;
