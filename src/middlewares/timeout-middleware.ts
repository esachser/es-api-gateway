import _ from 'lodash';
import { EsMiddlewareError } from '../core/errors';
import { EsMiddleware, IEsMiddleware, IEsMiddlewareConstructor } from '../core/middlewares';
import { IEsContext } from '../core';
import { delay } from '../util';

export class EsTimeoutMiddleware extends EsMiddleware {
    static readonly isInOut = true;
    static readonly middlewareName = 'EsTimeoutMiddleware';
    static readonly meta = { middleware: EsTimeoutMiddleware.middlewareName };

    private _timeout: number;

    /**
     * Constrói o middleware a partir dos parâmetros
     */
    constructor(values: any, after: boolean, api:string, nextMiddleware?: IEsMiddleware) {
        super(after, api, nextMiddleware);
        this._timeout = _.get(values, 'timeout');
    }

    async loadAsync() { }

    async runInternal(context: IEsContext) {
    }

    async execute(context: IEsContext) {
        let timeoutHandle: NodeJS.Timeout;
        const values = _.clone(context.properties);
        const delayRun = new Promise((res, rej) => {
            timeoutHandle = setTimeout(() => {
                _.set(context, 'properties', values);
                rej(new EsMiddlewareError(this.constructor.name, 'Timeout reached', undefined, undefined, 408));
            }, this._timeout);    
        });
        const exec = new Promise(async (res, rej) => {
            await super.execute(context);
            if (timeoutHandle !== undefined) {
                clearTimeout(timeoutHandle);
            }
            res();
        });
        await Promise.race([exec, delayRun]);
    }
};

export const MiddlewareCtor: IEsMiddlewareConstructor = EsTimeoutMiddleware;

export const MiddlewareSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/EsTimeoutMiddleware",
    "title": "Timeout Middleware",
    "type": "object",
    "additionalProperties": false,
    "required": [
        "timeout"
    ],
    "properties": {
        "timeout": {
            "type": "integer",
            "minValue": 0
        }
    }
};
