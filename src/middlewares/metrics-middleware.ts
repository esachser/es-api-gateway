import { IEsMiddleware, IEsContext, EsParameters, IEsMiddlewareConstructor } from '../core';
import lodash from 'lodash';
import { logger } from '../util/logger';

export class EsMetricsMiddleware implements IEsMiddleware {
    static readonly isInOut = true;

    values: any;

    next?: IEsMiddleware;


    /**
     * Constrói o middleware a partir dos parâmetros
     */
    constructor(values: any, nextMiddleware?: IEsMiddleware) {
        // Verifica values contra o esquema.
        this.values = values;
        this.next = nextMiddleware;
    }

    async execute(context: IEsContext) {
        let init = new Date().valueOf();
        await this.next?.execute(context);
        let end = new Date().valueOf();
        let diff = end - init;
        logger.info(`Duration: ${diff}ms`);
        lodash.set(context.properties, this.values['prop'], diff);
    }
};

export const MiddlewareCtor: IEsMiddlewareConstructor = EsMetricsMiddleware;

export const MiddlewareSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/EsMetricsMiddleware",
    "title": "Metrics Middleware",
    "type": "object",
    "additionalProperties": false,
    "required": [
        "prop"
    ],
    "properties": {
        "prop": {
            "type": "string"
        }
    }
};