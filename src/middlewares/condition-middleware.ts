import { IEsMiddleware, EsMiddleware, IEsContext, IEsMiddlewareConstructor, createMiddleware } from '../core';
import lodash from 'lodash';
import { logger } from '../util/logger';
import { NodeVM, VMScript } from 'vm2';
import { EsMiddlewareError } from '../core/errors';

const vm = new NodeVM();

export class EsConditionMiddleware extends EsMiddleware {
    static readonly isInOut = true;
    static readonly middlewareName = 'EsConditionMiddleware';

    values: any;

    /**
     * Constrói o middleware a partir dos parâmetros
     */
    constructor(values: any, after: boolean, nextMiddleware?: IEsMiddleware) {
        super(after, nextMiddleware);
        // Verifica values contra o esquema.
        this.values = {};
        this.values['conditions'] = [];
    }

    async loadAsync(values:any) {
        if (Array.isArray(values['conditions'])) {
            for (let i = 0; i < values['conditions'].length; i++) {
                const condition = values['conditions'][i];
                if (!lodash.isString(condition.conditionExpression)) {
                    throw new EsMiddlewareError(EsConditionMiddleware.middlewareName, 'condition.conditionExpression MUST be string');
                }
                if (!lodash.isArray(condition.mids)) {
                    throw new EsMiddlewareError(EsConditionMiddleware.middlewareName, 'condition.mids MUST be array');
                }

                const script = `module.exports=function(ctx){ try { return Boolean(${values['conditions'][i]['conditionExpression']});} catch(err) { return false; } }`;
                const compiledScript = new VMScript(script).compile();
                const conditionStructure: any = {};
                conditionStructure['conditionExpression'] = compiledScript;
                conditionStructure['mids'] = await createMiddleware(condition.mids, 0);
                this.values['conditions'][i] = conditionStructure;
            }
        }
        else {
            throw new EsMiddlewareError(EsConditionMiddleware.middlewareName, 'conditions MUST be array');
        }
    }

    async runInternal(context: IEsContext) {
        if (Array.isArray(this.values['conditions'])) {
            for (let i = 0; i < this.values['conditions'].length; i++) {
                let condition = this.values['conditions'][i];
                if (condition['conditionExpression'] instanceof VMScript) {
                    if (Boolean(vm.run(condition['conditionExpression'])(context))) {
                        await condition['mids']?.execute(context).catch((e:any) => { throw e });
                        return;
                    }
                }
            }
        }
    }
};

export const MiddlewareCtor: IEsMiddlewareConstructor = EsConditionMiddleware;

export const MiddlewareSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/EsConditionMiddleware",
    "title": "Condition Middleware",
    "type": "object",
    "additionalProperties": false,
    "required": [
        "conditions"
    ],
    "properties": {
        "conditions": {
            "type": "array",
            "items": {
                "type": "object",
                "additionalProperties": false,
                "required": [
                    "conditionExpression",
                    "mids"
                ],
                "properties": {
                    "conditionExpression": {
                        "type": "string"
                    },
                    "mids": {
                        "type": "array",
                        "items": {
                            "$ref": "es-middleware"
                        }
                    }
                }
            }
        }
    }
};
