import _ from 'lodash';
import { EsMiddlewareError } from '../core/errors';
import Redis from 'ioredis';
import { getRedisClient } from '../util/redisClient';
import { EsMiddleware, IEsMiddleware, IEsMiddlewareConstructor } from '../core/middlewares';
import { IEsContext } from '../core';

export class EsRedisPublishMiddleware extends EsMiddleware {
    static readonly isInOut = true;
    static readonly middlewareName = 'EsRedisPublishMiddleware';
    static readonly meta = { middleware: EsRedisPublishMiddleware.middlewareName };

    private _srcProp: string;
    private _redisDestProp: string;
    private _waitFor: boolean;
    private _redis: Redis.Redis | Redis.Cluster;

    /**
     * Constrói o middleware a partir dos parâmetros
     */
    constructor(values: any, after: boolean, api:string, nextMiddleware?: IEsMiddleware) {
        super(after, api, nextMiddleware);

        this._srcProp = _.get(values, 'sourceProp');
        this._redisDestProp = _.get(values, 'redisDestProp');
        this._waitFor = _.get(values, 'waitFor', true);

        if (!_.isString(this._srcProp)){
            throw new EsMiddlewareError(EsRedisPublishMiddleware.name, 'sourceProp MUST be string');
        }

        if (!_.isUndefined(this._redisDestProp) && !_.isString(this._redisDestProp)){
            throw new EsMiddlewareError(EsRedisPublishMiddleware.name, 'redisDestProp MUST be string');
        }

        if (!_.isBoolean(this._waitFor)){
            throw new EsMiddlewareError(EsRedisPublishMiddleware.name, 'waitFor MUST be boolean');
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
        const prop = _.get(context.properties, this._srcProp);
        if (!_.isString(prop)) {
            throw new EsMiddlewareError(EsRedisPublishMiddleware.name, `sourceProp (prop ${this._srcProp}) MUST be string`);
        }

        const redisDest = _.get(context.properties, this._redisDestProp);
        if (!_.isString(redisDest)) {
            throw new EsMiddlewareError(EsRedisPublishMiddleware.name, `redisDest (prop ${this._redisDestProp}) MUST be string`);
        }

        const p = this._redis.publish(redisDest, prop);

        if (this._waitFor) await p;
    }
};

export const MiddlewareCtor: IEsMiddlewareConstructor = EsRedisPublishMiddleware;

export const MiddlewareSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/EsRedisPublishMiddleware",
    "title": "RedisPublish Middleware",
    "type": "object",
    "additionalProperties": false,
    "required": [
        "sourceProp",
        "redisDestProp"
    ],
    "properties": {
        "sourceProp": {
            "type": "string",
            "minLength": 1
        },
        "redisDestProp": {
            "type": "string",
            "minLength": 1
        },
        "redisProperties": {
            "type": "object"
        },
        "waitFor": {
            "type": "boolean",
        }
    }
};
