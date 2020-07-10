import { IEsMiddleware, EsMiddleware, IEsContext, IEsMiddlewareConstructor, createMiddleware } from '../core';
import _ from 'lodash';
import { EsMiddlewareError } from '../core/errors';

export class EsThrowMiddleware extends EsMiddleware {
    static readonly isInOut = true;
    static readonly middlewareName = 'EsThrowMiddleware';
    static readonly meta = { middleware: EsThrowMiddleware.middlewareName };

    values: any;

    /**
     * Constrói o middleware a partir dos parâmetros
     */
    constructor(values: any, after: boolean, api:string, nextMiddleware?: IEsMiddleware) {
        super(after, api, nextMiddleware);
        this.values = values;
    }

    async loadAsync() { }

    async runInternal(context: IEsContext) {
        let err = _.get(context.properties, _.get(this.values, 'errorProp', 'error'), {});
        if (!_.isObjectLike(err)) {
            err = { error: err };
        }
        throw new EsMiddlewareError(EsThrowMiddleware.middlewareName, 'Throw error middleware', _.merge({}, err, EsThrowMiddleware.meta));
    }
};

export const MiddlewareCtor: IEsMiddlewareConstructor = EsThrowMiddleware;

export const MiddlewareSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/EsThrowMiddleware",
    "title": "Throw Middleware",
    "type": "object",
    "additionalProperties": false,
    "required": [
        "errorProp"
    ],
    "properties": {
        "errorProp": {
            "type": "string"
        }
    }
};
