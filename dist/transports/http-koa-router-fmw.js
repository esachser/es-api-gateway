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
const http_server_koa_router_fmw_1 = require("../util/http-server-koa-router-fmw");
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
            this._routes = [];
            // Verifica padrões
            this.apiLogger = apiLogger;
            this.api = api;
            this.tid = tid;
            const httpRouter = http_server_koa_router_fmw_1.getHttpRouter(tid);
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
                const httpRouter = http_server_koa_router_fmw_1.getHttpRouter(this.tid);
                if (httpRouter === undefined) {
                    throw new errors_1.EsTransportError(EsHttpTransport.name, 'HttpRouter is undefined');
                }
                try {
                    const api = this.api;
                    const routeContextSize = this.routeContext.length - 1;
                    for (const path in params.routes) {
                        let totalPath = `${this.routeContext}${path}`;
                        totalPath = totalPath.replace(/\/{2,}/g, '/');
                        const methods = [];
                        for (const methodInfo of params.routes[path]) {
                            const pathMethodMid = yield middlewares_1.createMiddleware(methodInfo.mids, 0, this.api);
                            const middleware = middlewares_1.connectMiddlewares(this.initMiddleware, pathMethodMid, this.middleware);
                            const method = methodInfo.method.toString().toUpperCase();
                            methods.push(method);
                            this._routes.push({ method, path: totalPath });
                            httpRouter.on(method, totalPath, (ctx, next) => __awaiter(this, void 0, void 0, function* () {
                                // Executa middleware central, correspondente a:
                                // pathMids ==> transportMids ==> executionMids
                                //      <========    ||    <==========||
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
                                        api,
                                        transport: 'EsHttpTransport',
                                        uid: nanoid_1.nanoid(12)
                                    }
                                };
                                //logger.info(`Started api with path ${context.properties.request.path}`);
                                ctx.iesContext = context;
                                //logger.info(`Call ${context.properties.httpctx.path} started at ${new Date().valueOf()}`);
                                let init = process.hrtime();
                                try {
                                    // Roda o que precisa
                                    yield (middleware === null || middleware === void 0 ? void 0 : middleware.execute(ctx.iesContext));
                                    yield next();
                                    ctx.set(lodash_1.default.get(ctx.iesContext.properties, 'response.headers', {}));
                                    const statusCode = lodash_1.default.get(ctx.iesContext.properties, 'response.status');
                                    ctx.status = lodash_1.default.isNumber(statusCode) ? statusCode : 404;
                                    const body = lodash_1.default.get(ctx.iesContext.properties, 'response.body');
                                    ctx.body = body;
                                }
                                catch (err) {
                                    ctx.set(lodash_1.default.get(ctx.iesContext.properties, 'response.headers', {}));
                                    ctx.set('host', 'es-api-gateway 0.1.0');
                                    ctx.remove('content-encoding');
                                    if (err instanceof errors_1.EsError && err.statusCode < 500) {
                                        ctx.status = err.statusCode;
                                        ctx.body = {
                                            error: err.error,
                                            error_description: err.errorDescription
                                        };
                                    }
                                    else {
                                        const nerr = err instanceof errors_1.EsError ?
                                            new errors_1.EsTransportError(EsHttpTransport.name, 'Error running middlewares', err) :
                                            new errors_1.EsTransportError(EsHttpTransport.name, 'Error running middlewares', { message: err.message });
                                        ctx.status = nerr.statusCode;
                                        ctx.body = {
                                            error: nerr.error,
                                            error_description: nerr.errorDescription
                                        };
                                        err = nerr;
                                    }
                                    context.logger.error('Error running middlewares', lodash_1.default.merge({}, err, context.meta));
                                }
                            }));
                        }
                        // httpRouter.all(totalPath, async (ctx, next) => {
                        //     ctx.body = {
                        //         error: 'Method not allowed'
                        //     };
                        //     ctx.status = 405;
                        // });
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
            const httpRouter = http_server_koa_router_fmw_1.getHttpRouter(this.tid);
            if (httpRouter === undefined) {
                return;
            }
            //httpRouter.stack = httpRouter.stack.filter(l => !l.path.startsWith(this.routeContext));
            for (const r of this._routes) {
                httpRouter.off(r.method, r.path);
            }
            this._routes = [];
            const basePaths = EsHttpTransport.baseRoutesUsed.get(this.tid);
            if (basePaths !== undefined) {
                basePaths.delete(this.routeContext);
            }
            logger_1.logger.info(`Clear ${this.routeContext} executed`);
            logger_1.logger.debug(httpRouter.prettyPrint());
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
                "^\\/([a-z0-9\\-._~%!$&'()*+,;=:@/]*)$": {
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
//# sourceMappingURL=http-koa-router-fmw.js.map