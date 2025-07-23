const metrics = require('../metrics/prometheusMetrices');

module.exports = function (req, res, next) {
    const end = metrics.http_response_rate_histogram.startTimer();

    res.on('finish', () => {

        const route = req.route?.path || req.path || 'unknown';
        const statusCode = res.statusCode ? res.statusCode.toString() : 'unknown';
        end({
            method: req.method,
            route: route,
            statusCode: statusCode
        });

        metrics.http_request_total.inc({
            method: req.method,
            route: route,
            statusCode: statusCode
        });
    });

    next();
}