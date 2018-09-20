
var winston = require('winston')

var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({
            filename: './logs/analysis.log',
            timestamp:'true',
            maxsize: 10485760,
            maxFiles: 10 })
    ]})

module.exports = {
    logger: logger
}