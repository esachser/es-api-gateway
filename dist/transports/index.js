"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadCustomTransports = exports.loadTransports = void 0;
const logger_1 = require("../util/logger");
const http_1 = require("./http");
const schedule_1 = require("./schedule");
const redissub_1 = require("./redissub");
const redisxgroupread_1 = require("./redisxgroupread");
const transports_1 = require("../core/transports");
function loadTransports() {
    transports_1.addTransport('EsHttpTransport', http_1.TransportContructor, http_1.TransportSchema);
    transports_1.addTransport('EsScheduleTransport', schedule_1.TransportContructor, schedule_1.TransportSchema);
    transports_1.addTransport('EsRedisSubTransport', redissub_1.TransportContructor, redissub_1.TransportSchema);
    transports_1.addTransport('EsRedisXgroupreadTransport', redisxgroupread_1.TransportContructor, redisxgroupread_1.TransportSchema);
}
exports.loadTransports = loadTransports;
;
function loadCustomTransports() {
    // Limpa cache dos custom
    logger_1.logger.info('Custom transports not implemented');
}
exports.loadCustomTransports = loadCustomTransports;
;
//# sourceMappingURL=index.js.map