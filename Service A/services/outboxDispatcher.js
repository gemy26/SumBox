const kafkaProducer = require('../kafka/kafkaProducer');
const outboxService = require('./outboxServices');
const { Op } = require("sequelize");
const sequelize = require('../db/config');

async function dispatch() { //outbox Events
    //call the queue 
    const events = await outboxService.getPendingEvents();
    console.log(`Found ${events.length} events to dispatch`);
    let transaction;
    for (const event of events) {
        const success = await kafkaProducer.sendMessage(event.payload);
        console.log(`Sent message with ID ${event.id} to Kafka`);
        try{
            transaction = await sequelize.transaction();
            console.log(`After creating transaction`);
        }catch (err){
            console.error('Failed to create transaction:', err);
        }

        try {
            if (success) {
                console.log(`Updated event ${event.id} as sent`);
                await outboxService.markEventAsSent(event.id, transaction);
            } else {
                console.log(`Updated event ${event.id} as failed`);
                await outboxService.markEventAsFailed(event.id, transaction);
            }
            await transaction.commit();
        } catch (err) {
            console.error(`DB update failed for event ${event.id}:`, err);
            await transaction.rollback();
        }
    }
}

module.exports = dispatch;