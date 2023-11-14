'use strict';

const os = require('os');

class baseHelper {
    getLocalIpAddress() {
        let netInterfaces = os.networkInterfaces();
        let lookupIpAddress = null;
        const excludeIpList = ['127.0.0.1', ':::1', '0.0.0.0'];

        for (let ipConfig in netInterfaces) {
            if ({}.hasOwnProperty.call(netInterfaces, ipConfig)) {
                netInterfaces[ipConfig].forEach((details) => {
                    if (details.family === 'IPv4' &&
                        excludeIpList.indexOf(details.address) < 0) {
                        lookupIpAddress = details.address;
                    }
                });
            }
        }

        return lookupIpAddress;
    }
}

module.exports = baseHelper;
