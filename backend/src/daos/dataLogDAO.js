'use strict';

const mongodbHelper = require('helpers/mongoDbConnectionHelper.js');
const config = require('configs/config');

class dao {

    constructor() {
        this.col = config.db.mongodb.workflow.col.log;
        this.db = config.db.mongodb.workflow.database;
    }

    async getLogListAsync(filter, option, field) {
        if (field === undefined) {
            field = {};
        }
        let list = [];
        let cursor = await mongodbHelper
            .getCollection(this.col, this.db)
            .find(filter.query)
            .project(field)
            .skip(filter.start)
            .limit(filter.size)
            .sort(option)

        while (await cursor.hasNext()) {
            let log = await cursor.next();
            list.push(log);
        }
        return list;
    }

    async getLogsAsync(filter) {
        let list = [];
        let processed = 0;
        let updated = 0;

        while(true) {
            const cursor = await mongodbHelper
                .getCollection(this.col, this.db)
                .find(filter)
                .sort({ _id: 1 })
                .skip(processed);

            try {
                while (await cursor.hasNext()) {
                    const doc = await cursor.next();

                    let elem = {
                        variables: doc.variables,
                        project_id: doc.project_id,
                        created_at: doc.created_at
                    };
                    // elem[doc.varName] = doc.value
                    list.push(elem);

                    ++processed;

                    if (doc.stream && doc.roundedDate && !doc.sid) {
                        await mongodbHelper.getCollection(this.col, this.db).update({
                            _id: doc._id
                        }, { $set: {
                            sid: `${ doc.stream.valueOf() }-${ doc.roundedDate }`
                        }});

                        ++updated;
                    }
                }

                break;
            } catch (err) {
                if (err.code !== 43) {
                    throw err;
                }
            }
        }
        return list;
    }

    async getLogCountAsync(query) {
        return await mongodbHelper
            .getCollection(this.col, this.db)
            .aggregate(query)
            .toArray()
            .then(async data => {
                return data && data[0] ? data[0].count : 0;
            });
    }

    async getLogAaggregateAsync(query) {
        return await mongodbHelper
            .getCollection(this.col, this.db)
            .aggregate(query)
            .toArray()
            .then(async data => {
                return data;
            });
    }

    async getLogByIdAsync(filter) {
        return await mongodbHelper
            .getCollection(this.col, this.db)
            .findOne(filter);
    }

    async addLogsAsync(content) {
        return await mongodbHelper
            .getCollection(this.col, this.db)
            .insertMany(content);
    }

    async deleteLogAsync(filter) {
        return await mongodbHelper
            .getCollection(this.col, this.db)
            .deleteMany(filter)
            .then(data => {
                return data;
            });
    }
}

module.exports = dao;
