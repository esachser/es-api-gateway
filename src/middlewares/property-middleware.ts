import { IEsMiddleware, IEsContext, EsParameters, IEsMiddlewareConstructor, IEsMiddlewareParams } from '../core';
import lodash from 'lodash';

export class EsPropertyMiddleware implements IEsMiddleware {
    static readonly parameters: EsParameters = {
        'name': {
            type: 'string',
            optional: false
        },
        'value': {
            type: 'any',
            optional: false
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
        this.values = values;
        this.next = nextMiddleware;
    }

    async execute(context: IEsContext) {
        const runAfter = lodash.get(this.values, 'runAfter') || false;
        if (runAfter) {
            await this.next?.execute(context);
            lodash.set(context.properties, this.values['name'], this.values['value']);
        }
        else {
            lodash.set(context.properties, this.values['name'], this.values['value']);
            await this.next?.execute(context);
        }
    }
};

export const EsPropertyMiddlwareParams: IEsMiddlewareParams = EsPropertyMiddleware;

export const EsPropertyMiddlewareContructor: IEsMiddlewareConstructor = EsPropertyMiddleware;

