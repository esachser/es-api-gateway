import { IEsMiddleware, IEsContext, IEsMiddlewareConstructor } from '../core';
import _ from 'lodash';
import { logger } from '../util/logger';
import { EsMiddlewareError } from '../core/errors';

export class EsMetricsMiddleware extends IEsMiddleware {
    static readonly isInOut = true;
    static readonly middlewareName = 'EsMetricsMiddleware';
    static readonly meta = { middleware: EsMetricsMiddleware.middlewareName };

    values: any;

    next?: IEsMiddleware;

    /**
     * Constrói o middleware a partir dos parâmetros
     */
    constructor(values: any, after: boolean, api:string, nextMiddleware?: IEsMiddleware) {
        // Verifica values contra o esquema.
        super();
        this.values = values;
        this.next = nextMiddleware;

        if (!_.isString(values['prop'])) {
            throw new EsMiddlewareError(EsMetricsMiddleware.middlewareName, 'prop MUST be string');
        }
    }

    async loadAsync() { }

    async execute(context: IEsContext) {
        const meta = _.merge({}, EsMetricsMiddleware.meta, context.meta);
        let init = process.hrtime();
        let e = undefined;
        try{ 
            await this.next?.execute(context);
        }
        catch(err) {
            e = err;
        }
        const diffs = process.hrtime(init);
        const diff = diffs[0] * 1000 + diffs[1] / 1000000;
        context.logger.debug(`Duration: ${diff}ms`, meta);
        _.set(context.properties, this.values['prop'], diff);
        if (e !== undefined) {
            throw e;
        }
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