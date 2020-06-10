import { IEsMiddleware, IEsContext, IEsMiddlewareConstructor, createMiddleware } from '../core';
import lodash from 'lodash';
import { logger } from '../util/logger';
import { NodeVM, VMScript } from 'vm2';

const vm = new NodeVM();

export class EsConditionMiddleware implements IEsMiddleware {
    static readonly isInOut = true;

    values: any;

    next?: IEsMiddleware;

    /**
     * Constrói o middleware a partir dos parâmetros
     */
    constructor(values: any, nextMiddleware?: IEsMiddleware) {
        // Verifica values contra o esquema.
        this.values = {};
        this.values['after'] = values['after'];
        this.values['conditions'] = [];
        this.next = nextMiddleware;

        if (Array.isArray(values['conditions'])) {
            values['conditions'].forEach((condition, i) => {
                if (Array.isArray(condition.mids)) {
                    this.values['conditions'][i] = {};
                    const script = `module.exports=function(ctx){ try { return Boolean(${values['conditions'][i]['conditionExpression']});} catch(err) { return false; } }`;
                    this.values['conditions'][i]['conditionExpression'] = new VMScript(script).compile();
                    createMiddleware(condition.mids, 0).then(mid => {
                        this.values['conditions'][i]['mids'] = mid;
                    });
                }
            });
        }
    }

    async runInternal(context: IEsContext) {
        if (Array.isArray(this.values['conditions'])) {
            for (let i = 0; i < this.values['conditions'].length; i++) {
                let condition = this.values['conditions'][i];
                if (condition['conditionExpression'] instanceof VMScript) {
                    if (Boolean(vm.run(condition['conditionExpression'])(context))) {
                        await condition['mids']?.execute(context);
                        return;
                    }
                }
            }
        }
    }

    async execute(context: IEsContext) {
        const rAfter = Boolean(this.values['after']);
        if (rAfter) {
            await this.next?.execute(context);
            await this.runInternal(context);
        }
        else {
            await this.runInternal(context);
            await this.next?.execute(context);
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
        "conditions",
        "after"
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
        },
        "after": {
            "type": "boolean"
        }
    }
};
