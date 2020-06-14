import { IEsMiddleware, EsMiddleware, IEsContext, IEsMiddlewareConstructor } from '../core';
import lodash from 'lodash';
import { NodeVM, VMScript } from 'vm2';
import { logger } from '../util/logger';
import stringifyObject from 'stringify-object';
import { EsMiddlewareError } from '../core/errors';

const vm = new NodeVM({
    console: 'inherit',
    sandbox: {},
    require: {
        external: true,
        root: "./"
    }
});

export class EsPropertyMiddleware extends EsMiddleware {
    static readonly isInOut = true;
    static readonly middlewareName = 'EsPropertyMiddleware';
    static readonly meta = { middleware: EsPropertyMiddleware.middlewareName };

    values: any;

    readonly vmScript?: VMScript;

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
            script = `const lodash=require('lodash');module.exports=function(ctx){ return ${values['expression']}; }`;
        }
        // Senão, prepara VMScript para somente devolver o valor
        else {
            script = `const lodash=require('lodash');module.exports=function(ctx){ return ${stringifyObject(values['value'])}; }`;
        }

        try {
            this.vmScript = new VMScript(script).compile();
        }
        catch (err) {
            throw new EsMiddlewareError(EsPropertyMiddleware.middlewareName, 'Error compiling property script', err);
        }
    }

    async loadAsync() {}

    async runInternal(context: IEsContext) {
        if (this.vmScript !== undefined) {
            context.logger.debug(`Writing to ${this.values['name']}`, lodash.merge({}, EsPropertyMiddleware.meta, context.meta));
            lodash.set(context.properties, this.values['name'], vm.run(this.vmScript)(context));
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
            "type": ["object", "number", "boolean", "string", "null"]
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

