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
const http_server_restify_1 = require("../util/http-server-restify");
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
            this._routeNames = [];
            // Verifica padrões
            this.apiLogger = apiLogger;
            this.api = api;
            this.tid = tid;
            const httpRouter = http_server_restify_1.getHttpRouter(tid);
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
                const httpRouter = http_server_restify_1.getHttpRouter(this.tid);
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
                            const middleware = middlewares_1.connectMiddlewares(this.initMiddleware, pathMethodMid, this.middleware);
                            const rname = httpRouter.router.mount({
                                method: methodInfo.method.toUpperCase(),
                                path: totalPath
                            }, [(req, res, next) => __awaiter(this, void 0, void 0, function* () {
                                    // Executa middleware central, correspondente a:
                                    // pathMids ==> transportMids ==> executionMids
                                    //      <========    ||    <==========||
                                    // Prepara a chamada
                                    let allPath = req.path();
                                    if (!allPath.endsWith('/')) {
                                        allPath += '/';
                                    }
                                    const context = {
                                        properties: {
                                            request: {
                                                headers: req.headers,
                                                params: req.params,
                                                query: req.query,
                                                path: allPath.substr(routeContextSize),
                                                method: req.method,
                                                routePrefix: this.routeContext
                                            },
                                            httpctx: {
                                                req
                                            }
                                        },
                                        body: req.body,
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
                                        res.set(lodash_1.default.get(context.properties, 'response.headers', {}));
                                        res.set('host', 'es-api-gateway 0.1.0');
                                        const statusCode = lodash_1.default.get(context.properties, 'response.status');
                                        const body = lodash_1.default.get(context.properties, 'response.body');
                                        res.status(lodash_1.default.isNumber(statusCode) ? statusCode : 404);
                                        res.send(body);
                                    }
                                    catch (err) {
                                        res.set(lodash_1.default.get(context.properties, 'response.headers', {}));
                                        res.removeHeader('content-encoding');
                                        res.set('host', 'es-api-gateway 0.1.0');
                                        if (err instanceof errors_1.EsError && err.statusCode < 500) {
                                            res.status(err.statusCode);
                                            res.send({
                                                error: err.error,
                                                error_description: err.errorDescription
                                            });
                                        }
                                        else {
                                            const nerr = err instanceof errors_1.EsError ?
                                                new errors_1.EsTransportError(EsHttpTransport.name, 'Error running middlewares', err) :
                                                new errors_1.EsTransportError(EsHttpTransport.name, 'Error running middlewares', { message: err.message });
                                            res.status(nerr.statusCode);
                                            res.send({
                                                error: nerr.error,
                                                error_description: nerr.errorDescription
                                            });
                                            err = nerr;
                                        }
                                        context.logger.error('Error running middlewares', lodash_1.default.merge({}, err, context.meta));
                                    }
                                })]);
                            this._routeNames.push(rname.name);
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
            const httpRouter = http_server_restify_1.getHttpRouter(this.tid);
            if (httpRouter === undefined) {
                return;
            }
            //httpRouter.stack = httpRouter.stack.filter(l => !l.path.startsWith(this.routeContext));
            for (const rname of this._routeNames) {
                httpRouter.rm(rname);
            }
            const basePaths = EsHttpTransport.baseRoutesUsed.get(this.tid);
            if (basePaths !== undefined) {
                basePaths.delete(this.routeContext);
            }
            logger_1.logger.info(`Clear ${this.routeContext} executed`);
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
//# sourceMappingURL=http-restify.js.map