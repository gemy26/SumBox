const outboxRepository = require('../db/repositories/outboxRepository');

async function addOutboxEvent(payload, transaction) {
  const eventData = {
    payload,
    status: 'pending',
    sent_at: null,
    updated_at: new Date()
  };

  return await outboxRepository.create(eventData, transaction);
}

async function getPendingEvents() {
  return await outboxRepository.findPendingAndFailedEvents();
}

async function markEventAsSent(eventId, transaction) {
  const updateData = {
    status: 'sent',
    sent_at: new Date(),
    updated_at: new Date()
  };

  return await outboxRepository.updateById(eventId, updateData, transaction);
}

async function markEventAsFailed(eventId, transaction) {
  const updateData = {
    status: 'failed',
    updated_at: new Date()
  };

  return await outboxRepository.updateById(eventId, updateData, transaction);
}

module.exports = {
  addOutboxEvent,
  getPendingEvents,
  markEventAsSent,
  markEventAsFailed
};
