import { IEsMiddleware, EsMiddleware, IEsContext, IEsMiddlewareConstructor, createMiddleware } from '../core';
import _ from 'lodash';
import { logger } from '../util/logger';
import { EsMiddlewareError } from '../core/errors';

import vm from 'vm';

const vmContext = vm.createContext({
    '_': _,
    ctx: {},
    result: Error('result not set')
}, {
    name: 'Context Middleware'
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

                const script = `'use strict';result=Boolean(${values['conditions'][i]['conditionExpression']});`;
                const compiledScript = new vm.Script(script);
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
                if (condition['conditionExpression'] instanceof vm.Script) {
                    context.logger.debug(`Testing condition ${i}`, meta);
                    try {
                        vmContext.ctx = context;
                        condition['conditionExpression'].runInContext(vmContext);
                        if (Boolean(vmContext.result)) {
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
