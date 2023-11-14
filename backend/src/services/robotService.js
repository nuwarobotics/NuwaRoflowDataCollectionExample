'use strict';

const { systemErrorHandle } = require('lib/errorHandle');
const Utils = require('lib/utils');
const utils = new Utils();
const message = require('lib/message');

const DataLogDAO = require('daos/dataLogDAO');
const dataLogDAO = new DataLogDAO();
const VariableDAO = require('daos/variableDAO');
const variableDAO = new VariableDAO();

class robotService {

    postRobotDataAsync = async(ctx) => {
        const now = utils.retNowTimestamp();
        const body = ctx.request.body;
        const params = ctx.request.params;
        const projectId = params.project_id;

        try {
            if (body.variables.length > 0) {  
                body.project_id = projectId;
                body.created_at = now;
                dataLogDAO.addLogsAsync([body]);
            }

            const response = {};
            ctx.body = utils.successFormat(response);
            return;
        } catch(err) {
            await systemErrorHandle(err, ctx);
        }
    }

    findRemoteVariableAsync = async(ctx) => {
        const params = ctx.request.params;
        const projectId = params.project_id;
        const variableName = params.name;

        try {
            const filter = {
                name: variableName
            };
            const variable = await variableDAO.getVariableByIdAsync(filter);
            if (!variable) {
                return utils.failureFormart(message.c30043, ctx);
            }

            if (variable.data_type === 'string' && variable.value === undefined) {
                variable.value = "";
            } else if (variable.data_type === 'number' && variable.value === undefined) {
                variable.value = 0;
            }

            const result = {
                varName: variableName,
                dataType: variable.data_type,
                funcType: variable.type,
                value: variable.value
            };
            ctx.body = utils.successFormat(result);
        } catch(err) {
            await systemErrorHandle(err, ctx);
        }
    }
}

module.exports = robotService;
