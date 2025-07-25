const client = require('prom-client')

const http_request_total = new client.Counter({
    name : "http_request_total",
    help : "The total number of HTTP requests received",
    labelNames : ['route','method', 'statusCode']
})

const kafka_message_latency_seconds = new client.Histogram({
    name : "kafka_message_latency_seconds",
    help : "Time from kafka message production to consumption in seconds",
    labelNames : ["topic", "partition", "status"],
    buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5, 10, 30]
})

const http_response_rate_histogram = new client.Histogram({
    name : "http_response_rate_histogram",
    help : "The duration of HTTP requests in seconds",
    labelNames : ['route', 'statusCode', 'method'],
    buckets : [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0]
})


module.exports = {
  queue_latency : kafka_message_latency_seconds,
  http_response_rate_histogram,
  http_request_total,
  register : client.register
};