'use strict';

const errorCode = require('./constants/errorCode');

const systemErrorHandle = async (err, ctx) => {
    if (!err) {
        return;
    }
    ctx.onError(err);
    ctx.response.statusObj = {
        code: errorCode.c10001.code,
        message: err.message || errorCode.c10001.message,
        description: null
    };
    ctx.status = errorCode.c10001.status;
    return;
}

exports.systemErrorHandle = systemErrorHandle;