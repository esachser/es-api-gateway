import _ from 'lodash';
import { EsMiddlewareError } from '../core/errors';
import { EsMiddleware, IEsMiddleware, IEsMiddlewareConstructor } from '../core/middlewares';
import { IEsContext } from '../core';
import { configuration } from '../util/config';
import getEtcdClient from '../util/etdc';

export class EsGetApiDataMiddleware extends EsMiddleware {
    static readonly isInOut = true;
    static readonly middlewareName = 'EsGetApiDataMiddleware';
    static readonly meta = { middleware: EsGetApiDataMiddleware.middlewareName };

    private _srcProp: string;
    private _destProp: string;

    /**
     * Constrói o middleware a partir dos parâmetros
     */
    constructor(values: any, after: boolean, api:string, nextMiddleware?: IEsMiddleware) {
        super(after, api, nextMiddleware);

        this._srcProp = _.get(values, 'sourceProp');
        this._destProp = _.get(values, 'destProp');

        if (!_.isString(this._srcProp)){
            throw new EsMiddlewareError(EsGetApiDataMiddleware.name, 'sourceProp MUST be string');
        }

        if (!_.isUndefined(this._destProp) && !_.isString(this._destProp)){
            throw new EsMiddlewareError(EsGetApiDataMiddleware.name, 'destProp MUST be string');
        }
    }

    async loadAsync() { }

    async runInternal(context: IEsContext) {
        const src = _.get(context.properties, this._srcProp);
        
        if (!_.isString(src)) {
            throw new EsMiddlewareError(EsGetApiDataMiddleware.name, `Destination (prop ${this._srcProp}) MUST be string`);
        }

        const realSrc = `esgateway/runtime/${configuration.env}/apis/${context.meta.api}/store/${src}`;

        const etcdClient = getEtcdClient();

        const prop = await etcdClient.get(realSrc);

        if (prop !== null) {
            _.set(context.properties, this._destProp, prop);
        }
    }
}

export const MiddlewareCtor: IEsMiddlewareConstructor = EsGetApiDataMiddleware;

export const MiddlewareSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/EsGetApiDataMiddleware",
    "title": "GetApiData Middleware",
    "type": "object",
    "additionalProperties": false,
    "required": [
        "sourceProp",
        "destProp"
    ],
    "properties": {
        "sourceProp": {
            "type": "string",
            "minLength": 1
        },
        "destProp": {
            "type": "string",
            "minLength": 1
        }
    }
};
