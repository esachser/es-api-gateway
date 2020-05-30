import { IEsMiddleware, IEsContext, EsParameters, IEsMiddlewareConstructor } from '../core';
import lodash from 'lodash';

export class EsPropertyMiddleware implements IEsMiddleware {
    parameters: EsParameters = {
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

    values: any;

    next?: IEsMiddleware;

    isInOut = false;

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

export const EsPropertyMiddlewareContructor: IEsMiddlewareConstructor = EsPropertyMiddleware;

