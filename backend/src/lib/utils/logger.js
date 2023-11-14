'use strict';

const fLogger = require('fluent-logger')
const _ = require('lodash');
const ConsoleLogger = require('./consoleLogger');

const consoleLogger = new ConsoleLogger();

class logger {

    serverStart({serverId, port, service}) {
        consoleLogger.info(`${service} - server start`, {
            serverId,
            port
        });
        return;
    }

    serverStop({serverId, port, eventCode, service}) {
        consoleLogger.info(`${service} - server stop`, {
            serverId,
            port,
            eventCode
        });
        return;
    }

    requestInfo(ctx, tags) {
        consoleLogger.log('request record', {
            requestId: ctx.id,
            tags,
            method: ctx.method,
            path: ctx.path,
            header: ctx.headers,
            remoteAddress: ctx.ip,
            query: ctx.query && !_.isEmpty(ctx.query) ? ctx.query : undefined
        });
        return;
    }

    async requestPayloadInfo(ctx, tags) {
        const base = logger.prototype;
        let payload = _.cloneDeep(ctx.request.body);

        if (ctx.logger.sensitiveList) {
            payload = await base.sensitiveInfoProcessAsync({
                data: ctx.request.body,
                sensitiveList: ctx.logger.sensitiveList
            });
        } else {
            payload = ctx.request.body;
        }
        payload = base.truncatePayloadAsync(ctx.logger, payload);
        
        consoleLogger.log('request body parser record', {
            requestId: ctx.id,
            tags: tags,
            method: ctx.method,
            path: ctx.path,
            payload
        });
        return;
    }

    responseInfo(ctx, tags, isRecordResponseBody, isLimitPayload, limitPayloadSize) {
        let logObj = {
            requestId: ctx.id,
            method: ctx.method,
            path: ctx.path,
            header: ctx.response.header,
            tags,
            statusCode: ctx.status,
            responseTime: ctx.response.header['x-response-time'],
            payloadSize: ctx.response.length,
            matchedRoute: ctx.state && ctx.state.route ? ctx.method + '_' + ctx.state.route.path : ''
        };
        if (isRecordResponseBody === 'true') {
            if (!_.isArrayBuffer(ctx.response.body) && !_.isBuffer(ctx.response.body)
                && (ctx.response.header['content-type'] && ctx.response.header['content-type'].indexOf('application/json') > -1)) {
                    limitPayloadSize = limitPayloadSize || 1000;
                    let responseBody = JSON.stringify(ctx.response.body);
                    let startPayloadLength = _.ceil(limitPayloadSize / 10);
                    let endPayloadLength = responseBody.length - startPayloadLength;
                    if (isLimitPayload === 'true' && responseBody.length > limitPayloadSize
                        && responseBody.length > startPayloadLength) {
                        logObj.payload = responseBody.substring(0, startPayloadLength)
                            + '...' + responseBody.substring(endPayloadLength);
                    } else {
                        logObj.payload = ctx.response.body;
                    }
            }
        }

        consoleLogger.log('response record', logObj);
        return;
    }

    serverErrorInfo({serverId, message, err}) {
        consoleLogger.error(`${message} - ${serverId}`, err);
        return;
    }

    requestErrorInfo({requestId, err}) {
        err.requestId = requestId;
        consoleLogger.error(`error record.`, err);
        return;
    }

    async sensitiveInfoProcessAsync({data, sensitiveList}) {
        let _data = _.cloneDeep(data);
        sensitiveList.forEach(function(key) {
            if (_data[key]) {
                let obj = _data[key].toString();
                if (obj.length < 5) {
                    _data[key] = `${obj.substr(0, 1)}*****${obj.substr(obj.length - 1, 1)}`;
                } else {
                    _data[key] = `${obj.substr(0, 2)}*****${obj.substr(obj.length - 2, 2)}`;
                }
            }
        }, this);
        return Promise.resolve(_data);
    }
    
    truncatePayloadAsync({isTruncate, limitPayloadSize, startPayloadLength,
        endPayloadLength, truncateSpecificFields}, payload) {
        if (truncateSpecificFields) {
            truncateSpecificFields.forEach((field) => {
                if(payload[field]) {
                    payload[field] = '...';
                }
            });
        }
        if (isTruncate === 'true') {
            limitPayloadSize = limitPayloadSize || 200;
            let limitPayload = JSON.stringify(payload);
            startPayloadLength = startPayloadLength || 50;
            endPayloadLength = endPayloadLength || 50;
            if (limitPayload.length > limitPayloadSize) {
                payload = limitPayload.substring(0, startPayloadLength)
                    + '...' + limitPayload.substring(limitPayload.length - endPayloadLength);
            }
        }
        return payload;
    }
}

module.exports = logger;
