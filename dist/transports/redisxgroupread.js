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
exports.TransportSchema = exports.TransportContructor = exports.EsRedisXgroupreadTransport = void 0;
const lodash_1 = __importDefault(require("lodash"));
const logger_1 = require("../util/logger");
const nanoid_1 = require("nanoid");
const errors_1 = require("../core/errors");
const redisClient_1 = require("../util/redisClient");
const middlewares_1 = require("../core/middlewares");
class EsRedisXgroupreadTransport {
    /**
     *
     */
    constructor(params, api, tid, apiLogger, middleware, initMiddleware) {
        this._kill = false;
        // Verifica padrões
        this.apiLogger = apiLogger;
        this.api = api;
        this.tid = tid;
        this.middleware = middlewares_1.connectMiddlewares(initMiddleware, middleware);
        this._groupStr = lodash_1.default.get(params, 'group');
        this._streamStr = lodash_1.default.get(params, 'stream');
        this._id = nanoid_1.nanoid(12);
        const redisConfig = lodash_1.default.get(params, 'redisProperties.config');
        const isCluster = lodash_1.default.get(params, 'redisProperties.isCluster');
        const clusterNodes = lodash_1.default.get(params, 'redisProperties.clusterNodes');
        try {
            this._redis = redisClient_1.getRedisClient(redisConfig, isCluster, clusterNodes);
        }
        catch (err) {
            throw new errors_1.EsTransportError(this.constructor.name, 'Error configuring Redis', err);
        }
    }
    loadAsync(params) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Cria o grupo
                const groups = yield this._redis.xinfo('groups', this._streamStr);
                let createGroup = true;
                if (lodash_1.default.isArray(groups)) {
                    createGroup = !groups.map(v => v[1]).some(v => v === this._groupStr);
                }
                else {
                    createGroup = !(groups[1] === this._groupStr);
                }
                if (createGroup)
                    yield this._redis.xgroup('create', this._streamStr, this._groupStr, '$');
                this.run();
                logger_1.logger.info(`Loaded Redis XReadGroup Transport ${this.api} - ${this.tid}`);
            }
            catch (err) {
                throw new errors_1.EsTransportError(EsRedisXgroupreadTransport.name, 'Error subscribing', err);
            }
        });
    }
    run() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            while (!this._kill) {
                try {
                    let message = yield this._redis.xreadgroup('group', this._groupStr, this._id, 'block', 0, 'count', 1, 'streams', this._streamStr, '>');
                    if (message !== null) {
                        logger_1.logger.info(`Starting stream read (${this._streamStr}) for group ${this._groupStr} with id ${this._id}`);
                        let init = process.hrtime();
                        const context = {
                            properties: {
                                message
                            },
                            logger: this.apiLogger,
                            meta: {
                                api: this.api,
                                transport: EsRedisXgroupreadTransport.name,
                                uid: nanoid_1.nanoid(12)
                            }
                        };
                        yield ((_a = this.middleware) === null || _a === void 0 ? void 0 : _a.execute(context));
                        const diffs = process.hrtime(init);
                        const diff = diffs[0] * 1000 + diffs[1] / 1000000;
                        this._redis.xack(this._streamStr, this._groupStr, message[0][1][0][0])
                            .catch(err => {
                            this.apiLogger.error('Error acking', err);
                        });
                        logger_1.logger.info(`Ending stream read (${this._streamStr}) for group ${this._groupStr} with id ${this._id} in ${diff}ms`);
                    }
                }
                catch (err) {
                    this.apiLogger.error('Error running middlewares', err);
                }
            }
            logger_1.logger.info(`Finishing stream read (${this._streamStr}) for group ${this._groupStr} with id ${this._id}`);
        });
    }
    clear() {
        this._kill = true;
    }
}
exports.EsRedisXgroupreadTransport = EsRedisXgroupreadTransport;
exports.TransportContructor = EsRedisXgroupreadTransport;
exports.TransportSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/EsRedisXgroupreadTransport",
    "title": "RedisXgroupread Transport parameters",
    "type": "object",
    "additionalProperties": false,
    "required": [
        "group",
        "stream"
    ],
    "properties": {
        "group": {
            "type": "string"
        },
        "redisProperties": {
            "type": "object"
        },
        "stream": {
            "type": "string"
        }
    }
};
//# sourceMappingURL=redisxgroupread.js.map