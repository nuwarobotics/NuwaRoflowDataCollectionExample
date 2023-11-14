'use strict';

const Logger = require('../utils/logger');
const logger = new Logger();

const requestLogger = ({serverId, isRecordResponseBody, isLimitPayload, limitPayloadSize}) => {
    return async (ctx, next) => {
        const start = new Date();
        ctx.id = `${start.getTime()}:${serverId}`;
        logger.requestInfo(ctx);
        await next();
        const ms = new Date() - start;
        ctx.set('X-Response-Time', `${ms}ms`);
        logger.responseInfo(ctx, null, isRecordResponseBody, isLimitPayload, limitPayloadSize);
    };
};

module.exports = requestLogger;
