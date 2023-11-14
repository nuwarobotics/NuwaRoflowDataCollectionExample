'use strict';

const _ = require('lodash');

const Logger = require('../utils/logger');
const logger = new Logger();

const bodyLogger = ({
  sensitiveList, isTruncate, limitPayloadSize, startPayloadLength,
  endPayloadLength, truncateSpecificFields}) => {
  return async (ctx, next) => {
    let body = ctx.request.body;
    if (body && !_.isEmpty(body)) {
      ctx.logger = {
        sensitiveList, isTruncate, limitPayloadSize, startPayloadLength,
        endPayloadLength, truncateSpecificFields
      };
      logger.requestPayloadInfo(ctx);
    }
    await next();
  };
};

module.exports = bodyLogger;
