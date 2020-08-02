"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadCustomTransports = exports.loadTransports = void 0;
const decache_1 = __importDefault(require("decache"));
const fs_1 = __importDefault(require("fs"));
const logger_1 = require("../util/logger");
const http_1 = require("./http");
const schedule_1 = require("./schedule");
const transports_1 = require("../core/transports");
function readDirectoryProjects(dir) {
    const finfos = fs_1.default.readdirSync(dir, { withFileTypes: true });
    finfos.forEach(finfo => {
        if (finfo.isDirectory()) {
            logger_1.logger.info(`Loading transport ${finfo.name}`);
        }
    });
}
function loadTransports() {
    transports_1.addTransport('EsHttpTransport', http_1.TransportContructor, http_1.TransportSchema);
    transports_1.addTransport('EsScheduleTransport', schedule_1.TransportContructor, schedule_1.TransportSchema);
}
exports.loadTransports = loadTransports;
;
function loadCustomTransports() {
    // Limpa cache dos custom
    logger_1.logger.info('Removing all transports');
    Object.keys(require.cache).filter(s => s.startsWith('./custom/transports/')).forEach(k => {
        logger_1.logger.info(`Removing cache entry ${k}`);
        decache_1.default(k);
    });
}
exports.loadCustomTransports = loadCustomTransports;
;
//# sourceMappingURL=index.js.map