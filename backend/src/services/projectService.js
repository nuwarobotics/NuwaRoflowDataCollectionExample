'use strict';

const { systemErrorHandle } = require('lib/errorHandle');
const Utils = require('lib/utils');
const utils = new Utils();
const { Parser } = require('json2csv');

const DataLogDAO = require('daos/dataLogDAO');
const dataLogDAO = new DataLogDAO();

class projectService {

    _paging = (page, limit) => {
        page = parseInt(page);
        limit = parseInt(limit);
        limit = (limit > 100) ? 100 : limit;
        const start = (page - 1) * limit;

        let result = {
            page: page,
            limit: limit,
            start: start
        };
        return result;
    }

    fetchLogsAsync = async(ctx) => {
        const query = ctx.request.query;
        const page = parseInt(query.page);
        const limit = parseInt(query.limit);
        const keyword = query.name;
        const params = ctx.request.params;
        const projectId = params.project_id;

        try {
            let search = {
                project_id: projectId
            };
            if (keyword) {
                search['variables.varName'] = {
                    $regex: `.*${keyword}.*`, $options: 'i'
                };
            }
            const paging = this._paging(page, limit);
            const field = {
                project_id: false
            };
            const filter = {
                query: search,
                start: paging.start,
                size: paging.limit
            };
            const options = {
                updated_at: -1
            };

            const element = await dataLogDAO.getLogListAsync(filter, options, field);
            const countFilter = [
                { $match: search },
                { $group: { _id: null, count: { $sum: 1 } } }
            ];
            const totalCount = await dataLogDAO.getLogCountAsync(countFilter);
            const response = {
                query: {
                    found: element.length,
                    currentPage: paging.page,
                    totalPages: Math.ceil(totalCount/paging.limit),
                    limit: paging.limit,
                    total: totalCount
                },
                payload: element
            };
            ctx.body = utils.successFormat(response);
        } catch(err) {
            await systemErrorHandle(err, ctx);
        }
    }

    _getVariableNameAggr = (projectId) => {
        const aggr = [
            {
                $match: {
                    project_id: projectId
                }
            },
            { 
                $unwind: { 
                    path: "$variables",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group:{
                    "_id": null,
                    array:{
                            $addToSet: "$variables.varName"
                        }
                    }
            },
            {
                $project: {
                    _id: false,
                    "array": "$array"
                }
            }
        ];
        return aggr;
    }

    _timestampToDate = (timestamp) => {
        let dateFormat = new Date(timestamp * 1000);
        return dateFormat.getDate() +
           "/" + (dateFormat.getMonth()+1) +
           "/" + dateFormat.getFullYear() +
           " " + dateFormat.getHours() +
           ":" + dateFormat.getMinutes() +
           ":" + dateFormat.getSeconds();
    }

    downloadLogAsync = async(ctx) => {
        const params = ctx.request.params;
        const projectId = params.project_id;

        try {
            let logs = [];
            let fields = [];
            const aggr = this._getVariableNameAggr(projectId);
            let varNames = await dataLogDAO.getLogAaggregateAsync(aggr);
            const dataFilter = {
                project_id: projectId
            };
            let data = await dataLogDAO.getLogsAsync(dataFilter);
            if (varNames.length > 0 && varNames[0].array.length > 0) {
                fields = varNames[0].array;
                fields.push('sn', 'created_at');
                for (let i=0; i< data.length; i++) {
                    let object = {};
                    for (let j=0; j<data[i].variables.length; j++) {
                        if (varNames[0].array.includes(data[i].variables[j].varName)) {
                            object[data[i].variables[j].varName] = data[i].variables[j].value;
                        }
                    }
                    let keys = Object.keys(object);
                    let differ = fields.filter(x => !keys.includes(x));
                    for (let i=0; i< differ.length; i++) {
                        object[differ] = '';
                    }
                    object.sn = data[i].project_id;
                    object.created_at = this._timestampToDate(data[i].created_at);
                    logs.push(object); 
                }
            }

            const json2csvParser = new Parser({ fields });
            const csv = json2csvParser.parse(logs);
            const result = 'donwload.csv';
            ctx.set('Content-disposition', `attachment; filename=${result}`);
            ctx.statusCode = 200;
            ctx.body = csv;
            return;
            return;
        } catch(err) {
            await systemErrorHandle(err, ctx);
        }
    }    
}

module.exports = projectService;
