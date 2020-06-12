import { IEsMiddleware, EsMiddleware, IEsMiddlewareConstructor, createMiddleware, IEsContext } from '../core';
import lodash from 'lodash';
import { logger } from '../util/logger';
import { EsMiddlewareError } from '../core/errors';

export class EsParallelMiddleware extends EsMiddleware {
    static readonly isInOut = true;
    static readonly middlewareName = 'EsParallelMiddleware';

    values: any;

    next?: IEsMiddleware;

    /**
     * Constrói o middleware a partir dos parâmetros
     */
    constructor(values: any, after: boolean, nextMiddleware?: IEsMiddleware) {
        super(after, nextMiddleware);
        // Verifica values contra o esquema.
        this.values = {};
        this.values['mids'] = [];
    }

    async loadAsync(values: any) {
        if (Array.isArray(values['mids'])) {
            for (let i=0; i < values['mids'].length; i++) {
                let ms = values['mids'][i];
                if (Array.isArray(ms)) {
                    this.values['mids'][i] =  await createMiddleware(ms, 0);
                }
                else {
                    throw new EsMiddlewareError(EsParallelMiddleware.middlewareName, `values.mids[${i}] MUST be array`);
                }
            }
        }
        else {
            throw new EsMiddlewareError(EsParallelMiddleware.middlewareName, `values.mids MUST be array`);
        }
    }

    async runInternal(context: IEsContext) {
        Promise.all(this.values['mids'].map((m:IEsMiddleware) => m?.execute(context)));
    }
};

export const MiddlewareCtor: IEsMiddlewareConstructor = EsParallelMiddleware;

export const MiddlewareSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/EsParallelMiddleware",
    "title": "Parallel Middleware",
    "type": "object",
    "additionalProperties": false,
    "required": [
        "mids"
    ],
    "properties": {
        "mids": {
            "type": "array",
            "items": {
                "type": "array",
                "items": {
                    "$ref": "es-middleware"
                }
            }
        }
    }
};
