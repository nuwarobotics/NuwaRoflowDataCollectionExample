'use strict';

const mongodbHelper = require('helpers/mongoDbConnectionHelper.js');
const config = require('configs/config');

class dao {

    constructor() {
        this.col = config.db.mongodb.workflow.col.variable;
        this.db = config.db.mongodb.workflow.database;
    }

    async getVariableListAsync(filter, option, field) {
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
            let variable = await cursor.next();
            list.push(variable);
        }
        return list;
    }

    async getVariableCountAsync(query) {
        return await mongodbHelper
            .getCollection(this.col, this.db)
            .aggregate(query)
            .toArray()
            .then(async data => {
                return data && data[0] ? data[0].count : 0;
            });
    }

    async getVariableAaggregateAsync(query) {
        return await mongodbHelper
            .getCollection(this.col, this.db)
            .aggregate(query)
            .toArray()
            .then(async data => {
                return data;
            });
    }

    async getVariableAsync(filter) {
        let list = [];
        let cursor = await mongodbHelper
        .getCollection(this.col, this.db)
        .find(filter)

        while (await cursor.hasNext()) {
            let variable = await cursor.next();
            list.push(variable);
        }
        return list;
    }

    async getVariableByIdAsync(filter) {
        return await mongodbHelper
            .getCollection(this.col, this.db)
            .findOne(filter);
    }

    async addVariableAsync(content) {
        return await mongodbHelper
            .getCollection(this.col, this.db)
            .insertOne(content);
    }

    async updateVariableAsync(filter, content) {
        return await mongodbHelper
            .getCollection(this.col, this.db)
            .updateMany(filter, {
                $set: content
            });
    }

    async deleteVariableAsync(filter) {
        return await mongodbHelper
            .getCollection(this.col, this.db)
            .deleteMany(filter)
            .then(data => {
                return data;
            });
    }
}

module.exports = dao;
