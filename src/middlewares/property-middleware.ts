import { IEsMiddleware, EsMiddleware, IEsContext, IEsMiddlewareConstructor } from '../core';
import _ from 'lodash';
import vm from 'vm';
import { logger } from '../util/logger';
import stringifyObject from 'stringify-object';
import { EsMiddlewareError } from '../core/errors';


const vmContext = vm.createContext({
    '_': _,
    ctx: {},
    result: Error('result not set')
}, {
    name: 'Property Middleware'
});

export class EsPropertyMiddleware extends EsMiddleware {
    static readonly isInOut = true;
    static readonly middlewareName = 'EsPropertyMiddleware';
    static readonly meta = { middleware: EsPropertyMiddleware.middlewareName };

    values: any;

    readonly vmScript?: vm.Script;

    /**
     * Constrói o middleware a partir dos parâmetros
     */
    constructor(values: any, after: boolean, nextMiddleware?: IEsMiddleware) {
        super(after, nextMiddleware);
        // Verifica values contra o esquema.
        this.values = values;

        // Se for uma expressão, prepara VMScript para rodar.
        let script = '';
        if (values['value'] === undefined &&
            values['expression'] !== undefined) {
            script = `'use strict';result=${values['expression']};`;
        }
        // Senão, prepara VMScript para somente devolver o valor
        else {
            script = `'use strict';result=${stringifyObject(values['value'])};`;
        }

        try {
            this.vmScript = new vm.Script(script);
        }
        catch (err) {
            throw new EsMiddlewareError(EsPropertyMiddleware.middlewareName, 'Error compiling property script', err);
        }
    }

    async loadAsync() {}

    async runInternal(context: IEsContext) {
        if (this.vmScript !== undefined) {
            context.logger.debug(`Writing to ${this.values['name']}`, _.merge({}, EsPropertyMiddleware.meta, context.meta));
            vmContext.ctx = context;
            this.vmScript.runInContext(vmContext);
            _.set(context.properties, this.values['name'], vmContext.result);
        }
    }
};

export const MiddlewareCtor: IEsMiddlewareConstructor = EsPropertyMiddleware;

export const MiddlewareSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/EsPropertyMiddleware",
    "title": "Property Middleware",
    "type": "object",
    "additionalProperties": false,
    "required": [
        "name"
    ],
    "properties": {
        "name": {
            "type": "string"
        },
        "value": {
            "type": ["object", "array", "number", "boolean", "string", "null"]
        },
        "expression": {
            "type": "string"
        }
    },
    "oneOf": [
        {
            "required": [
                "value"
            ]
        },
        {
            "required": [
                "expression"
            ]
        }
    ]
};

