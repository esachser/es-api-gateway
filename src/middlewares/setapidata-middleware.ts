import _ from 'lodash';
import { EsMiddlewareError } from '../core/errors';
import { EsMiddleware, IEsMiddleware, IEsMiddlewareConstructor } from '../core/middlewares';
import { IEsContext } from '../core';
import { configuration } from '../util/config';
import getEtcdClient from '../util/etdc';

export class EsSetApiDataMiddleware extends EsMiddleware {
    static readonly isInOut = true;
    static readonly middlewareName = 'EsSetApiDataMiddleware';
    static readonly meta = { middleware: EsSetApiDataMiddleware.middlewareName };

    private _srcProp: string;
    private _ttlProp?: string;
    private _destProp: string;

    /**
     * Constrói o middleware a partir dos parâmetros
     */
    constructor(values: any, after: boolean, api:string, nextMiddleware?: IEsMiddleware) {
        super(after, api, nextMiddleware);

        this._srcProp = _.get(values, 'sourceProp');
        this._ttlProp = _.get(values, 'ttlProp');
        this._destProp = _.get(values, 'destProp');

        if (!_.isString(this._srcProp)){
            throw new EsMiddlewareError(EsSetApiDataMiddleware.name, 'sourceProp MUST be string');
        }

        if (!_.isUndefined(this._ttlProp) && !_.isString(this._ttlProp)){
            throw new EsMiddlewareError(EsSetApiDataMiddleware.name, 'ttlProp MUST be string');
        }

        if (!_.isUndefined(this._destProp) && !_.isString(this._destProp)){
            throw new EsMiddlewareError(EsSetApiDataMiddleware.name, 'destProp MUST be string');
        }
    }

    async loadAsync() { }

    async runInternal(context: IEsContext) {
        const prop = _.get(context.properties, this._srcProp);
        let ttl = undefined;
        if (!_.isUndefined(this._ttlProp)) {
            const ttlVal = _.get(context.properties, this._ttlProp);

            if (_.isInteger(ttlVal) && ttlVal > 0) {
                ttl = ttlVal;
            }
        }

        const dest = _.get(context.properties, this._destProp);

        if (!_.isString(dest)) {
            throw new EsMiddlewareError(EsSetApiDataMiddleware.name, `Destination (prop ${this._destProp}) MUST be string`);
        }

        const realDest = `esgateway/runtime/${configuration.env}/apis/${context.meta.api}/store/${dest}`;

        const etcdClient = getEtcdClient();

        if (ttl !== undefined) {
            const lease = etcdClient.lease(ttl, { autoKeepAlive: false });
            await lease.put(realDest).value(JSON.stringify(prop));
        }
        else {
            await etcdClient.put(realDest).value(JSON.stringify(prop));
        }
    }
}

export const MiddlewareCtor: IEsMiddlewareConstructor = EsSetApiDataMiddleware;

export const MiddlewareSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/EsSetApiDataMiddleware",
    "title": "SetApiData Middleware",
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
        "ttlProp": {
            "type": "string",
            "minLength": 1
        },
        "destProp": {
            "type": "string",
            "minLength": 1
        }
    }
};
