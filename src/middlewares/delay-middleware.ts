import _ from 'lodash';
import { EsMiddlewareError } from '../core/errors';
import { EsMiddleware, IEsMiddleware, IEsMiddlewareConstructor } from '../core/middlewares';
import { IEsContext } from '../core';
import { delay } from '../util';

export class EsDelayMiddleware extends EsMiddleware {
    static readonly isInOut = true;
    static readonly middlewareName = 'EsDelayMiddleware';
    static readonly meta = { middleware: EsDelayMiddleware.middlewareName };

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
        let delayTime = _.get(context.properties, _.get(this.values, 'delayProp', 'delay'), 0);
        try {
            if (_.isString(delayTime)) {
                delayTime = Number.parseInt(delayTime);
            }
        }
        catch (err) {
            throw new EsMiddlewareError(this.constructor.name, 'delay MUST be a number greater or equal to zero', err);
        }
        if (!_.isNumber(delayTime) || delayTime < 0) {
            throw new EsMiddlewareError(this.constructor.name, 'delay MUST be a number greater or equal to zero');
        }
        await delay(delayTime);
    }
};

export const MiddlewareCtor: IEsMiddlewareConstructor = EsDelayMiddleware;

export const MiddlewareSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/EsDelayMiddleware",
    "title": "Delay Middleware",
    "type": "object",
    "additionalProperties": false,
    "required": [
        "delayProp"
    ],
    "properties": {
        "delayProp": {
            "type": "string"
        }
    }
};
