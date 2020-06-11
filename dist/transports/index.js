"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadCustomTransports = exports.loadTransports = void 0;
var decache_1 = __importDefault(require("decache"));
var fs_1 = __importDefault(require("fs"));
var logger_1 = require("../util/logger");
var http_1 = require("./http");
var transports_1 = require("../core/transports");
function readDirectoryProjects(dir) {
    var finfos = fs_1.default.readdirSync(dir, { withFileTypes: true });
    finfos.forEach(function (finfo) {
        if (finfo.isDirectory()) {
            logger_1.logger.info("Loading transport " + finfo.name);
        }
    });
}
function loadTransports() {
    transports_1.addTransport('EsHttpTransport', http_1.TransportContructor, http_1.TransportSchema);
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
//# sourceMappingURL=index.js.map