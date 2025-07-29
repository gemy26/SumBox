import { Client, StatusOK } from 'k6/net/grpc';
import { check, sleep } from 'k6';

const client = new Client();
client.load(['/scripts/protos'], 'Summation.proto');

export const options = {
    thresholds: {
        grpc_req_duration: ['p(95)<300', 'p(99)<800'],
    },
    scenarios: {
        main_load: {
            executor: 'ramping-arrival-rate',
            startRate: 2,
            timeUnit: '1s',
            stages: [
                { duration: '1m', target: 15 },
                { duration: '2m', target: 30 },
                { duration: '3m', target: 60 },
                { duration: '4m', target: 100 },
                { duration: '3m', target: 50 },
                { duration: '2m', target: 15 },
            ],
            preAllocatedVUs: 40,
            maxVUs: 120,
        },

        burst_load: {
            executor: 'ramping-arrival-rate',
            startTime: '7m',
            startRate: 0,
            timeUnit: '1s',
            stages: [
                { duration: '15s', target: 150 },
                { duration: '45s', target: 150 },
                { duration: '15s', target: 0 },
                { duration: '30s', target: 0 },
                { duration: '15s', target: 120 },
                { duration: '30s', target: 120 },
                { duration: '15s', target: 0 },
            ],
            preAllocatedVUs: 25,
            maxVUs: 80,
        },

        background: {
            executor: 'constant-arrival-rate',
            rate: 3,
            timeUnit: '1s',
            duration: '15m',
            preAllocatedVUs: 8,
            maxVUs: 15,
        }
    }
};




export default function () {
    client.connect('service-a:4000', {
        plaintext: true,
    });

    try {
        const a = Math.floor(Math.random() * 10);
        const b = Math.floor(Math.random() * 10);
        const data = { a, b };
        const expectedSum = a + b;

        const response = client.invoke('summationPackage.Summation/sumTwoNumbers', data);

        check(response, {
            'status is OK': (r) => r && r.status === StatusOK,
            'response has sum field and correct value': (r) =>
                r && r.message && r.message.sum === expectedSum,
        });

    } catch (error) {
        console.error(`gRPC request failed: ${error.message}`);
    } finally {
        client.close();
    }

    sleep(1);
}

export function teardown() {
    console.log('Test completed');
}