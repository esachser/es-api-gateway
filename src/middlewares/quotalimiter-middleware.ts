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
    static readonly QUOTA_TYPES = ['DAY', 'WEEK', 'MONTH', 'YEAR'];
    static readonly QUOTA_VALIDITIES= [24*60*60, 7*24*60*60, 31*24*60*60, 366*24*60*60];
    static readonly QUOTA_FUNCTIONS = [
        (dt: Date) => {
            return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() + 1);
        },
        (dt: Date) => {
            return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() + 7 - dt.getDay());
        },
        (dt: Date) => {
            return new Date(dt.getFullYear(), dt.getMonth() + 1, dt.getDate());
        },
        (dt: Date) => {
            return new Date(dt.getFullYear() + 1, dt.getMonth(), dt.getDate());
        }
    ];

    private _redis: Redis.Redis;
    private _redisKey: string;
    private _destProp: string;
    private _sourceProp: string;
    private _quotaId: string;
    private _quotaTypeProp: string;
    private _quotaProp: string;

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

        this._quotaTypeProp = _.get(values, 'quotaTypeProp');
        if (!_.isString(this._quotaTypeProp)) {
            throw new EsMiddlewareError(EsQuotaLimiterMiddleware.name, 'quotaTypeProp MUST be string');
        }

        this._quotaProp = _.get(values, 'quotaProp');
        if (!_.isString(this._quotaProp)) {
            throw new EsMiddlewareError(EsQuotaLimiterMiddleware.name, 'quotaProp MUST be integer greater than 0');
        }

        this._redis = new Redis();
        this._redisKey = `esgateway:runtime:apis:${configuration.env}:${api}:quotas:${this._quotaId}`;
        // this._redisKey = `esgateway:runtime:apis:${configuration.env}:${api}:quotas:${this._quotaType}:${this._quotaId}`;
    }

    async loadAsync() { }

    async runInternal(context: IEsContext) {
        const key = _.get(context.properties, this._sourceProp);
        if (!_.isString(key) && !_.isNumber(key)) {
            throw new EsMiddlewareError(EsQuotaLimiterMiddleware.name, 'key MUST be either string or number');
        }

        let quotaType = _.get(context.properties, this._quotaTypeProp);
        if (!_.isString(quotaType)) {
            throw new EsMiddlewareError(EsQuotaLimiterMiddleware.name, 'quotaType MUST be string');
        }
        quotaType = _.toUpper(quotaType);
        const quotaTypeId = EsQuotaLimiterMiddleware.QUOTA_TYPES.indexOf(quotaType);
        if (quotaTypeId < 0) {
            throw new EsMiddlewareError(EsQuotaLimiterMiddleware.name, 'quotaType INVALID');
        }

        const quotaValue = _.get(context.properties, this._quotaProp);
        if (!_.isInteger(quotaValue) || quotaValue <= 0) {
            throw new EsMiddlewareError(EsQuotaLimiterMiddleware.name, 'quota MUST be integer greater than 0');
        }

        const now = new Date(Date.now());
        // Calcula chave a partir da data
        const dtExp = EsQuotaLimiterMiddleware.QUOTA_FUNCTIONS[quotaTypeId](now);

        const rKey = `${this._redisKey}:${key}`;

        const res = await this._redis.multi().incr(rKey).expireat(rKey, dtExp.valueOf() / 1000).exec();

        const q = res[0];

        if (q[0] !== null) {
            throw new EsMiddlewareError(EsQuotaLimiterMiddleware.name, 'Error running middleware', q[0]);
        }
        else if (q[1] > quotaValue) {
            await this._redis.set(rKey, quotaValue);
            throw new EsMiddlewareError(EsQuotaLimiterMiddleware.name, `Maximum quota reached`, undefined, `Quota: ${quotaValue} per ${quotaType}`, 429);
        }
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
        "quotaTypeProp",
        "quotaProp",
        "sourceProp"
    ],
    "properties": {
        "sourceProp": {
            "type": "string",
            "minLength": 1
        },
        "quotaProp": {
            "type": "string",
            "minLength": 1
        },
        "quotaTypeProp": {
            "type": "string",
            "minLength": 1
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
