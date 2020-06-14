import winston from 'winston';
import path from 'path';
import Redis from 'ioredis';
import Transport from 'winston-transport';
import _ from 'lodash';
import { baseDirectory } from '.';
import { configuration } from './config';

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

const redisClientLogger = new Redis();

class RedisTransport extends Transport {

    private readonly _redisClientLogger: Redis.Redis;
    private readonly _channel: string;

    constructor(opts: { transportOpts?: Transport.TransportStreamOptions, redisOpts?: Redis.RedisOptions, channel: string }) {
        super(opts.transportOpts);
        this._redisClientLogger = new Redis(opts.redisOpts);
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
        this._redisClientLogger.quit();
    }
}

export function createLogger(level: string, api: string) {
    return winston.createLogger({
        level,
        format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
        defaultMeta: { service: 'es-apigw', api },
        transports: [
            new winston.transports.File({ filename: path.resolve(baseDirectory, 'logs', 'apis', configuration.env, `${api}.log`), maxFiles:1, maxsize: 1024*1024 }),
            new RedisTransport({channel: `esgateway:logging:apis:${api}`})
        ],
    });
}
