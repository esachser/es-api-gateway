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
exports.MiddlewareSchema = exports.MiddlewareCtor = exports.EsQuotaLimiterMiddleware = void 0;
const core_1 = require("../core");
const lodash_1 = __importDefault(require("lodash"));
const errors_1 = require("../core/errors");
const ioredis_1 = __importDefault(require("ioredis"));
const nanoid_1 = require("nanoid");
const config_1 = require("../util/config");
let EsQuotaLimiterMiddleware = /** @class */ (() => {
    class EsQuotaLimiterMiddleware extends core_1.EsMiddleware {
        /**
         * Constrói o middleware a partir dos parâmetros
         */
        constructor(values, after, api, nextMiddleware) {
            super(after, api, nextMiddleware);
            this._destProp = lodash_1.default.get(values, 'destProp', 'ratelimitres');
            if (!lodash_1.default.isString(this._destProp)) {
                throw new errors_1.EsMiddlewareError(EsQuotaLimiterMiddleware.name, 'destProp MUST be string');
            }
            this._sourceProp = lodash_1.default.get(values, 'sourceProp');
            if (!lodash_1.default.isString(this._sourceProp)) {
                throw new errors_1.EsMiddlewareError(EsQuotaLimiterMiddleware.name, 'sourceProp MUST be string');
            }
            const quotas = lodash_1.default.get(values, 'quotas');
            if (!lodash_1.default.isArray(quotas)) {
                throw new errors_1.EsMiddlewareError(EsQuotaLimiterMiddleware.name, 'quotas MUST be an array');
            }
            this._redis = new ioredis_1.default();
            this._redisKey = `esgateway:runtime:apis:${config_1.configuration.env}:${nanoid_1.nanoid(12)}`;
        }
        loadAsync() {
            return __awaiter(this, void 0, void 0, function* () { });
        }
        runInternal(context) {
            return __awaiter(this, void 0, void 0, function* () {
                const key = lodash_1.default.get(context.properties, this._sourceProp);
                if (!lodash_1.default.isString(key) && !lodash_1.default.isNumber(key)) {
                    throw new errors_1.EsMiddlewareError(EsQuotaLimiterMiddleware.name, 'key MUST be either string or number');
                }
                try {
                    const r = yield this._rateLimiter.consume(key, 1);
                    lodash_1.default.set(context.properties, this._destProp, r);
                }
                catch (err) {
                    if (err instanceof RateLimiterRes || Object.keys(err).some(k => err[k] instanceof RateLimiterRes)) {
                        lodash_1.default.set(context.properties, this._destProp, err);
                        throw new errors_1.EsMiddlewareError(EsQuotaLimiterMiddleware.name, `Maximum quota reached`, err, `Contact administrator for more details`, 429);
                    }
                    throw new errors_1.EsMiddlewareError(EsQuotaLimiterMiddleware.name, 'Error running rateLimiter', err);
                }
            });
        }
    }
    EsQuotaLimiterMiddleware.isInOut = true;
    EsQuotaLimiterMiddleware.middlewareName = 'EsQuotaLimiterMiddleware';
    EsQuotaLimiterMiddleware.meta = { middleware: EsQuotaLimiterMiddleware.middlewareName };
    return EsQuotaLimiterMiddleware;
})();
exports.EsQuotaLimiterMiddleware = EsQuotaLimiterMiddleware;
;
exports.MiddlewareCtor = EsQuotaLimiterMiddleware;
exports.MiddlewareSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/EsQuotaLimiterMiddleware",
    "title": "QuotaLimiter Middleware",
    "type": "object",
    "additionalProperties": false,
    "required": [
        "quotas",
        "sourceProp"
    ],
    "properties": {
        "quotas": {
            "type": "array",
            "items": {
                "type": "object",
                "additionalProperties": false,
                "required": [
                    "points",
                    "duration"
                ],
                "properties": {
                    "points": {
                        "type": "integer",
                        "exclusiveMinimum": 0
                    },
                    "duration": {
                        "type": "integer",
                        "exclusiveMinimum": 0
                    }
                }
            },
            "minItems": 1
        },
        "sourceProp": {
            "type": "string",
            "minLength": 1
        },
        "destProp": {
            "type": "string",
            "minLength": 1
        }
    }
};
//# sourceMappingURL=quotalimiter-middleware.js.map