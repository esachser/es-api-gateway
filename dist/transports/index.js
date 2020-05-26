"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransportConstructor = exports.loadCustomTransports = exports.loadTransports = void 0;
var decache_1 = __importDefault(require("decache"));
var fs_1 = __importDefault(require("fs"));
var logger_1 = require("../util/logger");
var http_1 = require("./http");
var transports = {};
function readDirectoryProjects(dir) {
    var finfos = fs_1.default.readdirSync(dir, { withFileTypes: true });
    finfos.forEach(function (finfo) {
        if (finfo.isDirectory()) {
            logger_1.logger.info("Loading transport " + finfo.name);
        }
    });
}
function loadTransports() {
    logger_1.logger.info('Loading Http Tranport');
    transports['http'] = http_1.EsHttpTransportContructor;
}
exports.loadTransports = loadTransports;
;
function loadCustomTransports() {
    // Limpa cache dos custom
    logger_1.logger.info('Removing all transports');
    Object.keys(require.cache).filter(function (s) { return s.startsWith('./custom/transports/'); }).forEach(function (k) {
        logger_1.logger.info("Removing cache entry " + k);
        decache_1.default(k);
    });
}
exports.loadCustomTransports = loadCustomTransports;
;
function getTransportConstructor(name) {
    return transports[name];
}
exports.getTransportConstructor = getTransportConstructor;
//# sourceMappingURL=index.js.map