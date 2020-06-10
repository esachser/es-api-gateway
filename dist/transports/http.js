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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransportSchema = exports.TransportContructor = exports.EsHttpTransport = void 0;
var http_server_1 = require("../util/http-server");
var lodash_1 = __importDefault(require("lodash"));
var koa_router_1 = __importDefault(require("koa-router"));
var logger_1 = require("../util/logger");
;
var EsHttpTransport = /** @class */ (function () {
    /**
     *
     */
    function EsHttpTransport(params, middleware) {
        var _this = this;
        this.parameters = {
            'routeContext': {
                type: 'string',
                optional: false
            }
        };
        // Verifica padrões
        this.middleware = middleware;
        this.routeContext = params.routeContext;
        this.router = new koa_router_1.default();
        if (!this.routeContext.endsWith('/')) {
            this.routeContext += '/';
        }
        var routeContextSize = this.routeContext.length - 1;
        http_server_1.httpRouter.use(this.routeContext, function (ctx, next) { return __awaiter(_this, void 0, void 0, function () {
            var allPath, context, init, statusCode, diff;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        allPath = ctx.path;
                        if (!allPath.endsWith('/')) {
                            allPath += '/';
                        }
                        context = {
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
                            rawbody: ctx.request.rawBody
                        };
                        logger_1.logger.info("Started api with path " + context.properties.request.path);
                        ctx.iesContext = context;
                        init = Date.now();
                        // Roda o que precisa
                        return [4 /*yield*/, next()];
                    case 1:
                        // Roda o que precisa
                        _a.sent();
                        ctx.set(lodash_1.default.get(ctx.iesContext.properties, 'response.headers', {}));
                        statusCode = lodash_1.default.get(ctx.iesContext.properties, 'response.status');
                        ctx.status = lodash_1.default.isNumber(statusCode) ? statusCode : 404;
                        ctx.body = lodash_1.default.get(ctx.iesContext.properties, 'response.body');
                        diff = Date.now() - init;
                        logger_1.logger.debug("Call " + ctx.iesContext.properties.request.httpctx.path + " ended in " + diff + "ms");
                        return [2 /*return*/];
                }
            });
        }); });
        Object.keys(params.routes).forEach(function (path) {
            var totalPath = "" + _this.routeContext + path;
            totalPath = totalPath.replace(/\/{2,}/g, '/');
            http_server_1.httpRouter.register(totalPath, params.routes[path].map(function (t) { return t.toString(); }), function (ctx, next) { return __awaiter(_this, void 0, void 0, function () {
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: 
                        // Executa middleware central
                        return [4 /*yield*/, ((_a = this.middleware) === null || _a === void 0 ? void 0 : _a.execute(ctx.iesContext))];
                        case 1:
                            // Executa middleware central
                            _b.sent();
                            return [2 /*return*/, next()];
                    }
                });
            }); });
        });
        logger_1.logger.info("Loaded " + this.routeContext);
    }
    EsHttpTransport.prototype.clear = function () {
        var _this = this;
        http_server_1.httpRouter.stack = http_server_1.httpRouter.stack.filter(function (l) { return !l.path.startsWith(_this.routeContext); });
        logger_1.logger.info("Clear " + this.routeContext + " executed");
        logger_1.logger.debug(http_server_1.httpRouter.stack);
    };
    return EsHttpTransport;
}());
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