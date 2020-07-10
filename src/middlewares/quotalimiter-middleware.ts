import { IEsMiddleware, EsMiddleware, IEsContext, IEsMiddlewareConstructor, createMiddleware } from '../core';
import _ from 'lodash';
import { EsMiddlewareError } from '../core/errors';
import Redis from 'ioredis';
import { nanoid } from 'nanoid';
import { configuration } from '../util/config';

export class EsQuotaLimiterMiddleware extends EsMiddleware {
    static readonly isInOut = true;
    static readonly middlewareName = 'EsQuotaLimiterMiddleware';
    static readonly meta = { middleware: EsQuotaLimiterMiddleware.middlewareName };

    private _redis: Redis.Redis;
    private _redisKey: string;
    private _destProp: string;
    private _sourceProp: string;
    private _quotaId: string;
    private _quotaType: string;
    private _quota: number;

    /**
     * Constrói o middleware a partir dos parâmetros
     */
    constructor(values: any, after: boolean, api:string, nextMiddleware?: IEsMiddleware) {
        super(after, api, nextMiddleware);

        this._destProp = _.get(values, 'destProp', 'ratelimitres');
        if (!_.isString(this._destProp)) {
            throw new EsMiddlewareError(EsQuotaLimiterMiddleware.name, 'destProp MUST be string');
        }

        this._sourceProp = _.get(values, 'sourceProp');
        if (!_.isString(this._sourceProp)) {
            throw new EsMiddlewareError(EsQuotaLimiterMiddleware.name, 'sourceProp MUST be string');
        }

        this._quotaId = _.get(values, 'quotaId');
        if (!_.isString(this._quotaId)) {
            throw new EsMiddlewareError(EsQuotaLimiterMiddleware.name, 'quotaId MUST be string');
        }

        this._quotaType = _.get(values, 'quotaType');
        if (!_.isString(this._quotaType)) {
            throw new EsMiddlewareError(EsQuotaLimiterMiddleware.name, 'quotaType MUST be string');
        }

        this._quota = _.get(values, 'quota');
        if (!_.isInteger(this._quotaId) || this._quota > 0) {
            throw new EsMiddlewareError(EsQuotaLimiterMiddleware.name, 'quota MUST be integer greater than 0');
        }

        this._redis = new Redis();
        this._redisKey = `esgateway:runtime:apis:${configuration.env}:${api}:quotas:${this._quotaType}:${this._quotaId}`;
    }

    async loadAsync() { }

    async runInternal(context: IEsContext) {
        const key = _.get(context.properties, this._sourceProp);
        if (!_.isString(key) && !_.isNumber(key)) {
            throw new EsMiddlewareError(EsQuotaLimiterMiddleware.name, 'key MUST be either string or number');
        }

        const rKey = `${this._redisKey}`

        const q = await this._redis.incr(rKey);
        // try {
        //     const r = await this._rateLimiter.consume(key, 1);
        //     _.set(context.properties, this._destProp, r);
        // }
        // catch (err) {
        //     if (err instanceof RateLimiterRes || Object.keys(err).some(k => err[k] instanceof RateLimiterRes)) {
        //         _.set(context.properties, this._destProp, err);
        //         throw new EsMiddlewareError(EsQuotaLimiterMiddleware.name, `Maximum quota reached`, err, `Contact administrator for more details`, 429);
        //     }

        //     throw new EsMiddlewareError(EsQuotaLimiterMiddleware.name, 'Error running rateLimiter', err);
        // }
    }
};

export const MiddlewareCtor: IEsMiddlewareConstructor = EsQuotaLimiterMiddleware;

export const MiddlewareSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/EsQuotaLimiterMiddleware",
    "title": "QuotaLimiter Middleware",
    "type": "object",
    "additionalProperties": false,
    "required": [
        "quotaId",
        "quotaType",
        "quota",
        "sourceProp"
    ],
    "properties": {
        "sourceProp": {
            "type": "string",
            "minLength": 1
        },
        "quota": {
            "type": "number",
            "min": 1
        },
        "quotaType": {
            "type": "string",
            "minLength": 1,
            "enum": ['DAY', 'WEEK', 'MONTH', 'YEAR']
        },
        "quotaId": {
            "type": "string",
            "minLength": 1
        },
        "destProp": {
            "type": "string",
            "minLength": 1
        }
    }
};
