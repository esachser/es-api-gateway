import { IEsMiddleware, IEsContext, IEsMiddlewareConstructor, createMiddleware } from '../core';
import _ from 'lodash';
import { EsMiddlewareError } from '../core/errors';

export class EsCatchMiddleware implements IEsMiddleware {
    static readonly isInOut = true;
    static readonly middlewareName = 'EsCatchMiddleware';
    static readonly meta = { middleware: EsCatchMiddleware.middlewareName };

    catchMiddleware?: IEsMiddleware;

    next?: IEsMiddleware;

    api: string;

    /**
     * Constrói o middleware a partir dos parâmetros
     */
    constructor(values: any, after: boolean, api:string, nextMiddleware?: IEsMiddleware) {
        // Verifica values contra o esquema.
        this.next = nextMiddleware;
        this.api = api;
    }

    async loadAsync(values: any) {
        if (_.isArray(values['mids'])) {
            this.catchMiddleware = await createMiddleware(values['mids'], 0, this.api);
        }
        else {
            throw new EsMiddlewareError(EsCatchMiddleware.middlewareName, 'mids MUST be array');
        }
    }

    async execute(context: IEsContext) {
        try{
            await this.next?.execute(context);
        }
        catch(err) {
            if (err instanceof EsMiddlewareError) {
                await this.catchMiddleware?.execute(context);
            }
            else {
                throw err;
            }
        }
    }
};

export const MiddlewareCtor: IEsMiddlewareConstructor = EsCatchMiddleware;

export const MiddlewareSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/EsCatchMiddleware",
    "title": "Catch Middleware",
    "type": "object",
    "additionalProperties": false,
    "required": [
        "mids"
    ],
    "properties": {
        "mids": {
            "type": "array",
            "items": {
                "$ref": "es-middleware"
            }
        }
    }
};