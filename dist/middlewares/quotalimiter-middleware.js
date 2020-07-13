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
            this._quotaId = lodash_1.default.get(values, 'quotaId');
            if (!lodash_1.default.isString(this._quotaId)) {
                throw new errors_1.EsMiddlewareError(EsQuotaLimiterMiddleware.name, 'quotaId MUST be string');
            }
            this._quotaTypeProp = lodash_1.default.get(values, 'quotaTypeProp');
            if (!lodash_1.default.isString(this._quotaTypeProp)) {
                throw new errors_1.EsMiddlewareError(EsQuotaLimiterMiddleware.name, 'quotaTypeProp MUST be string');
            }
            this._quotaProp = lodash_1.default.get(values, 'quotaProp');
            if (!lodash_1.default.isString(this._quotaProp)) {
                throw new errors_1.EsMiddlewareError(EsQuotaLimiterMiddleware.name, 'quotaProp MUST be integer greater than 0');
            }
            this._redis = new ioredis_1.default();
            this._redisKey = `esgateway:runtime:apis:${config_1.configuration.env}:${api}:quotas:${this._quotaId}`;
            // this._redisKey = `esgateway:runtime:apis:${configuration.env}:${api}:quotas:${this._quotaType}:${this._quotaId}`;
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
                let quotaType = lodash_1.default.get(context.properties, this._quotaTypeProp);
                if (!lodash_1.default.isString(quotaType)) {
                    throw new errors_1.EsMiddlewareError(EsQuotaLimiterMiddleware.name, 'quotaType MUST be string');
                }
                quotaType = lodash_1.default.toUpper(quotaType);
                const quotaTypeId = EsQuotaLimiterMiddleware.QUOTA_TYPES.indexOf(quotaType);
                if (quotaTypeId < 0) {
                    throw new errors_1.EsMiddlewareError(EsQuotaLimiterMiddleware.name, 'quotaType INVALID');
                }
                const quotaValue = lodash_1.default.get(context.properties, this._quotaProp);
                if (!lodash_1.default.isInteger(quotaValue) || quotaValue <= 0) {
                    throw new errors_1.EsMiddlewareError(EsQuotaLimiterMiddleware.name, 'quota MUST be integer greater than 0');
                }
                const now = new Date(Date.now());
                // Calcula chave a partir da data
                const dtExp = EsQuotaLimiterMiddleware.QUOTA_FUNCTIONS[quotaTypeId](now);
                const rKey = `${this._redisKey}:${key}`;
                const res = yield this._redis.multi().incr(rKey).expireat(rKey, dtExp.valueOf() / 1000).exec();
                const q = res[0];
                if (q[0] !== null) {
                    throw new errors_1.EsMiddlewareError(EsQuotaLimiterMiddleware.name, 'Error running middleware', q[0]);
                }
                else if (q[1] > quotaValue) {
                    yield this._redis.set(rKey, quotaValue);
                    throw new errors_1.EsMiddlewareError(EsQuotaLimiterMiddleware.name, `Maximum quota reached`, undefined, `Quota: ${quotaValue} per ${quotaType}`, 429);
                }
            });
        }
    }
    EsQuotaLimiterMiddleware.isInOut = true;
    EsQuotaLimiterMiddleware.middlewareName = 'EsQuotaLimiterMiddleware';
    EsQuotaLimiterMiddleware.meta = { middleware: EsQuotaLimiterMiddleware.middlewareName };
    EsQuotaLimiterMiddleware.QUOTA_TYPES = ['DAY', 'WEEK', 'MONTH', 'YEAR'];
    EsQuotaLimiterMiddleware.QUOTA_VALIDITIES = [24 * 60 * 60, 7 * 24 * 60 * 60, 31 * 24 * 60 * 60, 366 * 24 * 60 * 60];
    EsQuotaLimiterMiddleware.QUOTA_FUNCTIONS = [
        (dt) => {
            return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() + 1);
        },
        (dt) => {
            return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() + 7 - dt.getDay());
        },
        (dt) => {
            return new Date(dt.getFullYear(), dt.getMonth() + 1, dt.getDate());
        },
        (dt) => {
            return new Date(dt.getFullYear() + 1, dt.getMonth(), dt.getDate());
        }
    ];
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
        "quotaId",
        "quotaTypeProp",
        "quotaProp",
        "sourceProp"
    ],
    "properties": {
        "sourceProp": {
            "type": "string",
            "minLength": 1
        },
        "quotaProp": {
            "type": "string",
            "minLength": 1
        },
        "quotaTypeProp": {
            "type": "string",
            "minLength": 1
        },
        "quotaId": {
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