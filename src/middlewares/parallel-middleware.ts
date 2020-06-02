import { IEsMiddleware, IEsContext, EsParameters, IEsMiddlewareConstructor, IEsMiddlewareParams, createMiddleware } from '../core';
import lodash from 'lodash';
import { logger } from '../util/logger';

export class EsParallelMiddleware implements IEsMiddleware {
    static readonly parameters: EsParameters = {
        'mids': {
            type: 'array',
            optional: false,
            defaultValue: []
        },
        'runAfter': {
            type: 'boolean',
            optional: true,
            defaultValue: false
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
        this.values = [];
        this.next = nextMiddleware;

        if (Array.isArray(values['mids'])) {
            this.values['mids'] = values['mids'].map(ms => {
                if (Array.isArray(ms)) {
                    return createMiddleware(ms, 0);
                }
                else {
                    return undefined;
                }
            });
        }
    }

    async execute(context: IEsContext) {
        const rAfter = Boolean(this.values['runAfter'])
        if(!rAfter) {
            await Promise.all(this.values['mids'].map((m:IEsMiddleware) => m?.execute(context)));
        }
        await this.next?.execute(context);
        if (rAfter) {
            await Promise.all(this.values['mids'].map((m:IEsMiddleware) => m?.execute(context)));
        }        
    }
};

export const EsParallelMiddlwareParams: IEsMiddlewareParams = EsParallelMiddleware;

export const EsParallelMiddlewareContructor: IEsMiddlewareConstructor = EsParallelMiddleware;

