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
exports.MiddlewareSchema = exports.MiddlewareCtor = exports.EsHttpRequestMiddleware = void 0;
var lodash_1 = __importDefault(require("lodash"));
var logger_1 = require("../util/logger");
var got_1 = __importDefault(require("got"));
var keyv_1 = __importDefault(require("keyv"));
var nanoid_1 = require("nanoid");
var EsHttpRequestMiddleware = /** @class */ (function () {
    /**
     * Constrói o middleware a partir dos parâmetros
     */
    function EsHttpRequestMiddleware(values, nextMiddleware) {
        // Verifica values contra o esquema.
        this.values = values;
        this.next = nextMiddleware;
        var cacheEnabled = Boolean(lodash_1.default.get(values, 'cache.enabled'));
        if (cacheEnabled) {
            var cacheMaxAge = lodash_1.default.get(values, 'cache.maxAge', 1000);
            var cacheMaxSize = lodash_1.default.get(values, 'cache.maxSize', 100);
            this.cache = new keyv_1.default('redis://localhost:6379', {
                maxSize: cacheMaxSize,
                ttl: cacheMaxAge,
                namespace: "gotcache:" + nanoid_1.nanoid(12)
            });
        }
        this.got = got_1.default.extend({
            throwHttpErrors: false,
            cache: this.cache
        });
    }
    EsHttpRequestMiddleware.prototype.runInternal = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var method, path, body, headers, query, prefixUrl, encoding, timeout, retry, followRedirect, maxRedirects, res, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        method = lodash_1.default.get(context.properties, lodash_1.default.get(this.values, 'method', 'request.method'));
                        path = lodash_1.default.get(context.properties, lodash_1.default.get(this.values, 'url', 'request.path'), '');
                        body = lodash_1.default.get(context.properties, lodash_1.default.get(this.values, 'body', 'request.body'));
                        headers = lodash_1.default.get(context.properties, lodash_1.default.get(this.values, 'headers', 'request.headers'));
                        query = lodash_1.default.get(context.properties, lodash_1.default.get(this.values, 'query', 'request.query'), {});
                        prefixUrl = lodash_1.default.get(context.properties, lodash_1.default.get(this.values, 'prefixUrl'), '');
                        encoding = lodash_1.default.get(context.properties, lodash_1.default.get(this.values, 'encoding'), undefined);
                        timeout = lodash_1.default.get(context.properties, lodash_1.default.get(this.values, 'timeout'), 10000);
                        retry = lodash_1.default.get(context.properties, lodash_1.default.get(this.values, 'retry'), undefined);
                        followRedirect = lodash_1.default.get(context.properties, lodash_1.default.get(this.values, 'followRedirect'), false);
                        maxRedirects = lodash_1.default.get(context.properties, lodash_1.default.get(this.values, 'maxRedirects'), 5);
                        if (path.startsWith('/')) {
                            path = path.substr(1);
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.got(path, {
                                prefixUrl: prefixUrl,
                                method: method,
                                body: body,
                                headers: headers,
                                searchParams: query,
                                encoding: encoding,
                                timeout: timeout,
                                retry: retry,
                                followRedirect: followRedirect,
                                maxRedirects: maxRedirects
                            })];
                    case 2:
                        res = _a.sent();
                        lodash_1.default.set(context.properties, 'response.headers', (res === null || res === void 0 ? void 0 : res.headers) || {});
                        lodash_1.default.set(context.properties, 'response.status', (res === null || res === void 0 ? void 0 : res.statusCode) || 500);
                        lodash_1.default.set(context.properties, 'response.body', res === null || res === void 0 ? void 0 : res.body);
                        return [3 /*break*/, 4];
                    case 3:
                        err_1 = _a.sent();
                        logger_1.logger.error('Error calling HTTP endpoint', err_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    EsHttpRequestMiddleware.prototype.execute = function (context) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var rAfter;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        rAfter = Boolean(this.values['runAfter']);
                        if (!rAfter) return [3 /*break*/, 3];
                        return [4 /*yield*/, ((_a = this.next) === null || _a === void 0 ? void 0 : _a.execute(context))];
                    case 1:
                        _c.sent();
                        return [4 /*yield*/, this.runInternal(context)];
                    case 2:
                        _c.sent();
                        return [3 /*break*/, 6];
                    case 3: return [4 /*yield*/, this.runInternal(context)];
                    case 4:
                        _c.sent();
                        return [4 /*yield*/, ((_b = this.next) === null || _b === void 0 ? void 0 : _b.execute(context))];
                    case 5:
                        _c.sent();
                        _c.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    EsHttpRequestMiddleware.isInOut = true;
    return EsHttpRequestMiddleware;
}());
exports.EsHttpRequestMiddleware = EsHttpRequestMiddleware;
;
exports.MiddlewareCtor = EsHttpRequestMiddleware;
exports.MiddlewareSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/EsHttpRequestMiddleware",
    "title": "HttpRequest Middleware",
    "type": "object",
    "additionalProperties": false,
    "properties": {
        "runAfter": {
            "type": "boolean"
        },
        "url": {
            "type": "string"
        },
        "prefixUrl": {
            "type": "string"
        },
        "method": {
            "type": "string"
        },
        "query": {
            "type": "string"
        },
        "headers": {
            "type": "string"
        },
        "body": {
            "type": "string"
        },
        "encoding": {
            "type": "string"
        },
        "timeout": {
            "type": "string"
        },
        "retry": {
            "type": "string"
        },
        "followRedirect": {
            "type": "boolean"
        },
        "maxRedirects": {
            "type": "string"
        },
        "cache": {
            "type": "object",
            "additionalProperties": false,
            "required": [
                "enabled",
                "maxAge",
                "maxSize"
            ],
            "properties": {
                "maxAge": {
                    "type": "number"
                },
                "maxSize": {
                    "type": "number"
                },
                "enabled": {
                    "type": "boolean"
                }
            }
        }
    }
};
//# sourceMappingURL=httprequest-middleware.js.map