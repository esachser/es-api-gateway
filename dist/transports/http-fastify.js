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
const http_server_fastify_1 = require("../util/http-server-fastify");
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
                const httpRouter = http_server_fastify_1.getHttpRouter(this.tid);
                if (httpRouter === undefined) {
                    throw new errors_1.EsTransportError(EsHttpTransport.name, 'HttpRouter is undefined');
                }
                // if (httpRouter.server.listening) {
                //     await httpRouter.close();
                // }
                const routeContextSize = this.routeContext.length - 1;
                try {
                    for (const path in params.routes) {
                        let totalPath = `${this.routeContext}${path}`;
                        totalPath = totalPath.replace(/\/{2,}/g, '/');
                        for (const methodInfo of params.routes[path]) {
                            const pathMethodMid = yield middlewares_1.createMiddleware(methodInfo.mids, 0, this.api);
                            const middleware = middlewares_1.connectMiddlewares(this.initMiddleware, pathMethodMid, this.middleware);
                            // httpRouter.register(totalPath, [methodInfo.method.toString()], async (ctx, next) => {
                            //     // Executa middleware central, correspondente a:
                            //     // pathMids ==> transportMids ==> executionMids
                            //     //      <========    ||    <==========||
                            //     await middleware?.execute(ctx.iesContext);
                            //     return next();
                            // });
                            httpRouter.route({
                                method: methodInfo.method.toString().toUpperCase(),
                                url: totalPath,
                                handler: (request, reply) => __awaiter(this, void 0, void 0, function* () {
                                    // Prepara a chamada
                                    const api = this.api;
                                    let allPath = request.url;
                                    if (!allPath.endsWith('/')) {
                                        allPath += '/';
                                    }
                                    const context = {
                                        properties: {
                                            request: {
                                                headers: request.headers,
                                                params: request.params,
                                                query: request.query,
                                                path: allPath.substr(routeContextSize),
                                                method: request.method,
                                                routePrefix: this.routeContext
                                            },
                                            httpctx: request
                                        },
                                        body: '',
                                        logger: this.apiLogger,
                                        meta: {
                                            api,
                                            transport: 'EsHttpTransport',
                                            uid: nanoid_1.nanoid(12)
                                        }
                                    };
                                    try {
                                        // Roda o que precisa
                                        yield (middleware === null || middleware === void 0 ? void 0 : middleware.execute(context));
                                        reply.headers(lodash_1.default.get(context.properties, 'response.headers', {}));
                                        const statusCode = lodash_1.default.get(context.properties, 'response.status');
                                        reply.status(lodash_1.default.isNumber(statusCode) ? statusCode : 404);
                                        const body = lodash_1.default.get(context.properties, 'response.body');
                                        reply.send(body);
                                    }
                                    catch (err) {
                                        reply.headers(lodash_1.default.get(context.properties, 'response.headers', {}));
                                        reply.header('host', 'es-api-gateway 0.1.0');
                                        reply.removeHeader('content-encoding');
                                        if (err instanceof errors_1.EsError && err.statusCode < 500) {
                                            reply.status(err.statusCode);
                                            reply.send({
                                                error: err.error,
                                                error_description: err.errorDescription
                                            });
                                        }
                                        else {
                                            const nerr = err instanceof errors_1.EsError ?
                                                new errors_1.EsTransportError(EsHttpTransport.name, 'Error running middlewares', err) :
                                                new errors_1.EsTransportError(EsHttpTransport.name, 'Error running middlewares', { message: err.message });
                                            reply.status(nerr.statusCode);
                                            reply.send({
                                                error: nerr.error,
                                                error_description: nerr.errorDescription
                                            });
                                            err = nerr;
                                        }
                                        context.logger.error('Error running middlewares', lodash_1.default.merge({}, err, context.meta));
                                    }
                                })
                            });
                        }
                    }
                    //await runServers();
                }
                catch (err) {
                    this.clear();
                    throw new errors_1.EsTransportError(EsHttpTransport.name, `Error loading transport HTTP for ${this.routeContext}`, err);
                }
                logger_1.logger.info(`Loaded ${this.routeContext}`);
            });
        }
        clear() {
            // const httpRouter = getHttpRouter(this.tid);
            // if (httpRouter === undefined) {
            //     return;
            // }
            // httpRouter.stack = httpRouter.stack.filter(l => !l.path.startsWith(this.routeContext));
            // const basePaths = EsHttpTransport.baseRoutesUsed.get(this.tid);
            // if (basePaths !== undefined) {
            //     basePaths.delete(this.routeContext);
            // }
            // logger.info(`Clear ${this.routeContext} executed`);
            // logger.debug(httpRouter.stack);
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
//# sourceMappingURL=http-fastify.js.map