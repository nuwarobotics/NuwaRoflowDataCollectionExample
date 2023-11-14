'use strict';

/* eslint-disable no-console */
const util = require('util');
const moment = require('moment');

const logger = function() {};
const LOG_TAG = '[LOG]';
const INFO_TAG = '[INFO]';
const WARN_TAG = '[WARN]';
const ERROR_TAG = '[ERROR]';
const dateFormat = 'YYYY-MM-DD HH:mm:ss.SSS Z';
let fLogger;
let label;
let containerName;
let isSendFluent;
let tagName;

logger.prototype = {
    
    setFLogger: function(l, osName, pkName, tag, isSend) {
        fLogger = l;
        label = osName;
        containerName = pkName;
        isSendFluent = isSend;
        tagName = tag;
    },
    
    fLoggerEmit: function(tag, log, source) {
        if (isSendFluent === 'true') {
            fLogger.emit(label, {
                log: moment().format(dateFormat) + ' ' + tag + ' ' + log,
                container_name: containerName,
                source: source || 'stdout',
                space: process.env.NODE_ENV,
                tag: 'docker.' + tagName
            });
        }
    },

    log: function(message, meta) {
        if (meta) {
            console.log(LOG_TAG, util.format('%s: %s', message, this.formatMeta(meta)));
            this.fLoggerEmit(LOG_TAG, util.format('%s: %s', message, this.formatMeta(meta)));
        } else {
            console.log(LOG_TAG, message);
            this.fLoggerEmit(LOG_TAG, message);
        }
    },

    info: function(message, meta) {
        if (meta) {
            console.info(INFO_TAG, util.format('%s: %s', message, this.formatMeta(meta)));
            this.fLoggerEmit(INFO_TAG, util.format('%s: %s', message, this.formatMeta(meta)));
        } else {
            console.info(INFO_TAG, message);
            this.fLoggerEmit(INFO_TAG, message);
        }
    },

    warn: function(message, meta) {
        if (meta) {
            console.warn(WARN_TAG, util.format('%s: %s', message, this.formatMeta(meta)));
            this.fLoggerEmit(WARN_TAG, util.format('%s: %s', message, this.formatMeta(meta)));
        } else {
            console.warn(WARN_TAG, message);
            this.fLoggerEmit(WARN_TAG, message);
        }
    },

    error: function(message, meta) {
        if (meta) {
            console.error(ERROR_TAG, util.format('%s: %s', message, this.formatMeta(meta)));
            this.fLoggerEmit(ERROR_TAG, util.format('%s: %s', message, this.formatMeta(meta)), 'stderr');
        } else {
            console.error(ERROR_TAG, message);
            this.fLoggerEmit(ERROR_TAG, message, 'stderr');
        }
    },

    formatMeta: function(meta) {
        if (typeof meta === 'string') {
            return meta;
        }
        let obj = meta;
        if (obj instanceof Error) {
            obj = {
                requestId: obj.requestId || null,
                error: obj.toString(),
                stack: obj.stack
            };
        } else if (obj && obj.error instanceof Error) {
            obj.stack = obj.error.stack;
            obj.error = obj.error.toString();
        }

        return JSON.stringify(obj);
    }
};

module.exports = logger;
