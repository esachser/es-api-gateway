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
exports.MiddlewareSchema = exports.MiddlewareCtor = exports.EsHttpRequestMiddleware = void 0;
const lodash_1 = __importDefault(require("lodash"));
const logger_1 = require("../util/logger");
const got_1 = __importDefault(require("got"));
const keyv_1 = __importDefault(require("keyv"));
const nanoid_1 = require("nanoid");
let EsHttpRequestMiddleware = /** @class */ (() => {
    class EsHttpRequestMiddleware {
        /**
         * Constrói o middleware a partir dos parâmetros
         */
        constructor(values, nextMiddleware) {
            // Verifica values contra o esquema.
            this.values = values;
            this.next = nextMiddleware;
            const cacheEnabled = Boolean(lodash_1.default.get(values, 'cache.enabled'));
            if (cacheEnabled) {
                const cacheMaxAge = lodash_1.default.get(values, 'cache.maxAge', 1000);
                const cacheMaxSize = lodash_1.default.get(values, 'cache.maxSize', 100);
                this.cache = new keyv_1.default('redis://localhost:6379', {
                    maxSize: cacheMaxSize,
                    ttl: cacheMaxAge,
                    namespace: `gotcache:${nanoid_1.nanoid(12)}`
                });
            }
            this.got = got_1.default.extend({
                throwHttpErrors: false,
                cache: this.cache
            });
        }
        runInternal(context) {
            return __awaiter(this, void 0, void 0, function* () {
                const method = lodash_1.default.get(context.properties, lodash_1.default.get(this.values, 'method', 'request.method'));
                let path = lodash_1.default.get(context.properties, lodash_1.default.get(this.values, 'url', 'request.path'), '');
                const body = lodash_1.default.get(context.properties, lodash_1.default.get(this.values, 'body', 'request.rawbody'));
                const headers = lodash_1.default.get(context.properties, lodash_1.default.get(this.values, 'headers', 'request.headers'));
                const query = lodash_1.default.get(context.properties, lodash_1.default.get(this.values, 'query', 'request.query'), {});
                const prefixUrl = lodash_1.default.get(context.properties, lodash_1.default.get(this.values, 'prefixUrl'), '');
                // Leitura de opcionais
                const encoding = lodash_1.default.get(context.properties, lodash_1.default.get(this.values, 'encoding'), undefined);
                const timeout = lodash_1.default.get(context.properties, lodash_1.default.get(this.values, 'timeout'), 10000);
                const retry = lodash_1.default.get(context.properties, lodash_1.default.get(this.values, 'retry'), undefined);
                const followRedirect = lodash_1.default.get(context.properties, lodash_1.default.get(this.values, 'followRedirect'), false);
                const maxRedirects = lodash_1.default.get(context.properties, lodash_1.default.get(this.values, 'maxRedirects'), 5);
                if (path.startsWith('/')) {
                    path = path.substr(1);
                }
                try {
                    const res = yield this.got(path, {
                        prefixUrl,
                        method,
                        body,
                        headers,
                        searchParams: query,
                        encoding,
                        timeout,
                        retry,
                        followRedirect,
                        maxRedirects
                    });
                    lodash_1.default.set(context.properties, 'response.headers', (res === null || res === void 0 ? void 0 : res.headers) || {});
                    lodash_1.default.set(context.properties, 'response.status', (res === null || res === void 0 ? void 0 : res.statusCode) || 500);
                    lodash_1.default.set(context.properties, 'response.body', res === null || res === void 0 ? void 0 : res.body);
                }
                catch (err) {
                    logger_1.logger.error('Error calling HTTP endpoint', err);
                }
            });
        }
        execute(context) {
            var _a, _b;
            return __awaiter(this, void 0, void 0, function* () {
                const rAfter = Boolean(this.values['after']);
                if (rAfter) {
                    yield ((_a = this.next) === null || _a === void 0 ? void 0 : _a.execute(context));
                    yield this.runInternal(context);
                }
                else {
                    yield this.runInternal(context);
                    yield ((_b = this.next) === null || _b === void 0 ? void 0 : _b.execute(context));
                }
            });
        }
    }
    EsHttpRequestMiddleware.isInOut = true;
    return EsHttpRequestMiddleware;
})();
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
        "after": {
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