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
exports.MiddlewareSchema = exports.MiddlewareCtor = exports.EsRedisSetMiddleware = void 0;
const lodash_1 = __importDefault(require("lodash"));
const errors_1 = require("../core/errors");
const redisClient_1 = require("../util/redisClient");
const middlewares_1 = require("../core/middlewares");
let EsRedisSetMiddleware = /** @class */ (() => {
    class EsRedisSetMiddleware extends middlewares_1.EsMiddleware {
        /**
         * Constrói o middleware a partir dos parâmetros
         */
        constructor(values, after, api, nextMiddleware) {
            super(after, api, nextMiddleware);
            this._srcProp = lodash_1.default.get(values, 'sourceProp');
            this._ttlProp = lodash_1.default.get(values, 'ttlProp');
            this._redisDestProp = lodash_1.default.get(values, 'redisDestProp');
            if (!lodash_1.default.isString(this._srcProp)) {
                throw new errors_1.EsMiddlewareError(EsRedisSetMiddleware.name, 'sourceProp MUST be string');
            }
            if (!lodash_1.default.isUndefined(this._ttlProp) && !lodash_1.default.isString(this._ttlProp)) {
                throw new errors_1.EsMiddlewareError(EsRedisSetMiddleware.name, 'ttlProp MUST be string');
            }
            if (!lodash_1.default.isUndefined(this._redisDestProp) && !lodash_1.default.isString(this._redisDestProp)) {
                throw new errors_1.EsMiddlewareError(EsRedisSetMiddleware.name, 'redisDestProp MUST be string');
            }
            const redisConfig = lodash_1.default.get(values, 'redisProperties.config');
            const isCluster = lodash_1.default.get(values, 'redisProperties.isCluster');
            const clusterNodes = lodash_1.default.get(values, 'redisProperties.clusterNodes');
            try {
                this._redis = redisClient_1.getRedisClient(redisConfig, isCluster, clusterNodes);
            }
            catch (err) {
                throw new errors_1.EsMiddlewareError(this.constructor.name, 'Error configuring Redis', err);
            }
        }
        loadAsync() {
            return __awaiter(this, void 0, void 0, function* () { });
        }
        runInternal(context) {
            return __awaiter(this, void 0, void 0, function* () {
                const prop = lodash_1.default.get(context.properties, this._srcProp);
                let ttl = undefined;
                if (!lodash_1.default.isUndefined(this._ttlProp)) {
                    const ttlVal = lodash_1.default.get(context.properties, this._ttlProp);
                    if (lodash_1.default.isInteger(ttlVal) && ttlVal > 0) {
                        ttl = ttlVal;
                    }
                }
                const redisDest = lodash_1.default.get(context.properties, this._redisDestProp);
                if (!lodash_1.default.isString(redisDest)) {
                    throw new errors_1.EsMiddlewareError(EsRedisSetMiddleware.name, `redisDest (prop ${this._redisDestProp}) MUST be string`);
                }
                // const realDest = `esgateway:runtime:apis:${configuration.env}:${context.meta.api}:store:${redisDest}`;
                const realDest = redisDest;
                // Não vou deixar o TTL ser infinito, pode gerar problemas -- 30 dias no máximo
                ttl = ttl !== null && ttl !== void 0 ? ttl : 1000 * 60 * 60 * 24 * 30;
                yield this._redis.set(realDest, prop, 'px', ttl);
            });
        }
    }
    EsRedisSetMiddleware.isInOut = true;
    EsRedisSetMiddleware.middlewareName = 'EsRedisSetMiddleware';
    EsRedisSetMiddleware.meta = { middleware: EsRedisSetMiddleware.middlewareName };
    return EsRedisSetMiddleware;
})();
exports.EsRedisSetMiddleware = EsRedisSetMiddleware;
;
exports.MiddlewareCtor = EsRedisSetMiddleware;
exports.MiddlewareSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/EsRedisSetMiddleware",
    "title": "RedisSet Middleware",
    "type": "object",
    "additionalProperties": false,
    "required": [
        "sourceProp",
        "redisDestProp"
    ],
    "properties": {
        "sourceProp": {
            "type": "string",
            "minLength": 1
        },
        "ttlProp": {
            "type": "string",
            "minLength": 1
        },
        "redisProperties": {
            "type": "object"
        },
        "redisDestProp": {
            "type": "string",
            "minLength": 1
        }
    }
};
//# sourceMappingURL=redisset-middleware.js.map