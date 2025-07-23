
const OutBoxEvent = require('../models/outBoxEvent');
const { Op } = require("sequelize");

async function findPendingAndFailedEvents() {
    return await OutBoxEvent.findAll({
        where: {
            status: {
                [Op.in]: ['pending', 'failed']
            }
        }
    });
}

async function create(eventData, transaction) {
    return await OutBoxEvent.create(eventData, { transaction });
}

async function updateById(eventId, updateData, transaction) {
    return await OutBoxEvent.update(updateData, {
        where: { id: eventId },
        transaction
    });
}

module.exports = {
    findPendingAndFailedEvents,
    create,
    updateById
};