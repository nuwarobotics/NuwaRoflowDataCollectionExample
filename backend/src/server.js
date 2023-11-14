'use strict';

require('app-module-path').addPath(__dirname);
const http = require('http');
const os = require('os');
const util = require('util');
const path = require('path');
const uuidV4 = require('uuid/v4');

const Koa = require('koa');
const app = new Koa();
const koaBody = require('koa-body');
const compress = require('koa-compress');

const config = require('configs/config');
const Logger = require('lib/utils/logger');
const logger = new Logger();

const BaseHelper = require('helpers/baseHelper');
const PathPointerHelper = require('helpers/pathPointerHelper');
const baseHelper = new BaseHelper();
const pathPointerHelper = new PathPointerHelper();

const robotRoute = require('routes/robotRoute');
const projectRoute = require('routes/projectRoute');

const universalResponseFormatHandler = require('lib/koa/universalResponseFormatHandler');
const requestLogger = require('lib/koa/requestLogger');
const eventsLogger = require('lib/koa/eventsLogger');
const bodyLogger = require('lib/koa/bodyLogger');
const ConsoleLogger = require('lib/utils/consoleLogger');

const mongoDbConnectionHelper = require('helpers/mongoDbConnectionHelper');
const consoleLogger = new ConsoleLogger();

const serverId = `${os.hostname()}:${baseHelper.getLocalIpAddress()}:${uuidV4().split('-')[0]}`;
const rootPath = pathPointerHelper.getRootPath(true);
const distPath = path.join(rootPath + config.upload.dir);
const pkJson = require(`${rootPath}package.json`);

mongoDbConnectionHelper.load()
.catch((err) => {
    consoleLogger.error(err);
});

app.proxy = true;
app.use(compress());
app.use(requestLogger({
    serverId,
    isRecordResponseBody: 'true',
    isLimitPayload: config.log.limitPayload || 'true',
    limitPayloadSize: config.log.limitPayloadSize
}));

app.use(eventsLogger());
app.use(universalResponseFormatHandler());

app.use(koaBody({
    multipart: true,
    formidable: {
        uploadDir: path.join(distPath),
        maxFieldsSize: config.upload.maxFieldSize,  
        maxFileSize: config.upload.maxFileSize,
        keepExtensions: true,
        hash: 'md5'
    },
    formLimit: config.body.formLimit,
    jsonLimit: config.body.jsonLimit,
    strict: false
}));

app.use(bodyLogger({
    isTruncate: config.log.isTruncate,
    isLimitPayload: config.log.limitPayload || 'true',
    limitPayloadSize: config.log.limitPayloadSize,
    truncateSpecificFields: config.log.truncateSpecificFields || ['html']
}));
app.use(robotRoute.middleware());
app.use(projectRoute.middleware());

const port = config.server.port;
const host = config.server.host;
http.createServer(app.callback()).listen(port,
    async () => {
        try {
            consoleLogger.info(util.inspect(config, true, null));
            consoleLogger.info(`server running at http://${host}:${port}`);
        } catch (err) {
            throw new Error('A standard error');
        }
    });

const closeHandler = (code) => {
    mongoDbConnectionHelper.disconnect();
    process.exit(code);
};

app.on('error', (err) => {
    logger.serverErrorInfo({serverId: serverId, message: 'uncaughtException', err});
});

process.on('uncaughtException', (err) => {
    logger.serverErrorInfo({serverId: serverId, message: 'uncaughtException', err});
});

process.on('SIGINT', () => {
    closeHandler(0);
});

process.on('SIGTERM', () => {
    closeHandler(0);
});

process.on('exit', (code) => {
    logger.serverStop({serverId: serverId, port: port, eventCode: code, service: pkJson.name});
});
