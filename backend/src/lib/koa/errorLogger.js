'use strict';

const errorLogger = ({config, redisDAO}) => {
    const errorTokenTimes = config.errorTokenTimes || 5;
    const errorTokenCheckTime = config.cache.ttl.miboErrorTokenCheckTime || 300;
    const cacheKey = config.cache.key.miboErrorToken || 'nuwa:v1:mibo:errorToken:';

    return async (ctx, next) => {
        await next();
        if (ctx.status >= 400) {
        } else if (ctx.status === 200) {
        }
    };
};

module.exports = errorLogger;
