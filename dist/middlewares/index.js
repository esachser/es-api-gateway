"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMiddlewareConstructor = exports.loadCustomMiddlewares = exports.loadMiddlewares = void 0;
var decache_1 = __importDefault(require("decache"));
var fs_1 = __importDefault(require("fs"));
var logger_1 = require("../util/logger");
var property_middleware_1 = require("./property-middleware");
var mids = {};
function readDirectoryProjects(dir) {
    var finfos = fs_1.default.readdirSync(dir, { withFileTypes: true });
    finfos.forEach(function (finfo) {
        if (finfo.isDirectory()) {
            logger_1.logger.info("Loading middleware " + finfo.name);
        }
    });
}
function loadMiddlewares() {
    //readDirectoryProjects(path.resolve(baseDirectory, 'middlewares'));
    logger_1.logger.info('Loading Property Middleware');
    mids['EsPropertyMiddleware'] = property_middleware_1.EsPropertyMiddlewareContructor;
}
exports.loadMiddlewares = loadMiddlewares;
;
function loadCustomMiddlewares() {
    // Limpa cache dos custom
    logger_1.logger.info('Removing all ');
    Object.keys(require.cache).filter(function (s) { return s.startsWith('./custom/middlewares/'); }).forEach(function (k) {
        logger_1.logger.info("Removing cache entry " + k);
        decache_1.default(k);
    });
}
exports.loadCustomMiddlewares = loadCustomMiddlewares;
;
function getMiddlewareConstructor(name) {
    return mids[name];
}
exports.getMiddlewareConstructor = getMiddlewareConstructor;
//# sourceMappingURL=index.js.map