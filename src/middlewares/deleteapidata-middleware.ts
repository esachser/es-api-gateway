import _ from 'lodash';
import { EsMiddlewareError } from '../core/errors';
import { EsMiddleware, IEsMiddleware, IEsMiddlewareConstructor } from '../core/middlewares';
import { IEsContext } from '../core';
import { configuration } from '../util/config';
import getEtcdClient from '../util/etdc';

export class EsDeleteApiDataMiddleware extends EsMiddleware {
    static readonly isInOut = true;
    static readonly middlewareName = 'EsDeleteApiDataMiddleware';
    static readonly meta = { middleware: EsDeleteApiDataMiddleware.middlewareName };

    private _srcProp: string;

    /**
     * Constrói o middleware a partir dos parâmetros
     */
    constructor(values: any, after: boolean, api:string, nextMiddleware?: IEsMiddleware) {
        super(after, api, nextMiddleware);

        this._srcProp = _.get(values, 'sourceProp');

        if (!_.isString(this._srcProp)){
            throw new EsMiddlewareError(EsDeleteApiDataMiddleware.name, 'sourceProp MUST be string');
        }
    }

    async loadAsync() { }

    async runInternal(context: IEsContext) {
        const src = _.get(context.properties, this._srcProp);
        
        if (!_.isString(src)) {
            throw new EsMiddlewareError(EsDeleteApiDataMiddleware.name, `Destination (prop ${this._srcProp}) MUST be string`);
        }

        const realSrc = `esgateway/runtime/${configuration.env}/apis/${context.meta.api}/store/${src}`;

        const etcdClient = getEtcdClient();

        await etcdClient.delete().key(realSrc);
    }
}

export const MiddlewareCtor: IEsMiddlewareConstructor = EsDeleteApiDataMiddleware;

export const MiddlewareSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/EsDeleteApiDataMiddleware",
    "title": "DeleteApiData Middleware",
    "type": "object",
    "additionalProperties": false,
    "required": [
        "sourceProp"
    ],
    "properties": {
        "sourceProp": {
            "type": "string",
            "minLength": 1
        }
    }
};
