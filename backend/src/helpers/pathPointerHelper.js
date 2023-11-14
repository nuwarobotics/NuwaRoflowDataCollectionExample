'use strict';

const pathPointerHelper = function() {};

pathPointerHelper.prototype = {
    getRootPath: (isSlash, pathKey) => {
        let splitKey = pathKey || '/src';
        let slashSign = isSlash ? '/' : '';
        return __dirname.split(splitKey)[0] + slashSign;
    },

    isCwdAtRootFolder: (pathKey) => {
        let thePathKey = pathKey || '/src';
        if (process.cwd().indexOf(thePathKey) > -1) {
            return false;
        }
        return true;
    }
};

module.exports = pathPointerHelper;
