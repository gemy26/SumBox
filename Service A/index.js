require('dotenv').config();
const startServer = require('./Server');
const setupKafka = require('./kafka/kafkaSetup');
const sequelize = require('./db/config');
require('./jobs/outboxJob');

(async () => {
    try {
        await sequelize.sync({ alter: true });
        console.log("Database synced.");
    } catch (err) {
        console.error("Database sync failed:", err);
    }
})();

async function startApp(){
    await sequelize.authenticate();
    console.log('PostgreSQL connected successfully');
    await setupKafka();
    await startServer();
}

startApp();



