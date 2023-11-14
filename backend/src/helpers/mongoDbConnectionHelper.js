'use strict';

const config = require('configs/config');
const mongoClient = require('mongodb').MongoClient;
const ReadPreference = require('mongodb').ReadPreference;

const ConsoleLogger = require('lib/utils/consoleLogger');
const consoleLogger = new ConsoleLogger();

let dbInstance = {};
let dbSetting = {
    autoReconnect: true,
    poolSize: config.db.mongoPoolSize,
    keepAlive: config.db.mongoKeepAlive
}

function connectAsync(db) {
    return mongoClient.connect(
        db.connString,
        dbSetting
    );
}

function getDb(dbKey) {
    return dbInstance[dbKey];
}

function getCollection(col, dbKey) {
    return getDb(dbKey).collection(col, {
        readPreference: ReadPreference.SECONDARY_PREFERRED
    });
}

function disconnect() {
    for (let i in config.db.mongodb) {
        let dbKey = config.db.mongodb[i].database
        if (dbInstance[dbKey]) {
            dbInstance[dbKey].close();
        }
    }
}

async function load() {
    for (let i in config.db.mongodb) {
        connectAsync({ connString: config.db.mongodb[i].url })
        .then((db) => {
            dbInstance[config.db.mongodb[i].database] = db;
            consoleLogger.info('mongo database running');
        })
        .catch(function(err) {
            throw new Error(err);
        });
    }
}

exports.connectAsync = connectAsync;
exports.getDb = getDb;
exports.getCollection = getCollection;
exports.disconnect = disconnect;
exports.load = load;