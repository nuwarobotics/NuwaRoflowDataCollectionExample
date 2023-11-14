'use strict';

const errorCode = require('./constants/errorCode');

class utils {

    successFormat = (res) => {
        let response;
        response = res;
        return response;
    }

    failureFormart = (desc, ctx, errObj) => {
        if (errObj) {
            ctx.response.statusObj = {
                code: errObj.code,
                message: errObj.message,
                description: ''
            };
        } else {
            ctx.response.statusObj = {
                code: errorCode.c10008.code,
                message: errorCode.c10008.message,
                description: desc.message
            };
        }

        ctx.body = {};
        ctx.status = 400;

        return;
    }

    retNowTimestamp = () => {
        return Math.round(this.retNowMSTimestamp()/1000);
    }

    retNowMSTimestamp = () => {
        return new Date().getTime();
    }

    retNow = () => {
        return new Date();
    }
 }

module.exports = utils;
