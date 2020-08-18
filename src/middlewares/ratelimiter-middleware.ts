import { IEsMiddleware, EsMiddleware, IEsContext, IEsMiddlewareConstructor, createMiddleware } from '../core';
import _ from 'lodash';
import { EsMiddlewareError } from '../core/errors';
import { RateLimiterCluster, RateLimiterAbstract, RateLimiterRes } from 'rate-limiter-flexible';
import { nanoid } from 'nanoid';

export class EsRateLimiterMiddleware extends EsMiddleware {
    static readonly isInOut = true;
    static readonly middlewareName = 'EsRateLimiterMiddleware';
    static readonly meta = { middleware: EsRateLimiterMiddleware.middlewareName };

    private _rateLimiter: RateLimiterAbstract;
    private _destProp: string;

    /**
     * Constrói o middleware a partir dos parâmetros
     */
    constructor(values: any, after: boolean, api:string, nextMiddleware?: IEsMiddleware) {
        super(after, api, nextMiddleware);

        const points = _.get(values, 'points');
        const duration = _.get(values, 'duration');
        this._destProp = _.get(values, 'destProp', 'ratelimitres');

        if (!_.isInteger(points) || points <= 0){
            throw new EsMiddlewareError(EsRateLimiterMiddleware.name, 'points MUST be integer and greater than 0');
        }

        if (!_.isInteger(duration) || duration <= 0){
            throw new EsMiddlewareError(EsRateLimiterMiddleware.name, 'duration MUST be integer and greater than 0');
        }

        if (!_.isString(this._destProp)) {
            throw new EsMiddlewareError(EsRateLimiterMiddleware.name, 'destProp MUST be string');
        }

        this._rateLimiter = new RateLimiterCluster({
            keyPrefix: this.api,
            points,
            duration
        });
    }

    async loadAsync() { }

    async runInternal(context: IEsContext) {
        try {
            const r = await this._rateLimiter.consume(context.meta.api, 1);
            _.set(context.properties, this._destProp, r);
        }
        catch (err) {
            if (err instanceof RateLimiterRes) {
                _.set(context.properties, this._destProp, err);
                throw new EsMiddlewareError(EsRateLimiterMiddleware.name, `Maximum rate reached`, err, `Wait ${err.msBeforeNext}ms and try again`, 429);
            }
            throw new EsMiddlewareError(EsRateLimiterMiddleware.name, 'Error running rateLimiter', err);
        }
    }
};

export const MiddlewareCtor: IEsMiddlewareConstructor = EsRateLimiterMiddleware;

export const MiddlewareSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/EsRateLimiterMiddleware",
    "title": "RateLimiter Middleware",
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
        },
        "destProp": {
            "type": "string",
            "minLength": 0
        }
    }
};
