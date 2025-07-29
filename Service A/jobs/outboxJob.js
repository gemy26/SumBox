const { Queue, Worker } = require('bullmq');
const dispatcher = require('../services/outboxDispatcher');
const connection = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
};

console.log('Initializing BullMQ with Redis connection:', connection);

const outboxDispatcherQueue = new Queue('outbox-dispatcher', { connection });

// Upserting a job with a cron expression
(async () => {
    try {
        console.log('Adding/repeating outbox dispatcher job...');
        const job = await outboxDispatcherQueue.add(
            'fifteen-second-dispatcher',
            { jobData: 'Dispatch pending and failed outbox events' },
            {
                repeat: { 
                    cron: process.env.OUTBOX_CRON_PATTERN,
                    immediately: true 
                },
                removeOnComplete: true,
                removeOnFail: false,
            }
        );
        console.log('Repeat job scheduled with ID:', job.id);
    } catch (error) {
        console.error('Failed to schedule repeat job:', error);
    }
})();

// Worker to process the jobs
const worker = new Worker(
    'outbox-dispatcher',
    async job => {
        console.log(`Worker running at ${new Date().toISOString()} for job ${job.id}`);
        await dispatcher();
    },
    { 
        connection,
        autorun: true,
        concurrency: 1,
        limiter: {
            max: 1,
            duration: 1000
        }
    }
);

worker.on('ready', () => {
    console.log('Worker is ready to process jobs');
});

worker.on('error', err => {
    console.error('Worker error:', err);
});

worker.on('completed', job => {
    console.log(`Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
    console.error(`Job ${job.id} failed:`, err);
});

process.on('SIGTERM', async () => {
    await worker.close();
});

module.exports = worker;