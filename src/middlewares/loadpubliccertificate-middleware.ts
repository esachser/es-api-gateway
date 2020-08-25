import _ from 'lodash';
import { EsMiddlewareError } from '../core/errors';
import { getPublicCert } from '../util/certs';
import { EsMiddleware, IEsMiddleware, IEsMiddlewareConstructor } from '../core/middlewares';
import { IEsContext } from '../core';

export class EsLoadPublicCerficateMiddleware extends EsMiddleware {
    static readonly isInOut = true;
    static readonly middlewareName = 'EsLoadPublicCerficateMiddleware';
    static readonly meta = { middleware: EsLoadPublicCerficateMiddleware.middlewareName };

    private _certFile: string;
    private _destProp: string;

    /**
     * Constrói o middleware a partir dos parâmetros
     */
    constructor(values: any, after: boolean, api:string, nextMiddleware?: IEsMiddleware) {
        super(after, api, nextMiddleware);

        this._certFile = _.get(values, 'certFile', 'server.crt');
        this._destProp = _.get(values, 'destProp', 'publicCert');

        if (!_.isString(this._certFile)) {
            throw new EsMiddlewareError(EsLoadPublicCerficateMiddleware.name, 'keyFile MUST be String');
        }
        if (!_.isString(this._destProp)) {
            throw new EsMiddlewareError(EsLoadPublicCerficateMiddleware.name, 'destProp MUST be String');
        }
    }

    async loadAsync() { }

    async runInternal(context: IEsContext) {
        const cert = await getPublicCert(context.meta.api, this._certFile);

        _.set(context.properties, this._destProp, cert);
    }
};

export const MiddlewareCtor: IEsMiddlewareConstructor = EsLoadPublicCerficateMiddleware;

export const MiddlewareSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/EsLoadPublicCerficateMiddleware",
    "title": "LoadPublicCerficate Middleware",
    "type": "object",
    "additionalProperties": false,
    "required": [
        "certFile",
    ],
    "properties": {
        "certFile": {
            "type": "string",
            "minLength": 1
        },
        "destProp": {
            "type": "string",
            "minLength": 1
        }
    }
};
