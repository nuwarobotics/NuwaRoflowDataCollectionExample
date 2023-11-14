'use strict';

const config = {
    server: {
        host: '0.0.0.0',
        port: parseInt(process.env.API_PORT || 8086, 10)
    },
    db: {
        mongoPoolSize: process.env.DB_MONGO_POOL_SIZE || 20,
        mongoKeepAlive: process.env.DB_MONGO_KEEP_ALIVE || 120,
        mongodb: 
        {
            workflow: {
                url: process.env.DB_MONGO_WORKFLOW_URL || 'mongodb://mongo:27017/nuwa-workflow',
                database: process.env.DB_MONGO_WORKFLOW_DATABASE || 'nuwa-workflow',
                col: {
                    variable: 'workflow_variable',
                    log: 'workflow_data_log'
                }
            },
        }
    },
    log: {
        isTruncate: process.env.LOG_IS_TRUNCATE || 'false',
        responseBody: process.env.LOG_RESPONSE_BODY || 'true',
        limitPayload: process.env.LOG_LIMIT_PAYLOAD || 'false',
        limitPayloadSize: parseInt(process.env.LOG_PAYLOAD_LIMIT_SIZE || '1000', 10),
        isSendFluent: process.env.LOG_IS_SEND_FLUENT || 'false',
        fluentTag: process.env.LOG_FLUENT_TAG || 'dev',
        fluentHost: process.env.LOG_FLUENT_HOST || '10.1.0.11',
        fluentPort: parseInt(process.env.LOG_FLUENT_PORT || '24224', 10),
        truncateSpecificFields: (process.env.LOG_TRUNCATE_SPECIFIC_FIELDS || 'html,bing_html').split(',')
    },
    upload: {
        dir: process.env.UPLOAD_DIR || 'workflow/',
        workspace: process.env.WORKSPACE || 'workspace/',
        maxFieldSize: parseInt(process.env.UPLOAD_FIELD_MAXSIZE || '1024', 10),
        maxFileSize: parseInt(process.env.UPLOAD_FILE_MAXSIZE || 200 * 1024 * 1024, 10),
        hashCheck: process.env.UPLOAD_HASHCHECK || 'md5',
        supportType: {
            image: process.env.UPLOAD_SUPPORTTYPE_IMG || 'image/pjpeg,image/jpeg,image/png,image/gif',
            video: process.env.UPLOAD_SUPPORTTYPE_VIDEO || 'video/mp4',
            codePackage: process.env.UPLOAD_SUPPORTTYPE_CODEPACKAGE || 'mbk',
            backupFile: process.env.UPLOAD_SUPPORTTYPE_BACKUPFILE || 'lbj'
        }
    },
    body: {
       formLimit: process.env.FROM_LIMIT || "20mb",
       jsonLimit: process.env.JSON_LIMIT || "20mb"
    },
    pageSize: 20,
    variableCountLimit: 100
}

module.exports = config;
