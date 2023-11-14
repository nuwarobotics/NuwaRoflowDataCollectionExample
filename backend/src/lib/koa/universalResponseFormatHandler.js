'use strict';

/* eslint-disable no-param-reassign */
const _ = require('lodash');

const errorCode = require('../constants/errorCode');
const responseFormat = require('../constants/responseFormat');

const universalResponseFormatHandler = () => {
    return async (ctx, next) => {
        const base = universalResponseFormatHandler.prototype;
        let responseObj = _.cloneDeep(responseFormat);
        ctx.response.statusObj = responseObj.status;
        await next()
            .then(() => {
                let response = ctx.response;
                if (response.statusObj.proxy) {
                    return Promise.resolve();
                }
                return base._successReturn({ctx, responseObj, response})
                    .catch(base._errorReturnWithAlreadyDefineCode)
                    .catch(base._errorReturn404WithNonDefineCode)
                    .catch(base._errorReturn500WithNonDefineCode)
                    .catch(() => Promise.resolve());
            })
            .catch((err) => {
                return base._catchJoiValidationError({ctx, responseObj, err})
                    .catch(base._catchUnHandlingError);
            });
    };
};

universalResponseFormatHandler.prototype = {

    _errorReturnWithAlreadyDefineCode: ({ctx, responseObj, response}) => {
        if (ctx.status >= 400 && response.statusObj.code !== '0') {
            ctx.status = ctx.status;
            responseObj.status.code = response.statusObj.code;
            responseObj.status.message = response.statusObj.message;
            responseObj.status.description = response.statusObj.description;
            ctx.body = responseObj;
            return Promise.resolve();
        }
        return Promise.reject({ctx, responseObj, response});
    },

    _errorReturn404WithNonDefineCode: ({ctx, responseObj, response}) => {
        if (ctx.status >= 400 && ctx.status === 404) {
            ctx.status = 404;
            responseObj.status.code = errorCode.c10003.code;
            responseObj.status.message = errorCode.c10003.message;
            ctx.body = responseObj;
            return Promise.resolve();
        }
        return Promise.reject({ctx, responseObj, response});
    },

    _errorReturn500WithNonDefineCode: ({ctx, responseObj, response}) => {
        if (ctx.status >= 400 && ctx.status === 500) {
            ctx.status = 500;
            responseObj.status.code = errorCode.c10001.code;
            responseObj.status.message = errorCode.c10001.message;
            ctx.body = responseObj;
            return Promise.resolve();
        }
        return Promise.reject({ctx, responseObj, response});
    },

    _successReturn: ({ctx, responseObj, response}) => {
        let isStatusForce = (response.statusObj && response.statusObj.force) ? true : false;
        if (ctx.status >= 200 && ctx.status < 300) {
            if ((ctx.request.path.indexOf('oauth2') > -1 ||
                    ctx.request.path.split('/')[1] === 'files' ||
                    ctx.request.path === '/v1/ota/testview' ||
                    response.headers['content-disposition'] ||
                    response.header['content-ranges'] ||
                    (response.header['content-type'] && response.header['content-type'].indexOf('application/json') < 0)) && !isStatusForce
                ) {
                return Promise.resolve();
            }
            ctx.status = ctx.status;
            responseObj.status.code = response.statusObj.code;
            responseObj.status.message = response.statusObj.message;
            responseObj.status.description = response.statusObj.description;
            responseObj.data = ctx.body;
            ctx.body = responseObj;
            return Promise.resolve();
        }
        return Promise.reject({ctx, responseObj, response});
    },

    _catchJoiValidationError: ({ctx, responseObj, err}) => {
        if (err.isJoi || err.name === 'BadRequestError') {
            ctx.status = 400;
            responseObj.status.code = errorCode.c10002.code;
            responseObj.status.message = errorCode.c10002.message;
            responseObj.status.description = err.message;
            ctx.body = responseObj;
            return Promise.resolve();
        }
        if (err.message.indexOf('Unexpected token v in JSON at position') > -1 ||
            err.message === 'invalid JSON, only supports object and array') {
            ctx.status = 400;
            responseObj.status.code = errorCode.c10002.code;
            responseObj.status.message = errorCode.c10002.message;
            responseObj.status.description = 'invalid JSON format.';
            ctx.body = responseObj;
            return Promise.resolve();
        }
        return Promise.reject({ctx, responseObj, err});
    },

    _catchUnHandlingError: ({ctx, responseObj, err}) => {
        ctx.app.emit('error', err);
        ctx.status = 500;
        responseObj.status.code = errorCode.c10001.code;
        responseObj.status.message = errorCode.c10001.message;
        ctx.body = responseObj;
        return Promise.resolve();
    }
};

module.exports = universalResponseFormatHandler;
