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
exports.MiddlewareSchema = exports.MiddlewareCtor = exports.EsRedisXaddMiddleware = void 0;
const lodash_1 = __importDefault(require("lodash"));
const errors_1 = require("../core/errors");
const redisClient_1 = require("../util/redisClient");
const middlewares_1 = require("../core/middlewares");
let EsRedisXaddMiddleware = /** @class */ (() => {
    class EsRedisXaddMiddleware extends middlewares_1.EsMiddleware {
        /**
         * Constrói o middleware a partir dos parâmetros
         */
        constructor(values, after, api, nextMiddleware) {
            super(after, api, nextMiddleware);
            this._srcProp = lodash_1.default.get(values, 'sourceProp');
            this._redisStreamProp = lodash_1.default.get(values, 'redisStreamProp');
            this._waitFor = lodash_1.default.get(values, 'waitFor', true);
            if (!lodash_1.default.isString(this._srcProp)) {
                throw new errors_1.EsMiddlewareError(EsRedisXaddMiddleware.name, 'sourceProp MUST be string');
            }
            if (!lodash_1.default.isUndefined(this._redisStreamProp) && !lodash_1.default.isString(this._redisStreamProp)) {
                throw new errors_1.EsMiddlewareError(EsRedisXaddMiddleware.name, 'redisStreamProp MUST be string');
            }
            if (!lodash_1.default.isBoolean(this._waitFor)) {
                throw new errors_1.EsMiddlewareError(EsRedisXaddMiddleware.name, 'waitFor MUST be boolean');
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
                const redisStream = lodash_1.default.get(context.properties, this._redisStreamProp);
                if (!lodash_1.default.isString(redisStream)) {
                    throw new errors_1.EsMiddlewareError(EsRedisXaddMiddleware.name, `redisDest (prop ${this._redisStreamProp}) MUST be string`);
                }
                let values = ['*'];
                if (lodash_1.default.isObjectLike(prop)) {
                    values.push(...lodash_1.default.flatten(lodash_1.default.map(prop, (value, prop) => [prop, JSON.stringify(value)])));
                }
                else {
                    values.push('value', prop);
                }
                const p = this._redis.xadd(redisStream, values);
                if (this._waitFor)
                    yield p;
            });
        }
    }
    EsRedisXaddMiddleware.isInOut = true;
    EsRedisXaddMiddleware.middlewareName = 'EsRedisXaddMiddleware';
    EsRedisXaddMiddleware.meta = { middleware: EsRedisXaddMiddleware.middlewareName };
    return EsRedisXaddMiddleware;
})();
exports.EsRedisXaddMiddleware = EsRedisXaddMiddleware;
;
exports.MiddlewareCtor = EsRedisXaddMiddleware;
exports.MiddlewareSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/EsRedisXaddMiddleware",
    "title": "RedisXadd Middleware",
    "type": "object",
    "additionalProperties": false,
    "required": [
        "sourceProp",
        "redisStreamProp"
    ],
    "properties": {
        "sourceProp": {
            "type": "string",
            "minLength": 1
        },
        "redisStreamProp": {
            "type": "string",
            "minLength": 1
        },
        "redisProperties": {
            "type": "object"
        },
        "waitFor": {
            "type": "boolean",
        }
    }
};
//# sourceMappingURL=redisxadd-middleware.js.map