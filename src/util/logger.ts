import winston from 'winston';
import path from 'path';
import Redis from 'ioredis';
import Transport from 'winston-transport';
import _ from 'lodash';
import { baseDirectory } from '.';
import { configuration } from './config';
import { getRedisClient } from './redisClient';

export const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    defaultMeta: { service: 'es-apigw' },
    transports: [
        new winston.transports.File({ filename: path.resolve(baseDirectory, 'logs', 'error.log'), level: 'error' }),
        new winston.transports.File({ filename: path.resolve(baseDirectory, 'logs', 'combined.log') }),
        new winston.transports.Console()
    ],
    exceptionHandlers: [
        new winston.transports.File({ filename: path.resolve(baseDirectory, 'logs', 'exceptions.log') })
    ]
});

class RedisTransport extends Transport {

    private readonly _redisClientLogger: Redis.Redis | Redis.Cluster;
    private readonly _channel: string;

    constructor(opts: { transportOpts?: Transport.TransportStreamOptions, redisOpts?: Redis.RedisOptions, channel: string, isCluster?: boolean, clusterNodes?: Array<string> }) {
        super(opts.transportOpts);
        this._redisClientLogger = getRedisClient({
            ...opts.redisOpts,
            retryStrategy: function(times) {
                const delay = Math.min(times * 50, 2000);
                return delay;
            }
        }, opts.isCluster, opts.clusterNodes ?? []);

        this._channel = opts.channel;
    }

    log(info:any, callback: () => void) {
        try {
            this._redisClientLogger.publish(this._channel, JSON.stringify(info), () => {
                callback();
                this.emit('logged', info);
            });
        }
        catch (err) {
            logger.error('Error sending log to Redis', _.merge({ channel: this._channel }, err));
        }
    }

    close() {
        this._redisClientLogger.disconnect();
    }
}

export function createLogger(level: string, api: string) {
    let trps: winston.transport[] = [new winston.transports.File({ filename: path.resolve(baseDirectory, 'logs', 'apis', configuration.env, `${api}.log`), maxFiles:1, maxsize: 1024*1024 })];
    const redisEnabled = _.get(configuration, 'redisLogger.enabled', false);
    if (redisEnabled) {
        const redisConfig = _.get(configuration, 'redisLogger.config', {});
        const isCluster = _.get(configuration, 'redisLogger.isCluster');
        const clusterNodes = _.get(configuration, 'redisLogger.clusterNodes');
        trps.push(new RedisTransport({channel: `esgateway:logging:apis:${configuration.env}:${api}`, redisOpts: redisConfig, isCluster, clusterNodes}));
    }
    return winston.createLogger({
        level,
        format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
        defaultMeta: { service: 'es-apigw', api },
        transports: trps,
    });
}
