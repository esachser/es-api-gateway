import { IEsMiddleware, EsMiddleware, IEsContext, IEsMiddlewareConstructor, createMiddleware } from '../core';
import lodash from 'lodash';
import { logger } from '../util/logger';
import { EsMiddlewareError } from '../core/errors';

export class EsSequenceMiddleware extends EsMiddleware {
    static readonly isInOut = true;
    static readonly middlewareName = 'EsSequenceMiddleware';
    static readonly meta = { middleware: EsSequenceMiddleware.middlewareName };

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
                    this.values['mids'][i] = await createMiddleware([ms], 0);
                }
            }
        }
        else {
            throw new EsMiddlewareError(EsSequenceMiddleware.middlewareName, `values.mids MUST be array`);
        }
    }

    async runInternal(context: IEsContext) {
        const meta = lodash.merge(EsSequenceMiddleware.meta, context.meta);
        if (Array.isArray(this.values['mids'])) {
            for (let i = 0; i < this.values['mids'].length; i++) {
                context.logger.debug(`Running middleware ${i}`, meta);
                await this.values['mids'][i]?.execute(context).catch((e:any) => { throw e });
            }
        }
    }
};

export const MiddlewareCtor: IEsMiddlewareConstructor = EsSequenceMiddleware;

export const MiddlewareSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/EsSequenceMiddleware",
    "title": "Sequence Middleware",
    "type": "object",
    "additionalProperties": false,
    "required": [
        "mids"
    ],
    "properties": {
        "mids": {
            "type": "array",
            "items": {
                "anyOf": [
                    {
                        "$ref": "es-middleware"
                    },
                    {
                        "type": "array",
                        "items": {
                            "$ref": "es-middleware"
                        }
                    }
                ]
            }
        }
    }
};
