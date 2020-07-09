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
exports.MiddlewareSchema = exports.MiddlewareCtor = exports.EsRedisGetMiddleware = void 0;
const core_1 = require("../core");
const lodash_1 = __importDefault(require("lodash"));
const errors_1 = require("../core/errors");
const ioredis_1 = __importDefault(require("ioredis"));
const config_1 = require("../util/config");
let EsRedisGetMiddleware = /** @class */ (() => {
    class EsRedisGetMiddleware extends core_1.EsMiddleware {
        /**
         * Constrói o middleware a partir dos parâmetros
         */
        constructor(values, after, nextMiddleware) {
            super(after, nextMiddleware);
            this._destProp = lodash_1.default.get(values, 'destProp');
            this._redisSourceProp = lodash_1.default.get(values, 'redisSourceProp');
            if (!lodash_1.default.isString(this._destProp)) {
                throw new errors_1.EsMiddlewareError(EsRedisGetMiddleware.name, 'destProp MUST be string');
            }
            if (!lodash_1.default.isUndefined(this._redisSourceProp) && !lodash_1.default.isString(this._redisSourceProp)) {
                throw new errors_1.EsMiddlewareError(EsRedisGetMiddleware.name, 'redisSourceProp MUST be string');
            }
            this._redis = new ioredis_1.default();
        }
        loadAsync() {
            return __awaiter(this, void 0, void 0, function* () { });
        }
        runInternal(context) {
            return __awaiter(this, void 0, void 0, function* () {
                const redisProp = lodash_1.default.get(context.properties, this._redisSourceProp);
                if (!lodash_1.default.isString(redisProp)) {
                    throw new errors_1.EsMiddlewareError(EsRedisGetMiddleware.name, `redisDest (prop ${this._redisSourceProp}) redisProp be string`);
                }
                const realDest = `esgateway:runtime:apis:${config_1.configuration.env}:${context.meta.api}:store:${redisProp}`;
                const res = yield this._redis.get(realDest);
                lodash_1.default.set(context.properties, this._destProp, res);
            });
        }
    }
    EsRedisGetMiddleware.isInOut = true;
    EsRedisGetMiddleware.middlewareName = 'EsRedisGetMiddleware';
    EsRedisGetMiddleware.meta = { middleware: EsRedisGetMiddleware.middlewareName };
    return EsRedisGetMiddleware;
})();
exports.EsRedisGetMiddleware = EsRedisGetMiddleware;
;
exports.MiddlewareCtor = EsRedisGetMiddleware;
exports.MiddlewareSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/EsRedisGetMiddleware",
    "title": "RedisGet Middleware",
    "type": "object",
    "additionalProperties": false,
    "required": [
        "destProp",
        "redisSourceProp"
    ],
    "properties": {
        "destProp": {
            "type": "string",
            "minLength": 1
        },
        "redisSourceProp": {
            "type": "string",
            "minLength": 1
        }
    }
};
//# sourceMappingURL=redisget-middleware.js.map