import { IEsMiddleware, EsMiddleware, IEsContext, IEsMiddlewareConstructor, createMiddleware } from '../core';
import _ from 'lodash';
import { EsMiddlewareError } from '../core/errors';
import Redis from 'ioredis';
import { configuration } from '../util/config';
import { logger } from '../util/logger';
import { getRedisClient } from '../util/redisClient';

export class EsRedisGetMiddleware extends EsMiddleware {
    static readonly isInOut = true;
    static readonly middlewareName = 'EsRedisGetMiddleware';
    static readonly meta = { middleware: EsRedisGetMiddleware.middlewareName };

    private _destProp: string;
    private _redisSourceProp: string;
    private _redis: Redis.Redis | Redis.Cluster;

    /**
     * Constrói o middleware a partir dos parâmetros
     */
    constructor(values: any, after: boolean, api:string, nextMiddleware?: IEsMiddleware) {
        super(after, api, nextMiddleware);

        this._destProp = _.get(values, 'destProp');
        this._redisSourceProp = _.get(values, 'redisSourceProp');

        if (!_.isString(this._destProp)){
            throw new EsMiddlewareError(EsRedisGetMiddleware.name, 'destProp MUST be string');
        }

        if (!_.isUndefined(this._redisSourceProp) && !_.isString(this._redisSourceProp)){
            throw new EsMiddlewareError(EsRedisGetMiddleware.name, 'redisSourceProp MUST be string');
        }

        const redisConfig = _.get(values, 'redisProperties.config');
        const isCluster = _.get(values, 'redisProperties.isCluster');
        const clusterNodes = _.get(values, 'redisProperties.clusterNodes');
        try {
            this._redis = getRedisClient(redisConfig, isCluster, clusterNodes);
        }
        catch(err) {
            throw new EsMiddlewareError(this.constructor.name, 'Error configuring Redis', err);
        }
    }

    async loadAsync() { }

    async runInternal(context: IEsContext) {
        const redisProp = _.get(context.properties, this._redisSourceProp);
        if (!_.isString(redisProp)) {
            throw new EsMiddlewareError(EsRedisGetMiddleware.name, `redisDest (prop ${this._redisSourceProp}) redisProp be string`);
        }

        // const realDest = `esgateway:runtime:apis:${configuration.env}:${context.meta.api}:store:${redisProp}`;
        const realDest = redisProp;

        const res = await this._redis.get(realDest);

        _.set(context.properties, this._destProp, res);
    }
};

export const MiddlewareCtor: IEsMiddlewareConstructor = EsRedisGetMiddleware;

export const MiddlewareSchema = {
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
        "redisProperties": {
            "type": "object"
        },
        "redisSourceProp": {
            "type": "string",
            "minLength": 1
        }
    }
};
