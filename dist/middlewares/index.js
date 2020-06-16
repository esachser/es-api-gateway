"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadCustomMiddlewares = exports.loadMiddlewares = void 0;
const decache_1 = __importDefault(require("decache"));
const fs_1 = __importDefault(require("fs"));
const logger_1 = require("../util/logger");
const property_middleware_1 = require("./property-middleware");
const metrics_middleware_1 = require("./metrics-middleware");
const parallel_middleware_1 = require("./parallel-middleware");
const sequence_middleware_1 = require("./sequence-middleware");
const condition_middleware_1 = require("./condition-middleware");
const httprequest_middleware_1 = require("./httprequest-middleware");
const openapiverify_middleware_1 = require("./openapiverify-middleware");
const throw_middleware_1 = require("./throw-middleware");
const catch_middleware_1 = require("./catch-middleware");
const authenticate_middleware_1 = require("./authenticate-middleware");
const middlewares_1 = require("../core/middlewares");
function readDirectoryProjects(dir) {
    const finfos = fs_1.default.readdirSync(dir, { withFileTypes: true });
    finfos.forEach(finfo => {
        if (finfo.isDirectory()) {
            logger_1.logger.info(`Loading middleware ${finfo.name}`);
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
    middlewares_1.addMiddleware('EsThrowMiddleware', throw_middleware_1.MiddlewareCtor, throw_middleware_1.MiddlewareSchema);
    middlewares_1.addMiddleware('EsCatchMiddleware', catch_middleware_1.MiddlewareCtor, catch_middleware_1.MiddlewareSchema);
    middlewares_1.addMiddleware('EsAuthenticateMiddleware', authenticate_middleware_1.MiddlewareCtor, authenticate_middleware_1.MiddlewareSchema);
}
exports.loadMiddlewares = loadMiddlewares;
;
function loadCustomMiddlewares() {
    // Limpa cache dos custom
    logger_1.logger.info('Removing all custom middlewares');
    Object.keys(require.cache).filter(s => s.startsWith('./custom/middlewares/')).forEach(k => {
        logger_1.logger.info(`Removing cache entry ${k}`);
        decache_1.default(k);
    });
}
exports.loadCustomMiddlewares = loadCustomMiddlewares;
;
//# sourceMappingURL=index.js.map