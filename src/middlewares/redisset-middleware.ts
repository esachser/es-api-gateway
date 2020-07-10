import { IEsMiddleware, EsMiddleware, IEsContext, IEsMiddlewareConstructor, createMiddleware } from '../core';
import _ from 'lodash';
import { EsMiddlewareError } from '../core/errors';
import Redis from 'ioredis';
import { configuration } from '../util/config';

export class EsRedisSetMiddleware extends EsMiddleware {
    static readonly isInOut = true;
    static readonly middlewareName = 'EsRedisSetMiddleware';
    static readonly meta = { middleware: EsRedisSetMiddleware.middlewareName };

    private _srcProp: string;
    private _ttlProp?: string;
    private _redisDestProp: string;
    private _redis: Redis.Redis;

    /**
     * Constrói o middleware a partir dos parâmetros
     */
    constructor(values: any, after: boolean, api:string, nextMiddleware?: IEsMiddleware) {
        super(after, api, nextMiddleware);

        this._srcProp = _.get(values, 'sourceProp');
        this._ttlProp = _.get(values, 'ttlProp');
        this._redisDestProp = _.get(values, 'redisDestProp');

        if (!_.isString(this._srcProp)){
            throw new EsMiddlewareError(EsRedisSetMiddleware.name, 'sourceProp MUST be string');
        }

        if (!_.isUndefined(this._ttlProp) && !_.isString(this._ttlProp)){
            throw new EsMiddlewareError(EsRedisSetMiddleware.name, 'ttlProp MUST be string');
        }

        if (!_.isUndefined(this._redisDestProp) && !_.isString(this._redisDestProp)){
            throw new EsMiddlewareError(EsRedisSetMiddleware.name, 'redisDestProp MUST be string');
        }

        this._redis = new Redis();
    }

    async loadAsync() { }

    async runInternal(context: IEsContext) {
        const prop = _.get(context.properties, this._srcProp);
        let ttl = undefined;
        if (!_.isUndefined(this._ttlProp)) {
            const ttlVal = _.get(context.properties, this._ttlProp);

            if (_.isInteger(ttlVal) && ttlVal > 0) {
                ttl = ttlVal;
            }
        }

        const redisDest = _.get(context.properties, this._redisDestProp);

        if (!_.isString(redisDest)) {
            throw new EsMiddlewareError(EsRedisSetMiddleware.name, `redisDest (prop ${this._redisDestProp}) MUST be string`);
        }

        const realDest = `esgateway:runtime:apis:${configuration.env}:${context.meta.api}:store:${redisDest}`;

        // Não vou deixar o TTL ser infinito, pode gerar problemas -- 30 dias no máximo
        ttl = ttl ?? 1000 * 60 * 60 * 24 * 30;

        await this._redis.set(realDest, prop, 'px', ttl);
    }
};

export const MiddlewareCtor: IEsMiddlewareConstructor = EsRedisSetMiddleware;

export const MiddlewareSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/EsRedisSetMiddleware",
    "title": "RedisSet Middleware",
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
        "ttlProp": {
            "type": "string",
            "minLength": 1
        },
        "redisDestProp": {
            "type": "string",
            "minLength": 1
        }
    }
};
