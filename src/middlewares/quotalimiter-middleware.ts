import { IEsMiddleware, EsMiddleware, IEsContext, IEsMiddlewareConstructor, createMiddleware } from '../core';
import _ from 'lodash';
import { EsMiddlewareError } from '../core/errors';
import { RateLimiterRedis, RateLimiterUnion, RateLimiterAbstract, RateLimiterRes } from 'rate-limiter-flexible';
import Redis from 'ioredis';
import { nanoid } from 'nanoid';

export class EsQuotaLimiterMiddleware extends EsMiddleware {
    static readonly isInOut = true;
    static readonly middlewareName = 'EsQuotaLimiterMiddleware';
    static readonly meta = { middleware: EsQuotaLimiterMiddleware.middlewareName };

    private _rateLimiter: RateLimiterUnion | RateLimiterAbstract;
    private _destProp: string;
    private _sourceProp: string;

    /**
     * Constrói o middleware a partir dos parâmetros
     */
    constructor(values: any, after: boolean, nextMiddleware?: IEsMiddleware) {
        super(after, nextMiddleware);

        this._destProp = _.get(values, 'destProp', 'ratelimitres');
        if (!_.isString(this._destProp)) {
            throw new EsMiddlewareError(EsQuotaLimiterMiddleware.name, 'destProp MUST be string');
        }

        this._sourceProp = _.get(values, 'sourceProp');
        if (!_.isString(this._sourceProp)) {
            throw new EsMiddlewareError(EsQuotaLimiterMiddleware.name, 'sourceProp MUST be string');
        }

        const quotas = _.get(values, 'quotas');
        if (!_.isArray(quotas)) {
            throw new EsMiddlewareError(EsQuotaLimiterMiddleware.name, 'quotas MUST be an array');
        }

        const redisClient = new Redis();

        const rateLimiters = quotas.map(q => {
            const points = q.points;
            const duration = q.duration;

            if (!_.isInteger(points) || points <= 0) {
                throw new EsMiddlewareError(EsQuotaLimiterMiddleware.name, 'points MUST be integer and greater than 0');
            }

            if (!_.isInteger(duration) || duration <= 0) {
                throw new EsMiddlewareError(EsQuotaLimiterMiddleware.name, 'duration MUST be integer and greater than 0');
            }

            return new RateLimiterRedis({
                points,
                duration,
                storeClient: redisClient,
                keyPrefix: `esgateway:runtime:apis:quotalimiter:${nanoid(12)}`
            });
        });

        if (rateLimiters.length === 0) {
            throw new EsMiddlewareError(EsQuotaLimiterMiddleware.name, 'at least one quota MUST be defined');
        }
        else if(rateLimiters.length === 1) {
            this._rateLimiter = rateLimiters[0];
        }
        else {
            this._rateLimiter = new RateLimiterUnion(...rateLimiters);
        }
    }

    async loadAsync() { }

    async runInternal(context: IEsContext) {
        const key = _.get(context.properties, this._sourceProp);
        if (!_.isString(key) && !_.isNumber(key)) {
            throw new EsMiddlewareError(EsQuotaLimiterMiddleware.name, 'key MUST be either string or number');
        }
        try {
            const r = await this._rateLimiter.consume(key, 1);
            _.set(context.properties, this._destProp, r);
        }
        catch (err) {
            if (err instanceof RateLimiterRes || Object.keys(err).some(k => err[k] instanceof RateLimiterRes)) {
                _.set(context.properties, this._destProp, err);
                throw new EsMiddlewareError(EsQuotaLimiterMiddleware.name, `Maximum quota reached`, err, `Contact administrator for more details`, 429);
            }

            throw new EsMiddlewareError(EsQuotaLimiterMiddleware.name, 'Error running rateLimiter', err);
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
        "quotas",
        "sourceProp"
    ],
    "properties": {
        "quotas": {
            "type": "array",
            "items": {
                "type": "object",
                "additionalProperties": false,
                "required": [
                    "points",
                    "duration"
                ],
                "properties": {
                    "points": {
                        "type": "integer",
                        "exclusiveMinimum": 0
                    },
                    "duration": {
                        "type": "integer",
                        "exclusiveMinimum": 0
                    }
                }
            },
            "minItems": 1
        },
        "sourceProp": {
            "type": "string",
            "minLength": 1
        },
        "destProp": {
            "type": "string",
            "minLength": 1
        }
    }
};
