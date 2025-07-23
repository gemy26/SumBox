const { Queue, Worker } = require('bullmq');
const dispatcher = require('../services/outboxDispatcher');
const connection = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
};

const outboxDispatcherQueue = new Queue('outbox-dispatcher', { connection });

// Upserting a job with a cron expression
(async () => {
    await outboxDispatcherQueue.add(
        'fifteen-second-dispatcher',
        {
            pattern: process.env.OUTBOX_CRON_PATTERN, // Runs every 5 seconds
        },
        {
            name: 'cron-job',
            data: { jobData: 'Dispatch pending and failed outbox events' },
            opts: {},
        },
    );
})();


// Worker to process the jobs
const worker = new Worker(
  'outbox-dispatcher',
  async job => {
    console.log(`Dispatching at ${new Date().toISOString()}`);
    await dispatcher();
  },
  { connection },
);

module.exports = worker;