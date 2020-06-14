import { IEsMiddleware, IEsContext, IEsMiddlewareConstructor } from '../core';
import _ from 'lodash';
import { logger } from '../util/logger';
import { EsMiddlewareError } from '../core/errors';

export class EsMetricsMiddleware implements IEsMiddleware {
    static readonly isInOut = true;
    static readonly middlewareName = 'EsMetricsMiddleware';
    static readonly meta = { middleware: EsMetricsMiddleware.middlewareName };

    values: any;

    next?: IEsMiddleware;

    /**
     * Constrói o middleware a partir dos parâmetros
     */
    constructor(values: any, after: boolean, nextMiddleware?: IEsMiddleware) {
        // Verifica values contra o esquema.
        this.values = values;
        this.next = nextMiddleware;

        if (!_.isString(values['prop'])) {
            throw new EsMiddlewareError(EsMetricsMiddleware.middlewareName, 'prop MUST be string');
        }
    }

    async loadAsync() { }

    async execute(context: IEsContext) {
        const meta = _.merge({}, EsMetricsMiddleware.meta, context.meta);
        let init = new Date().valueOf();
        await this.next?.execute(context);
        let end = new Date().valueOf();
        let diff = end - init;
        context.logger.debug(`Duration: ${diff}ms`, meta);
        _.set(context.properties, this.values['prop'], diff);
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