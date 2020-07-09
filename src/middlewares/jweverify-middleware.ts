import { IEsMiddleware, EsMiddleware, IEsContext, IEsMiddlewareConstructor, createMiddleware } from '../core';
import _ from 'lodash';
import { EsMiddlewareError } from '../core/errors';
import { JWE, JWK } from 'jose';
import { logger } from '../util/logger';

export class EsJweVerifyMiddleware extends EsMiddleware {
    static readonly isInOut = true;
    static readonly middlewareName = 'EsJweVerifyMiddleware';
    static readonly meta = { middleware: EsJweVerifyMiddleware.middlewareName };

    private _payloadProp: string;
    private _keyProp: string;
    private _algProp: string;
    private _encProp: string;
    private _othOptsProp?: string;
    private _decryptOptsProp?: string;
    private _destProp: string;

    /**
     * Constrói o middleware a partir dos parâmetros
     */
    constructor(values: any, after: boolean, nextMiddleware?: IEsMiddleware) {
        super(after, nextMiddleware);

        this._payloadProp = _.get(values, 'payloadProp', 'jwsGenerated');
        this._keyProp = _.get(values, 'keyProp', 'jwsKey');
        this._algProp = _.get(values, 'algProp', 'jwsAlg');
        this._encProp = _.get(values, 'useProp');
        this._destProp = _.get(values, 'destProp', 'jwsVerified');
        this._othOptsProp = _.get(values, 'othOptsProp');
        this._decryptOptsProp = _.get(values, 'decryptOptsProp');


        if (!_.isString(this._payloadProp)) {
            throw new EsMiddlewareError(EsJweVerifyMiddleware.name, 'payloadProp MUST be String');
        }
        if (!_.isString(this._keyProp)) {
            throw new EsMiddlewareError(EsJweVerifyMiddleware.name, 'keyProp MUST be String');
        }
        if (!_.isString(this._algProp)) {
            throw new EsMiddlewareError(EsJweVerifyMiddleware.name, 'algProp MUST be String');
        }
        if (!_.isUndefined(this._encProp) && !_.isString(this._encProp)) {
            throw new EsMiddlewareError(EsJweVerifyMiddleware.name, 'encProp MUST be String');
        }
        if (!_.isUndefined(this._othOptsProp) && !_.isString(this._othOptsProp)) {
            throw new EsMiddlewareError(EsJweVerifyMiddleware.name, 'othOptsProp MUST be String');
        }
        if (!_.isUndefined(this._decryptOptsProp) && !_.isString(this._decryptOptsProp)) {
            throw new EsMiddlewareError(EsJweVerifyMiddleware.name, 'decryptOptsProp MUST be String');
        }
        if (!_.isString(this._destProp)) {
            throw new EsMiddlewareError(EsJweVerifyMiddleware.name, 'destProp MUST be String');
        }
    }

    async loadAsync() { }

    async runInternal(context: IEsContext) {
        const payload = _.get(context.properties, this._payloadProp);
        const key = _.get(context.properties, this._keyProp, JWK.None);
        if (!_.isString(key) && !_.isObjectLike(key)) {
            throw new EsMiddlewareError(EsJweVerifyMiddleware.name, 'key MUST be string or object');
        }
        const alg = _.get(context.properties, this._algProp);
        if (!_.isUndefined(alg) && !_.isString(alg)) {
            throw new EsMiddlewareError(EsJweVerifyMiddleware.name, 'alg MUST be string');
        }
        const enc = _.get(context.properties, this._encProp);
        if (!_.isUndefined(enc) && !_.isString(enc)) {
            throw new EsMiddlewareError(EsJweVerifyMiddleware.name, 'enc MUST be string');
        }
        let opts:any = { alg, enc };
        if (!_.isUndefined(this._othOptsProp)) {
            const othOpts = _.get(context.properties, this._othOptsProp);
            if (_.isObjectLike(othOpts)) {
                opts = _.merge({}, othOpts, opts);
            }
        }
        const jwk = JWK.asKey(key);

        let decryptOpts = {};

        if (!_.isUndefined(this._decryptOptsProp)) {
            const vOpts = _.get(context.properties, this._decryptOptsProp, {});
            if (_.isObjectLike(vOpts)) {
                _.merge(decryptOpts, vOpts);
            }
        }

        try {
            const res = JWE.decrypt(payload, jwk, decryptOpts);
            _.set(context.properties, this._destProp, res);
        }
        catch (err) {
            throw new EsMiddlewareError(EsJweVerifyMiddleware.name, 'Error verifying JWE', err);
        }
    }
};

export const MiddlewareCtor: IEsMiddlewareConstructor = EsJweVerifyMiddleware;

export const MiddlewareSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/EsJweVerifyMiddleware",
    "title": "JweVerify Middleware",
    "type": "object",
    "additionalProperties": false,
    "required": [
        "keyProp",
        "algProp",
        "encProp"
    ],
    "properties": {
        "payloadProp": {
            "type": "string",
            "minLength": 1
        },
        "keyProp": {
            "type": "string",
            "minLength": 1
        },
        "algProp": {
            "type": "string",
            "minLength": 1
        },
        "encProp": {
            "type": "string",
            "minLength": 1
        },
        "othOptsProp": {
            "type": "string",
            "minLength": 1
        },
        "destProp": {
            "type": "string",
            "minLength": 1
        },
        "verifyOptsProp": {
            "type": "string",
            "minLength": 1
        }
    }
};
