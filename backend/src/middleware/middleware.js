'use strict';

const errorCode = require('lib/constants/errorCode');
const joiRouter = require('koa-joi-router');
const joi = joiRouter.Joi;

class ugcEditorMiddleware {

    headerOption = {
        allowUnknown: true
    };
    
    bodyValidate = (validate) => {
        return async (ctx, next) => {
            return joi.validate(ctx.request.body, validate, async err => {
                if (err) {
                    ctx.response.statusObj = {
                        code: errorCode.c10002.code,
                        message: errorCode.c10002.message,
                        description: err.message
                    };
                    ctx.status = errorCode.c10002.status;
                    return;
                }
                await next();
                return;
            });
        };
    } 

    headerValidate = (validate) => {
        return async (ctx, next) => {
            return joi.validate(ctx.request.headers, validate, this.headerOption, async err => {
                if (err) {
                    ctx.response.statusObj = {
                        code: errorCode.c10002.code,
                        message: errorCode.c10002.message,
                        description: err.message
                    };
                    ctx.status = errorCode.c10002.status;
                    return;
                }
                await next();
                return;
            });
        };
    }

    fileValidate = (validate) => {
        return async (ctx, next) => {
            return joi.validate(ctx.request.files, validate, async err => {
                if (err) {
                    ctx.response.statusObj = {
                        code: errorCode.c10002.code,
                        message: errorCode.c10002.message,
                        description: err.message
                    };
                    ctx.status = errorCode.c10002.status;
                    return;
                }
                await next();
                return;
            });
        };
    }
}

module.exports = ugcEditorMiddleware;