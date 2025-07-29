import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    scenarios: {
        main_load: {
            executor: 'ramping-arrival-rate',
            startRate: 5,
            timeUnit: '1s',
            stages: [
                { duration: '1m', target: 20 },
                { duration: '2m', target: 50 },
                { duration: '3m', target: 100 },
                { duration: '4m', target: 150 },
                { duration: '3m', target: 75 },
                { duration: '2m', target: 25 },
            ],
            preAllocatedVUs: 50,
            maxVUs: 200,
        },
        spike_test: {
            executor: 'ramping-arrival-rate',
            startTime: '8m',
            startRate: 0,
            timeUnit: '1s',
            stages: [
                { duration: '30s', target: 200 },
                { duration: '1m', target: 200 },
                { duration: '30s', target: 0 },
            ],
            preAllocatedVUs: 30,
            maxVUs: 100,
        },
        background: {
            executor: 'constant-arrival-rate',
            rate: 5,
            timeUnit: '1s',
            duration: '15m',
            preAllocatedVUs: 10,
            maxVUs: 20,
        }
    }
};

export default function () {
    const res = http.get('http://host.docker.internal:3000/summation');

    check(res, {
        'response has data field with numeric value': (r) => {
            try {
                const body = JSON.parse(r.body);
                return body.hasOwnProperty('data') && typeof body.data === 'number';
            } catch (e) {
                return false;
            }
        },
    });

    sleep(1);
}