import { IEsMiddleware, IEsContext, EsParameters, IEsMiddlewareConstructor, IEsMiddlewareParams } from '../core';
import lodash from 'lodash';
import { NodeVM, VMScript } from 'vm2';
import { logger } from '../util/logger';
import stringifyObject from 'stringify-object';

const vm = new NodeVM();

export class EsPropertyMiddleware implements IEsMiddleware {
    static readonly isInOut = true;

    values: any;

    next?: IEsMiddleware;

    readonly vmScript: VMScript;

    /**
     * Constrói o middleware a partir dos parâmetros
     */
    constructor(values: any, nextMiddleware?: IEsMiddleware) {
        // Verifica values contra o esquema.
        this.values = values;
        this.next = nextMiddleware;

        // Se for uma expressão, prepara VMScript para rodar.
        let script = '';
        if (values['value'] === undefined &&
            values['expression'] !== undefined) {

            script += `module.exports=function(props){ try { return ${values['expression']};} catch(err) { return undefined; } }`;
        }
        // Senão, prepara VMScript para somente devolver o valor
        else {
            script += `module.exports=function(props){ try { return ${stringifyObject(values['value'])};} catch(err) { return undefined; } }`;
        }
        logger.debug(`script: ${script}`);

        try {
            this.vmScript = new VMScript(script).compile();
        }
        catch (err) {
            logger.error({ error: err, script });
            this.vmScript = new VMScript('module.exports=() => undefined').compile();
        }
    }

    async execute(context: IEsContext) {
        const runAfter = lodash.get(this.values, 'runAfter') || false;
        vm.freeze(context.properties, 'props');
        if (runAfter) {
            await this.next?.execute(context);
            lodash.set(context.properties, this.values['name'], vm.run(this.vmScript)(context.properties));
        }
        else {
            lodash.set(context.properties, this.values['name'], vm.run(this.vmScript)(context.properties));
            await this.next?.execute(context);
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
        "runAfter"
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
        "runAfter": {
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

