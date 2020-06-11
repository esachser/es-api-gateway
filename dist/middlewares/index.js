"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadCustomMiddlewares = exports.loadMiddlewares = void 0;
var decache_1 = __importDefault(require("decache"));
var fs_1 = __importDefault(require("fs"));
var logger_1 = require("../util/logger");
var property_middleware_1 = require("./property-middleware");
var metrics_middleware_1 = require("./metrics-middleware");
var parallel_middleware_1 = require("./parallel-middleware");
var sequence_middleware_1 = require("./sequence-middleware");
var condition_middleware_1 = require("./condition-middleware");
var httprequest_middleware_1 = require("./httprequest-middleware");
var openapiverify_middleware_1 = require("./openapiverify-middleware");
var middlewares_1 = require("../core/middlewares");
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
    middlewares_1.addMiddleware('EsPropertyMiddleware', property_middleware_1.MiddlewareCtor, property_middleware_1.MiddlewareSchema);
    middlewares_1.addMiddleware('EsMetricsMiddleware', metrics_middleware_1.MiddlewareCtor, metrics_middleware_1.MiddlewareSchema);
    middlewares_1.addMiddleware('EsParallelMiddleware', parallel_middleware_1.MiddlewareCtor, parallel_middleware_1.MiddlewareSchema);
    middlewares_1.addMiddleware('EsSequenceMiddleware', sequence_middleware_1.MiddlewareCtor, sequence_middleware_1.MiddlewareSchema);
    middlewares_1.addMiddleware('EsConditionMiddleware', condition_middleware_1.MiddlewareCtor, condition_middleware_1.MiddlewareSchema);
    middlewares_1.addMiddleware('EsHttpRequestMiddleware', httprequest_middleware_1.MiddlewareCtor, httprequest_middleware_1.MiddlewareSchema);
    middlewares_1.addMiddleware('EsOpenApiVerifyMiddleware', openapiverify_middleware_1.MiddlewareCtor, openapiverify_middleware_1.MiddlewareSchema);
}
exports.loadMiddlewares = loadMiddlewares;
;
function loadCustomMiddlewares() {
    // Limpa cache dos custom
    logger_1.logger.info('Removing all custom middlewares');
    Object.keys(require.cache).filter(function (s) { return s.startsWith('./custom/middlewares/'); }).forEach(function (k) {
        logger_1.logger.info("Removing cache entry " + k);
        decache_1.default(k);
    });
}
exports.loadCustomMiddlewares = loadCustomMiddlewares;
;
//# sourceMappingURL=index.js.map