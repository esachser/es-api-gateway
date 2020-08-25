import _ from 'lodash';
import { EsMiddlewareError } from '../core/errors';
import Redis from 'ioredis';
import { getRedisClient } from '../util/redisClient';
import { EsMiddleware, IEsMiddleware, IEsMiddlewareConstructor } from '../core/middlewares';
import { IEsContext } from '../core';


export class EsRedisXaddMiddleware extends EsMiddleware {
    static readonly isInOut = true;
    static readonly middlewareName = 'EsRedisXaddMiddleware';
    static readonly meta = { middleware: EsRedisXaddMiddleware.middlewareName };

    private _srcProp: string;
    private _redisStreamProp: string;
    private _waitFor: boolean;
    private _redis: Redis.Redis | Redis.Cluster;

    /**
     * Constrói o middleware a partir dos parâmetros
     */
    constructor(values: any, after: boolean, api:string, nextMiddleware?: IEsMiddleware) {
        super(after, api, nextMiddleware);

        this._srcProp = _.get(values, 'sourceProp');
        this._redisStreamProp = _.get(values, 'redisStreamProp');
        this._waitFor = _.get(values, 'waitFor', true);

        if (!_.isString(this._srcProp)){
            throw new EsMiddlewareError(EsRedisXaddMiddleware.name, 'sourceProp MUST be string');
        }

        if (!_.isUndefined(this._redisStreamProp) && !_.isString(this._redisStreamProp)){
            throw new EsMiddlewareError(EsRedisXaddMiddleware.name, 'redisStreamProp MUST be string');
        }

        if (!_.isBoolean(this._waitFor)){
            throw new EsMiddlewareError(EsRedisXaddMiddleware.name, 'waitFor MUST be boolean');
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

        const redisStream = _.get(context.properties, this._redisStreamProp);
        if (!_.isString(redisStream)) {
            throw new EsMiddlewareError(EsRedisXaddMiddleware.name, `redisDest (prop ${this._redisStreamProp}) MUST be string`);
        }

        let values = ['*'];
        if (_.isObjectLike(prop)) {
            values.push(..._.flatten(_.map(prop, (value, prop) => [prop, JSON.stringify(value)])));
        }
        else {
            values.push('value', prop);
        }

        const p = this._redis.xadd(redisStream, values);

        if (this._waitFor) await p;
    }
};

export const MiddlewareCtor: IEsMiddlewareConstructor = EsRedisXaddMiddleware;

export const MiddlewareSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/EsRedisXaddMiddleware",
    "title": "RedisXadd Middleware",
    "type": "object",
    "additionalProperties": false,
    "required": [
        "sourceProp",
        "redisStreamProp"
    ],
    "properties": {
        "sourceProp": {
            "type": "string",
            "minLength": 1
        },
        "redisStreamProp": {
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
