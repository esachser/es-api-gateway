"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLogger = exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
const winston_transport_1 = __importDefault(require("winston-transport"));
const lodash_1 = __importDefault(require("lodash"));
const _1 = require(".");
const config_1 = require("./config");
const redisClient_1 = require("./redisClient");
exports.logger = winston_1.default.createLogger({
    level: 'info',
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json()),
    defaultMeta: { service: 'es-apigw' },
    transports: [
        new winston_1.default.transports.File({ filename: path_1.default.resolve(_1.baseDirectory, 'logs', 'error.log'), level: 'error' }),
        new winston_1.default.transports.File({ filename: path_1.default.resolve(_1.baseDirectory, 'logs', 'combined.log') }),
        new winston_1.default.transports.Console()
    ],
    exceptionHandlers: [
        new winston_1.default.transports.File({ filename: path_1.default.resolve(_1.baseDirectory, 'logs', 'exceptions.log') })
    ]
});
class RedisTransport extends winston_transport_1.default {
    constructor(opts) {
        var _a;
        super(opts.transportOpts);
        this._redisClientLogger = redisClient_1.getRedisClient(Object.assign(Object.assign({}, opts.redisOpts), { retryStrategy: function (times) {
                const delay = Math.min(times * 50, 2000);
                return delay;
            } }), opts.isCluster, (_a = opts.clusterNodes) !== null && _a !== void 0 ? _a : []);
        this._channel = opts.channel;
    }
    log(info, callback) {
        try {
            this._redisClientLogger.publish(this._channel, JSON.stringify(info), () => {
                callback();
                this.emit('logged', info);
            });
        }
        catch (err) {
            exports.logger.error('Error sending log to Redis', lodash_1.default.merge({ channel: this._channel }, err));
        }
    }
    close() {
        this._redisClientLogger.disconnect();
    }
}
function createLogger(level, api) {
    let trps = [new winston_1.default.transports.File({ filename: path_1.default.resolve(_1.baseDirectory, 'logs', 'apis', config_1.configuration.env, `${api}.log`), maxFiles: 1, maxsize: 1024 * 1024 })];
    const redisEnabled = lodash_1.default.get(config_1.configuration, 'redisLogger.enabled', false);
    if (redisEnabled) {
        const redisConfig = lodash_1.default.get(config_1.configuration, 'redisLogger.config', {});
        const isCluster = lodash_1.default.get(config_1.configuration, 'redisLogger.isCluster');
        const clusterNodes = lodash_1.default.get(config_1.configuration, 'redisLogger.clusterNodes');
        trps.push(new RedisTransport({ channel: `esgateway:logging:apis:${config_1.configuration.env}:${api}`, redisOpts: redisConfig, isCluster, clusterNodes }));
    }
    return winston_1.default.createLogger({
        level,
        format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json()),
        defaultMeta: { service: 'es-apigw', api },
        transports: trps,
    });
}
exports.createLogger = createLogger;
//# sourceMappingURL=logger.js.map