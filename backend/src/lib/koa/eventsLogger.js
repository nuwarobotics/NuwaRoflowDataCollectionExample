'use strict';

const Logger = require('../utils/logger');
const logger = new Logger();
const EventEmitter = require('events').EventEmitter;
const event = new EventEmitter();

event.on('errorLogger', function(err, ctx) {
    logger.requestErrorInfo({requestId: ctx.id, err});
});

const eventsLogger = () => {
    return async (ctx, next) => {
        ctx.onError = (err) => {
            if (err.name === 'RequestError' && err.error.code === 'ESOCKETTIMEDOUT') {
                return;
            }
            event.emit('errorLogger', err, ctx);
        };
        await next();
    };
};

module.exports = eventsLogger;
