import { IEsMiddleware, EsMiddleware, IEsContext, IEsMiddlewareConstructor, createMiddleware } from '../core';
import _ from 'lodash';
import { logger } from '../util/logger';
import { NodeVM, VMScript } from 'vm2';
import { EsMiddlewareError } from '../core/errors';

const vm = new NodeVM({
    console: 'inherit',
    sandbox: {},
    require: {
        external: true,
        root: "./"
    }
});

export class EsConditionMiddleware extends EsMiddleware {
    static readonly isInOut = true;
    static readonly middlewareName = 'EsConditionMiddleware';
    static readonly meta = { middleware: EsConditionMiddleware.middlewareName };

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
                if (!_.isString(condition.conditionExpression)) {
                    throw new EsMiddlewareError(EsConditionMiddleware.middlewareName, 'condition.conditionExpression MUST be string');
                }
                if (!_.isArray(condition.mids)) {
                    throw new EsMiddlewareError(EsConditionMiddleware.middlewareName, 'condition.mids MUST be array');
                }

                const script = `'use strict';const _=require('lodash');module.exports=function(ctx){ return Boolean(${values['conditions'][i]['conditionExpression']}); }`;
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
        const meta = _.merge({}, EsConditionMiddleware.meta, context.meta);
        if (Array.isArray(this.values['conditions'])) {
            for (let i = 0; i < this.values['conditions'].length; i++) {
                let condition = this.values['conditions'][i];
                if (condition['conditionExpression'] instanceof VMScript) {
                    context.logger.debug(`Testing condition ${i}`, meta);
                    try {
                        let v = vm.run(condition['conditionExpression'])(context);
                        if (Boolean(v)) {
                            context.logger.debug(`Condition ${i} reached`, meta);
                            await condition['mids']?.execute(context);
                            return;
                        }
                    }
                    catch (err) {
                        throw err;
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
