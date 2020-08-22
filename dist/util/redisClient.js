"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRedisClient = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const logger_1 = require("./logger");
function getRedisClient(opts = {}, isCluster = false, clusterNodes = []) {
    const client = isCluster ?
        new ioredis_1.default.Cluster(clusterNodes, Object.assign(Object.assign({}, opts), { lazyConnect: true })) :
        new ioredis_1.default(Object.assign(Object.assign({}, opts), { lazyConnect: true }));
    client.on('error', err => {
        logger_1.logger.error('Error on Redis client', err);
    });
    return client;
}
exports.getRedisClient = getRedisClient;
//# sourceMappingURL=redisClient.js.map