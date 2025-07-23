const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('outbox_service', 'Root', 'Root1234', {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    port: process.env.DB_PORT,
    logging: false,
});


module.exports = sequelize;
