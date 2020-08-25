import _ from 'lodash';
import { logger } from '../util/logger';
import { Logger, http } from 'winston';
import { nanoid } from 'nanoid';
import { EsTransportError, EsError } from '../core/errors';
import Redis from 'ioredis';
import cluster from 'cluster';
import { getRedisClient } from '../util/redisClient';
import { IEsTransport, IEsTranportConstructor } from '../core/transports';
import { IEsMiddleware, connectMiddlewares } from '../core/middlewares';
import { IEsContext } from '../core';

let idSub: number | undefined = undefined
export function setIdSub(id: number) {
    idSub = id;
}

export class EsRedisSubTransport implements IEsTransport {

    middleware: IEsMiddleware | undefined;

    apiLogger: Logger;

    api: string;

    tid: string;

    private _redis: Redis.Redis | Redis.Cluster;
    private _subStr: string[];

    /**
     *
     */
    constructor(params: any, api: string, tid: string, apiLogger: Logger, middleware: IEsMiddleware | undefined, initMiddleware?: IEsMiddleware) {
        // Verifica padrões
        this.apiLogger = apiLogger;
        this.api = api;
        this.tid = tid;
        this.middleware = connectMiddlewares(initMiddleware, middleware);
        this._subStr = _.get(params, 'subscribe');
        const redisConfig = _.get(params, 'redisProperties.config');
        const isCluster = _.get(params, 'redisProperties.isCluster');
        const clusterNodes = _.get(params, 'redisProperties.clusterNodes');
        try {
            this._redis = getRedisClient(redisConfig, isCluster, clusterNodes);
        }
        catch(err) {
            throw new EsTransportError(this.constructor.name, 'Error configuring Redis', err);
        }
    }

    async loadAsync(params: any) {
        try {
            await this._redis.psubscribe(this._subStr);

            this._redis.on('pmessage', async (pattern, channel, message) => {
                try {
                    // Roda somente em 1 worker
                    if (idSub !== undefined && cluster.worker.id !== idSub) return;
                    
                    logger.info(`Starting subscribed (${channel}) for ${this.api}`);
                    let init = process.hrtime();
                    const context: IEsContext = {
                        properties: {
                            message
                        },
                        logger: this.apiLogger,
                        meta: {
                            api: this.api,
                            transport: EsRedisSubTransport.name,
                            uid: nanoid(12)
                        }
                    };
                    await this.middleware?.execute(context);
                    const diffs = process.hrtime(init);
                    const diff = diffs[0] * 1000 + diffs[1] / 1000000;
                    logger.info(`Ending subscribed (${channel}) for ${this.api} in ${diff}ms`);
                }
                catch(err) {
                    this.apiLogger.error('Error running middlewares', err);
                }
            });

            logger.info(`Loaded Subscribe Transport ${this.api} - ${this.tid}`);
        }
        catch(err) {
            throw new EsTransportError(EsRedisSubTransport.name, 'Error subscribing', err);
        }
    }

    clear() {
        this._redis.punsubscribe(this._subStr);
    }
}

export const TransportContructor: IEsTranportConstructor = EsRedisSubTransport;

export const TransportSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/EsRedisSubTransport",
    "title": "RedisSub Transport parameters",
    "type": "object",
    "additionalProperties": false,
    "required": [
        "subscribe"
    ],
    "properties": {
        "redisProperties": {
            "type": "object"
        },
        "subscribe": {
            "type": "array",
            "items": {
                "type": "string"
            }
        }
    }
};

