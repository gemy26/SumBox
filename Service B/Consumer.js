const { Kafka } = require('kafkajs')
const {queue_latency} = require('./metrics/prometheus.metrices')
const fs = require('fs')
async function main() {
    try {
        const kafka = new Kafka({
            "clientId": "myapp",
            "brokers": ["localhost:9092"]
        });

        const consumer = kafka.consumer({"groupId": "test"});
        console.log("consumer Connecting....")
        await consumer.connect()
        console.log("consumer Connected!")
        

        await consumer.subscribe({
            "topic": "Summation",
            "fromBeginning": true
        })

        await consumer.run({
            "eachMessage" : async (result) => {
                
                const now = Date.now() / 1000;
                const latency = now - payload.produced_at;
                queue_latency.observe(latency);

                console.log(`Recieved message: ${result.message.value} on topic: ${result.topic}`)

                let fileData = 0;
                try {
                    fileData = parseInt(fs.readFileSync('./data.txt', 'utf-8')) || 0;
                } catch (e) {
                    console.log(`problem in read file ${e}`)
                }
                let recievedData = parseInt(result.message.value) || 0;
                let newData = fileData + recievedData;
                fs.writeFileSync('./data.txt', newData.toString(), 'utf-8');
            }
        })

    }catch(err){
        console.log(`There is an error ${err}`);
    }
}

module.exports = main;