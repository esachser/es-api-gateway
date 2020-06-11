import { IEsMiddleware, EsMiddleware, IEsContext, IEsMiddlewareConstructor } from '../core';
import lodash from 'lodash';
import { NodeVM, VMScript } from 'vm2';
import { logger } from '../util/logger';
import stringifyObject from 'stringify-object';

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

    values: any;

    readonly vmScript: VMScript;

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
            logger.error('Error compiling script', { error: err, script });
            this.vmScript = new VMScript('module.exports=() => undefined').compile();
        }
    }

    async runInternal(context: IEsContext) {
        try {
            lodash.set(context.properties, this.values['name'], vm.run(this.vmScript)(context));
        }
        catch (err) {
            logger.error('Error while setting property', err);
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
        "name",
        "after"
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
        },
        "after": {
            "type": "boolean"
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

