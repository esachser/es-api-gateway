import { IEsMiddleware, EsMiddleware, IEsContext, IEsMiddlewareConstructor, createMiddleware } from '../core';
import _ from 'lodash';
import { EsMiddlewareError } from '../core/errors';

export class EsForEachMiddleware extends EsMiddleware {
    static readonly isInOut = true;
    static readonly middlewareName = 'EsForEachMiddleware';
    static readonly meta = { middleware: EsForEachMiddleware.middlewareName };

    forEachMiddleware?: IEsMiddleware;

    propArray: string = 'foreachElement';

    /**
     * Constrói o middleware a partir dos parâmetros
     */
    constructor(values: any, after: boolean, nextMiddleware?: IEsMiddleware) {
        super(after, nextMiddleware);
        this.propArray = _.get(values, 'propArray', 'foreachElement')
    }

    async loadAsync(values: any) {
        if (_.isArray(values['mids'])) {
            this.forEachMiddleware = await createMiddleware(values['mids'], 0);
        }
        else {
            throw new EsMiddlewareError(EsForEachMiddleware.middlewareName, 'mids MUST be array');
        }
    }

    async runInternal(context: IEsContext) {
        // Lê propriedade
        const prop = _.get(context.properties, this.propArray, []);
        if (_.isArray(prop)) {
            for(const v of prop) {
                
            }
        }
        else {
            throw new EsMiddlewareError(EsForEachMiddleware.middlewareName, `${this.propArray} MUST be array`);
        }
    }
};

export const MiddlewareCtor: IEsMiddlewareConstructor = EsForEachMiddleware;

export const MiddlewareSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/EsForEachMiddleware",
    "title": "ForEach Middleware",
    "type": "object",
    "additionalProperties": false,
    "required": [
        "propArray",
        "mids"
    ],
    "properties": {
        "propArray": {
            "type": "string"
        },
        "mids": {
            "type": "array",
            "items": {
                "$ref": "es-middleware"
            }
        }
    }
};