"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransportSchema = exports.TransportContructor = exports.EsHttpTransport = void 0;
const http_server_koa_1 = require("../util/http-server-koa");
const lodash_1 = __importDefault(require("lodash"));
const logger_1 = require("../util/logger");
const nanoid_1 = require("nanoid");
const errors_1 = require("../core/errors");
const middlewares_1 = require("../core/middlewares");
;
let EsHttpTransport = /** @class */ (() => {
    class EsHttpTransport {
        /**
         *
         */
        constructor(params, api, tid, apiLogger, middleware, initMiddleware) {
            // Verifica padrões
            this.apiLogger = apiLogger;
            this.api = api;
            this.tid = tid;
            const httpRouter = http_server_koa_1.getHttpRouter(tid);
            if (httpRouter === undefined) {
                throw new errors_1.EsTransportError(EsHttpTransport.name, 'HttpRouter is undefined');
            }
            if (!params.routeContext.endsWith('/')) {
                params.routeContext += '/';
            }
            // Procura estaticamente e testa se já existe
            const basePaths = EsHttpTransport.baseRoutesUsed.get(this.tid);
            if (basePaths !== undefined) {
                for (const basePath of basePaths) {
                    if (basePath.startsWith(params.routeContext) || params.routeContext.startsWith(basePath)) {
                        throw new Error(`Base route already exists. Exists ${basePath} x ${params.routeContext} New`);
                    }
                }
                basePaths.add(params.routeContext);
            }
            else {
                EsHttpTransport.baseRoutesUsed.set(this.tid, new Set([params.routeContext]));
            }
            this.middleware = middleware;
            this.initMiddleware = initMiddleware;
            this.routeContext = params.routeContext;
        }
        loadAsync(params) {
            return __awaiter(this, void 0, void 0, function* () {
                const httpRouter = http_server_koa_1.getHttpRouter(this.tid);
                if (httpRouter === undefined) {
                    throw new errors_1.EsTransportError(EsHttpTransport.name, 'HttpRouter is undefined');
                }
                const routeContextSize = this.routeContext.length - 1;
                try {
                    for (const path in params.routes) {
                        let totalPath = `${this.routeContext}${path}`;
                        totalPath = totalPath.replace(/\/{2,}/g, '/');
                        for (const methodInfo of params.routes[path]) {
                            const pathMethodMid = yield middlewares_1.createMiddleware(methodInfo.mids, 0, this.api);
                            const init = middlewares_1.copyMiddleware(this.initMiddleware);
                            const mid = middlewares_1.copyMiddleware(this.middleware);
                            const middleware = middlewares_1.connectMiddlewares(init, pathMethodMid, mid);
                            httpRouter.register(totalPath, [methodInfo.method.toString()], (ctx) => __awaiter(this, void 0, void 0, function* () {
                                // Executa middleware central, correspondente a:
                                // pathMids ==> transportMids ==> executionMids
                                //      <========    ||    <==========||
                                // Prepara a chamada
                                let allPath = ctx.path;
                                if (!allPath.endsWith('/')) {
                                    allPath += '/';
                                }
                                const context = {
                                    properties: {
                                        request: {
                                            headers: ctx.request.headers,
                                            params: ctx.params,
                                            query: ctx.query,
                                            path: allPath.substr(routeContextSize),
                                            method: ctx.method,
                                            routePrefix: this.routeContext
                                        },
                                        httpctx: ctx
                                    },
                                    body: ctx.request.body,
                                    logger: this.apiLogger,
                                    meta: {
                                        api: this.api,
                                        transport: 'EsHttpTransport',
                                        uid: nanoid_1.nanoid(12)
                                    }
                                };
                                try {
                                    yield (middleware === null || middleware === void 0 ? void 0 : middleware.execute(context));
                                    //return next();
                                    ctx.set(lodash_1.default.get(context.properties, 'response.headers', {}));
                                    const statusCode = lodash_1.default.get(context.properties, 'response.status');
                                    const body = lodash_1.default.get(context.properties, 'response.body');
                                    ctx.body = body;
                                    ctx.status = lodash_1.default.isNumber(statusCode) ? statusCode : 404;
                                }
                                catch (err) {
                                    ctx.set(lodash_1.default.get(context.properties, 'response.headers', {}));
                                    ctx.remove('content-encoding');
                                    if (err instanceof errors_1.EsError && err.statusCode < 500) {
                                        ctx.body = {
                                            error: err.error,
                                            error_description: err.errorDescription
                                        };
                                        ctx.status = err.statusCode;
                                    }
                                    else {
                                        const nerr = err instanceof errors_1.EsError ?
                                            new errors_1.EsTransportError(EsHttpTransport.name, 'Error running middlewares', err) :
                                            new errors_1.EsTransportError(EsHttpTransport.name, 'Error running middlewares', { message: err.message });
                                        ctx.body = {
                                            error: nerr.error,
                                            error_description: nerr.errorDescription
                                        };
                                        ctx.status = nerr.statusCode;
                                        err = nerr;
                                    }
                                    context.logger.error('Error running middlewares', lodash_1.default.merge({}, err, context.meta));
                                }
                                ctx.set('server', 'es-api-gateway 0.1.0');
                            }));
                        }
                    }
                }
                catch (err) {
                    this.clear();
                    throw new errors_1.EsTransportError(EsHttpTransport.name, `Error loading transport HTTP for ${this.routeContext}`, err);
                }
                logger_1.logger.info(`Loaded ${this.routeContext}`);
            });
        }
        clear() {
            const httpRouter = http_server_koa_1.getHttpRouter(this.tid);
            if (httpRouter === undefined) {
                return;
            }
            httpRouter.stack = httpRouter.stack.filter(l => !l.path.startsWith(this.routeContext));
            const basePaths = EsHttpTransport.baseRoutesUsed.get(this.tid);
            if (basePaths !== undefined) {
                basePaths.delete(this.routeContext);
            }
            logger_1.logger.info(`Clear ${this.routeContext} executed`);
            logger_1.logger.debug(httpRouter.stack);
        }
    }
    EsHttpTransport.baseRoutesUsed = new Map();
    return EsHttpTransport;
})();
exports.EsHttpTransport = EsHttpTransport;
exports.TransportContructor = EsHttpTransport;
exports.TransportSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/EsHttpTransport",
    "title": "Http Transport parameters",
    "type": "object",
    "additionalProperties": false,
    "required": [
        "routeContext",
        "routes"
    ],
    "properties": {
        "routes": {
            "type": "object",
            "additionalProperties": false,
            "patternProperties": {
                ".*": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "method": {
                                "type": "string",
                                "enum": ["GET", "POST", "PATCH", "PUT", "DELETE"]
                            },
                            "mids": {
                                "type": "array",
                                "items": {
                                    "$ref": "es-middleware"
                                }
                            }
                        }
                    }
                }
            }
        },
        "routeContext": {
            "type": "string"
        }
    }
};
//# sourceMappingURL=http-koa.js.map