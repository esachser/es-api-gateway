import { IEsTransport, IEsMiddleware, IEsContext, IEsTranportConstructor, createMiddleware, connectMiddlewares } from '../core';
import _ from 'lodash';
import { logger } from '../util/logger';
import { Logger, http } from 'winston';
import { nanoid } from 'nanoid';
import { EsTransportError, EsError } from '../core/errors';
import Redis from 'ioredis';
import { getRedisClient } from '../util/redisClient';

export class EsRedisXgroupreadTransport implements IEsTransport {

    middleware: IEsMiddleware | undefined;

    apiLogger: Logger;

    api: string;

    tid: string;

    private _redis: Redis.Redis | Redis.Cluster;
    private _groupStr: string;
    private _streamStr: string;
    private _id: string;
    private _kill = false;

    /**
     *
     */
    constructor(params: any, api: string, tid: string, apiLogger: Logger, middleware: IEsMiddleware | undefined, initMiddleware?: IEsMiddleware) {
        // Verifica padrões
        this.apiLogger = apiLogger;
        this.api = api;
        this.tid = tid;
        this.middleware = connectMiddlewares(initMiddleware, middleware);
        this._groupStr = _.get(params, 'group');
        this._streamStr = _.get(params, 'stream');
        this._id = nanoid(12);
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
            // Cria o grupo
            const groups = await this._redis.xinfo('groups', this._streamStr);
            let createGroup = true;
            if (_.isArray(groups)) {
                createGroup = !groups.map(v => v[1]).some(v => v === this._groupStr);
            }
            else {
                createGroup = !(groups[1] === this._groupStr);
            }
            if (createGroup)
                await this._redis.xgroup('create', this._streamStr, this._groupStr, '$');
            this.run();
            logger.info(`Loaded Redis XReadGroup Transport ${this.api} - ${this.tid}`);
        }
        catch(err) {
            throw new EsTransportError(EsRedisXgroupreadTransport.name, 'Error subscribing', err);
        }
    }

    async run() {
        while(!this._kill) {
            try {
                let message = await this._redis.xreadgroup('group', this._groupStr, this._id, 'block', 0, 'count', 1, 'streams', this._streamStr, '>')
                if (message !== null) {
                    logger.info(`Starting stream read (${this._streamStr}) for group ${this._groupStr} with id ${this._id}`);
                    let init = process.hrtime();
                    const context: IEsContext = {
                        properties: {
                            message
                        },
                        logger: this.apiLogger,
                        meta: {
                            api: this.api,
                            transport: EsRedisXgroupreadTransport.name,
                            uid: nanoid(12)
                        }
                    };
                    await this.middleware?.execute(context);
                    const diffs = process.hrtime(init);
                    const diff = diffs[0] * 1000 + diffs[1] / 1000000;
                    this._redis.xack(this._streamStr, this._groupStr, message[0][1][0][0])
                        .catch(err => {
                            this.apiLogger.error('Error acking', err);
                        });
                    logger.info(`Ending stream read (${this._streamStr}) for group ${this._groupStr} with id ${this._id} in ${diff}ms`);
                }
            }
            catch(err) {
                this.apiLogger.error('Error running middlewares', err);
            }
        }
        logger.info(`Finishing stream read (${this._streamStr}) for group ${this._groupStr} with id ${this._id}`);
    }

    clear() {
        this._kill = true;
    }
}

export const TransportContructor: IEsTranportConstructor = EsRedisXgroupreadTransport;

export const TransportSchema = {
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

