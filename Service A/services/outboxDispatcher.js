const kafkaProducer = require('../kafka/kafkaProducer');
const outboxService = require('./outboxServices');
const { Op } = require("sequelize");
const sequelize = require('../db/config');

async function dispatch() {
    try {
        const events = await outboxService.getPendingEvents();
        console.log(`Found ${events.length} events to dispatch`);

        for (const event of events) {
            let transaction;
            try {
                transaction = await sequelize.transaction();
                
                const success = await kafkaProducer.sendMessage(event.payload);
                console.log(`Sent message with ID ${event.id} to Kafka`);

                if (success) {
                    console.log(`Updating event ${event.id} as sent`);
                    await outboxService.markEventAsSent(event.id, transaction);
                } else {
                    console.log(`Updating event ${event.id} as failed`);
                    await outboxService.markEventAsFailed(event.id, transaction);
                }

                await transaction.commit();
                console.log(`Successfully processed event ${event.id}`);
            } catch (err) {
                console.error(`Failed to process event ${event.id}:`, err);
                if (transaction) await transaction.rollback();
            }
        }
    } catch (err) {
        console.error('Failed to fetch pending events:', err);
    }
}


module.exports = dispatch;