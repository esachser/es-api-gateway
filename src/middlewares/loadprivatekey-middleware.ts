import { IEsMiddleware, EsMiddleware, IEsContext, IEsMiddlewareConstructor, createMiddleware } from '../core';
import _ from 'lodash';
import { EsMiddlewareError } from '../core/errors';
import { getPrivateKey } from '../util/certs';

export class EsLoadPrivateKeyMiddleware extends EsMiddleware {
    static readonly isInOut = true;
    static readonly middlewareName = 'EsLoadPrivateKeyMiddleware';
    static readonly meta = { middleware: EsLoadPrivateKeyMiddleware.middlewareName };

    private _keyFile: string;
    private _keyPassProp: string;
    private _destProp: string;

    /**
     * Constrói o middleware a partir dos parâmetros
     */
    constructor(values: any, after: boolean, nextMiddleware?: IEsMiddleware) {
        super(after, nextMiddleware);

        this._keyFile = _.get(values, 'keyFile', 'server.key');
        this._keyPassProp = _.get(values, 'keyPassProp', 'keypass');
        this._destProp = _.get(values, 'destProp', 'privateKey');

        if (!_.isString(this._keyFile)) {
            throw new EsMiddlewareError(EsLoadPrivateKeyMiddleware.name, 'keyFile MUST be String');
        }
        if (!_.isString(this._keyPassProp)) {
            throw new EsMiddlewareError(EsLoadPrivateKeyMiddleware.name, 'keyPassProp MUST be String');
        }
        if (!_.isString(this._destProp)) {
            throw new EsMiddlewareError(EsLoadPrivateKeyMiddleware.name, 'destProp MUST be String');
        }
    }

    async loadAsync() { }

    async runInternal(context: IEsContext) {
        const pass = _.get(context.properties, this._keyPassProp);
        if (!_.isString(pass) && !_.isUndefined(pass)) {
            throw new EsMiddlewareError(EsLoadPrivateKeyMiddleware.name, 'The key password MUST be string or undefined');
        }

        const clientKey = await getPrivateKey(context.meta.api, this._keyFile, pass);

        _.set(context.properties, this._destProp, clientKey);
    }
};

export const MiddlewareCtor: IEsMiddlewareConstructor = EsLoadPrivateKeyMiddleware;

export const MiddlewareSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/EsLoadPrivateKeyMiddleware",
    "title": "LoadPrivateKey Middleware",
    "type": "object",
    "additionalProperties": false,
    "required": [
        "keyFile",
        "keyPassProp"
    ],
    "properties": {
        "keyFile": {
            "type": "string",
            "minLength": 1
        },
        "keyPassProp": {
            "type": "string",
            "minLength": 1
        },
        "destProp": {
            "type": "string",
            "minLength": 1
        }
    }
};
