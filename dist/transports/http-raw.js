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
const http_server_raw_1 = require("../util/http-server-raw");
const lodash_1 = __importDefault(require("lodash"));
const logger_1 = require("../util/logger");
const nanoid_1 = require("nanoid");
const errors_1 = require("../core/errors");
const middlewares_1 = require("../core/middlewares");
const url_1 = __importDefault(require("url"));
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
                const httpRouter = http_server_raw_1.getHttpRouter(this.tid);
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
                            const method = methodInfo.method.toString().toUpperCase();
                            this._routes.push({ method, path: totalPath });
                            httpRouter.on(method, totalPath, (request, reply, parms) => __awaiter(this, void 0, void 0, function* () {
                                var _a, _b;
                                // Prepara a chamada
                                const api = this.api;
                                const urlParsed = url_1.default.parse((_a = request.url) !== null && _a !== void 0 ? _a : '', true);
                                let allPath = (_b = urlParsed.path) !== null && _b !== void 0 ? _b : '';
                                if (!allPath.endsWith('/')) {
                                    allPath += '/';
                                }
                                const context = {
                                    properties: {
                                        request: {
                                            headers: request.headers,
                                            params: parms,
                                            query: urlParsed.query,
                                            path: allPath.substr(routeContextSize),
                                            method: request.method,
                                            routePrefix: this.routeContext
                                        },
                                        httpctx: {
                                            req: request
                                        }
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
                                    const headers = Object.assign(Object.assign({}, lodash_1.default.get(context.properties, 'response.headers', {})), { host: 'es-api-gateway 0.1.0' });
                                    const statusCode = lodash_1.default.get(context.properties, 'response.status');
                                    const body = lodash_1.default.get(context.properties, 'response.body');
                                    if (lodash_1.default.isPlainObject(body)) {
                                        if (!Boolean(headers['content-type'])) {
                                            headers['content-type'] = 'application/json; charset=utf-8';
                                        }
                                        const bodySent = Buffer.from(JSON.stringify(body), 'utf8');
                                        if (!Boolean(headers['transfer-encoding'] === 'chunked')) {
                                            headers['content-length'] = bodySent.length;
                                        }
                                        reply.writeHead(lodash_1.default.isNumber(statusCode) ? statusCode : 404, headers);
                                        reply.end(bodySent);
                                    }
                                    else {
                                        const bodySent = lodash_1.default.isString(body) ? Buffer.from(body, 'utf8') : body;
                                        if (!Boolean(headers['transfer-encoding'] === 'chunked')) {
                                            headers['content-length'] = bodySent.length;
                                        }
                                        reply.writeHead(lodash_1.default.isNumber(statusCode) ? statusCode : 404, headers);
                                        reply.end(bodySent);
                                    }
                                }
                                catch (err) {
                                    const headers = Object.assign(Object.assign({}, lodash_1.default.get(context.properties, 'response.headers', {})), { host: 'es-api-gateway 0.1.0', 'content-type': 'application/json; charset=utf-8' });
                                    delete headers['content-encoding'];
                                    if (err instanceof errors_1.EsError && err.statusCode < 500) {
                                        reply.writeHead(err.statusCode, headers);
                                        reply.end(JSON.stringify({
                                            error: err.error,
                                            error_description: err.errorDescription
                                        }));
                                    }
                                    else {
                                        const nerr = err instanceof errors_1.EsError ?
                                            new errors_1.EsTransportError(EsHttpTransport.name, 'Error running middlewares', err) :
                                            new errors_1.EsTransportError(EsHttpTransport.name, 'Error running middlewares', { message: err.message });
                                        reply.writeHead(nerr.statusCode, headers);
                                        reply.end(JSON.stringify({
                                            error: nerr.error,
                                            error_description: nerr.errorDescription
                                        }));
                                        err = nerr;
                                    }
                                    context.logger.error('Error running middlewares', lodash_1.default.merge({}, err, context.meta));
                                }
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
            const httpRouter = http_server_raw_1.getHttpRouter(this.tid);
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
//# sourceMappingURL=http-raw.js.map