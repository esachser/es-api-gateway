import { IEsMiddleware, IEsContext, IEsMiddlewareConstructor, createMiddleware } from '../core';
import lodash from 'lodash';
import { logger } from '../util/logger';

export class EsSequenceMiddleware implements IEsMiddleware {
    static readonly isInOut = true;

    values: any;

    next?: IEsMiddleware;

    /**
     * Constrói o middleware a partir dos parâmetros
     */
    constructor(values: any, nextMiddleware?: IEsMiddleware) {
        // Verifica values contra o esquema.
        this.values = {};
        this.values['after'] = values['after'];
        this.values['mids'] = [];
        this.next = nextMiddleware;

        if (Array.isArray(values['mids'])) {
            values['mids'].forEach(async (ms, i) => {
                if (Array.isArray(ms)) {
                    this.values['mids'][i] =  await createMiddleware(ms, 0);
                }
                else {
                    this.values['mids'][i] =  await createMiddleware([ms], 0);
                }
            });
        }
    }

    async execute(context: IEsContext) {
        const rAfter = Boolean(this.values['after'])
        if(!rAfter) {
            if (Array.isArray(this.values['mids'])) {
                for (let i = 0; i < this.values['mids'].length; i++) {
                    await this.values['mids'][i]?.execute(context);
                }
            }
        }
        await this.next?.execute(context);
        if (rAfter) {
            if (Array.isArray(this.values['mids'])) {
                for (let i = 0; i < this.values['mids'].length; i++) {
                    await this.values['mids'][i]?.execute(context);
                }
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
        "mids",
        "after"
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
        },
        "after": {
            "type": "boolean"
        }
    }
};
