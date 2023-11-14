'use strict';

const joiRouter = require('koa-joi-router');
const ProjectService = require('services/projectService');
const Middleware = require('middleware/middleware');
const projectService = new ProjectService();
const middleware = new Middleware();
const joi = joiRouter.Joi;
const router = joiRouter();

router.get('/v1/workflow/download/log/:project_id', { 
    validate: {
        params: {
            project_id: joi.string().required()
        }
    }},[
    middleware.headerValidate({
        authorization: joi.string().optional(),
        customer_id: joi.string().optional()
    }),
    projectService.downloadLogAsync]);

router.get('/v1/workflow/data/log/:project_id', { 
    validate: {
        params: {
            project_id: joi.string().required()
        },
        query: joi.object({
            page: joi.number().integer().min(1).default(1).optional(),
            limit: joi.number().integer().min(1).default(20).allow('').optional(),
            name: joi.string().optional()
        })
    }},[
    middleware.headerValidate({
        authorization: joi.string().optional(),
        customer_id: joi.string().optional()
    }),
    projectService.fetchLogsAsync]);

module.exports = router;
