'use strict';

const joiRouter = require('koa-joi-router');
const RobotService = require('services/robotService');
const Middleware = require('middleware/middleware');
const robotService = new RobotService();
const middleware = new Middleware();
const joi = joiRouter.Joi;
const router = joiRouter();

router.post('/v1/workflow/project/:project_id/collection/variable', [
    middleware.bodyValidate({
        sn: joi.string().required(),
        sessionId: joi.string().required(),
        variables: joi.array().required().items(
            joi.object({
                varName: joi.string().required(),
                value: joi.alternatives().try([joi.string().allow(''), joi.number()]).required()
            })
        )
    }),
    robotService.postRobotDataAsync]);

router.get('/v1/workflow/project/:project_id/variable_name/:name', {
    validate: {
        params: {
            project_id: joi.string().regex(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/).required(),
            name: joi.string().required()
        }
    }},[
    robotService.findRemoteVariableAsync])

module.exports = router;
