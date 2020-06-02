import { IEsMiddleware, IEsContext, EsParameters, IEsMiddlewareConstructor, IEsMiddlewareParams } from '../core';
import lodash from 'lodash';
import { logger } from '../util/logger';

export class EsMetricsMiddleware implements IEsMiddleware {
    static readonly parameters: EsParameters = {
        'prop': {
            type: 'string',
            optional: false
        }
    };
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

export const EsMetricsMiddlwareParams: IEsMiddlewareParams = EsMetricsMiddleware;

export const EsMetricsMiddlewareContructor: IEsMiddlewareConstructor = EsMetricsMiddleware;

