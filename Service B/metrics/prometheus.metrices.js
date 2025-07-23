const client = require('prom-client')

const http_request_total = new client.Counter({
    name : "http_request_total",
    help : "The total number of HTTP requests received",
    labelNames : ['route','method', 'statusCode']
})

const kafka_message_latency_seconds = new client.Histogram({
    name : "kafka_message_latency_seconds",
    help : "Time from Kafka message production to consumption in seconds",
    labelNames : ["topic", "partition", "status"],
    buckets: [0.05, 0.1, 0.3, 0.5, 1, 2, 5, 10, 30]
})

const http_response_rate_histogram = new client.Histogram({
    name : "http_response_rate_histogram",
    help : "The duration of HTTP requests in seconds",
    labelNames : ['route', 'statusCode', 'method'],
    buckets : [0.0, 0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3,
    1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 10]
})


module.exports = {
  queue_latency : kafka_message_latency_seconds,
  http_response_rate_histogram,
  http_request_total,
  register : client.register
};