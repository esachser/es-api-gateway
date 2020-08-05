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
exports.TransportSchema = exports.TransportContructor = exports.EsRedisSubTransport = void 0;
const core_1 = require("../core");
const lodash_1 = __importDefault(require("lodash"));
const logger_1 = require("../util/logger");
const nanoid_1 = require("nanoid");
const errors_1 = require("../core/errors");
const ioredis_1 = __importDefault(require("ioredis"));
class EsRedisSubTransport {
    /**
     *
     */
    constructor(params, api, tid, apiLogger, middleware, initMiddleware) {
        // Verifica padrões
        this.apiLogger = apiLogger;
        this.api = api;
        this.tid = tid;
        this.middleware = core_1.connectMiddlewares(initMiddleware, middleware);
        this._redis = new ioredis_1.default();
        this._subStr = lodash_1.default.get(params, 'subscribe');
    }
    loadAsync(params) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this._redis.psubscribe(this._subStr);
                this._redis.on('pmessage', (pattern, channel, message) => __awaiter(this, void 0, void 0, function* () {
                    var _a;
                    try {
                        logger_1.logger.info(`Starting subscribed (${channel}) for ${this.api}`);
                        let init = process.hrtime();
                        const context = {
                            properties: {
                                message
                            },
                            logger: this.apiLogger,
                            meta: {
                                api: this.api,
                                transport: EsRedisSubTransport.name,
                                uid: nanoid_1.nanoid(12)
                            }
                        };
                        yield ((_a = this.middleware) === null || _a === void 0 ? void 0 : _a.execute(context));
                        const diffs = process.hrtime(init);
                        const diff = diffs[0] * 1000 + diffs[1] / 1000000;
                        logger_1.logger.info(`Ending subscribed (${channel}) for ${this.api} in ${diff}ms`);
                    }
                    catch (err) {
                        this.apiLogger.error('Error running middlewares', err);
                    }
                }));
                logger_1.logger.info(`Loaded Subscribe Transport ${this.api} - ${this.tid}`);
            }
            catch (err) {
                throw new errors_1.EsTransportError(EsRedisSubTransport.name, 'Error subscribing', err);
            }
        });
    }
    clear() {
        this._redis.punsubscribe(this._subStr);
    }
}
exports.EsRedisSubTransport = EsRedisSubTransport;
exports.TransportContructor = EsRedisSubTransport;
exports.TransportSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/EsRedisSubTransport",
    "title": "RedisSub Transport parameters",
    "type": "object",
    "additionalProperties": false,
    "required": [
        "subscribe"
    ],
    "properties": {
        "subscribe": {
            "type": "array",
            "items": {
                "type": "string"
            }
        }
    }
};
//# sourceMappingURL=redissub.js.map