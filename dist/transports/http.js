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
const http_server_1 = require("../util/http-server");
const lodash_1 = __importDefault(require("lodash"));
const koa_router_1 = __importDefault(require("koa-router"));
const logger_1 = require("../util/logger");
const nanoid_1 = require("nanoid");
;
let EsHttpTransport = /** @class */ (() => {
    class EsHttpTransport {
        /**
         *
         */
        constructor(params, api, apiLogger, middleware) {
            // Verifica padrões
            this.apiLogger = apiLogger;
            if (!params.routeContext.endsWith('/')) {
                params.routeContext += '/';
            }
            // Procura estaticamente e testa se já existe
            for (const basePath of EsHttpTransport.baseRoutesUsed) {
                if (basePath.startsWith(params.routeContext) || params.routeContext.startsWith(basePath)) {
                    throw new Error(`Base route already exists. Exists ${basePath} x ${params.routeContext} New`);
                }
            }
            this.middleware = middleware;
            this.routeContext = params.routeContext;
            this.router = new koa_router_1.default();
            const routeContextSize = this.routeContext.length - 1;
            http_server_1.httpRouter.use(this.routeContext, (ctx, next) => __awaiter(this, void 0, void 0, function* () {
                // Prepara a chamada
                let allPath = ctx.path;
                if (!allPath.endsWith('/')) {
                    allPath += '/';
                }
                const context = {
                    properties: {
                        request: {
                            httpctx: ctx,
                            headers: ctx.request.headers,
                            params: ctx.params,
                            query: ctx.query,
                            path: allPath.substr(routeContextSize),
                            method: ctx.method,
                            body: ctx.request.body,
                            rawbody: ctx.request.rawBody,
                            routePrefix: this.routeContext
                        }
                    },
                    parsedbody: ctx.request.body,
                    rawbody: ctx.request.rawBody,
                    logger: this.apiLogger,
                    meta: {
                        api,
                        transport: 'EsHttpTransport',
                        uid: nanoid_1.nanoid(12)
                    }
                };
                logger_1.logger.info(`Started api with path ${context.properties.request.path}`);
                ctx.iesContext = context;
                //logger.info(`Call ${context.properties.httpctx.path} started at ${new Date().valueOf()}`);
                let init = Date.now();
                try {
                    // Roda o que precisa
                    yield next();
                }
                catch (err) {
                    context.logger.error('Error running middlewares', lodash_1.default.merge({}, err, context.meta));
                }
                ctx.set(lodash_1.default.get(ctx.iesContext.properties, 'response.headers', {}));
                const statusCode = lodash_1.default.get(ctx.iesContext.properties, 'response.status');
                ctx.status = lodash_1.default.isNumber(statusCode) ? statusCode : 404;
                ctx.body = JSON.stringify(lodash_1.default.get(ctx.iesContext.properties, 'response.body'));
                let diff = Date.now() - init;
                logger_1.logger.debug(`Call ${ctx.iesContext.properties.request.httpctx.path} ended in ${diff}ms`);
            }));
            Object.keys(params.routes).forEach(path => {
                let totalPath = `${this.routeContext}${path}`;
                totalPath = totalPath.replace(/\/{2,}/g, '/');
                http_server_1.httpRouter.register(totalPath, params.routes[path].map(t => t.toString()), (ctx, next) => __awaiter(this, void 0, void 0, function* () {
                    var _a;
                    // Executa middleware central
                    yield ((_a = this.middleware) === null || _a === void 0 ? void 0 : _a.execute(ctx.iesContext));
                    return next();
                }));
            });
            EsHttpTransport.baseRoutesUsed.add(params.routeContext);
            logger_1.logger.info(`Loaded ${this.routeContext}`);
        }
        loadAsync() {
            return __awaiter(this, void 0, void 0, function* () { });
        }
        clear() {
            http_server_1.httpRouter.stack = http_server_1.httpRouter.stack.filter(l => !l.path.startsWith(this.routeContext));
            EsHttpTransport.baseRoutesUsed.delete(this.routeContext);
            logger_1.logger.info(`Clear ${this.routeContext} executed`);
            logger_1.logger.debug(http_server_1.httpRouter.stack);
        }
    }
    EsHttpTransport.baseRoutesUsed = new Set();
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
                        "type": "string",
                        "enum": ["GET", "POST", "PATCH", "PUT", "DELETE"]
                    }
                }
            }
        },
        "routeContext": {
            "type": "string"
        }
    }
};
//# sourceMappingURL=http.js.map