import { IEsMiddleware, EsMiddleware, IEsContext, IEsMiddlewareConstructor, createMiddleware } from '../core';
import _ from 'lodash';
import { EsMiddlewareError } from '../core/errors';
import { JWS, JWK } from 'jose';

export class EsJwsVerifyMiddleware extends EsMiddleware {
    static readonly isInOut = true;
    static readonly middlewareName = 'EsJwsVerifyMiddleware';
    static readonly meta = { middleware: EsJwsVerifyMiddleware.middlewareName };

    private _payloadProp: string;
    private _keyProp: string;
    private _algProp: string;
    private _useProp?: string;
    private _othOptsProp?: string;
    private _verifyOptsProp?: string;
    private _destProp: string;

    /**
     * Constrói o middleware a partir dos parâmetros
     */
    constructor(values: any, after: boolean, api:string, nextMiddleware?: IEsMiddleware) {
        super(after, api, nextMiddleware);

        this._payloadProp = _.get(values, 'payloadProp', 'jwsGenerated');
        this._keyProp = _.get(values, 'keyProp', 'jwsKey');
        this._algProp = _.get(values, 'algProp', 'jwsAlg');
        this._useProp = _.get(values, 'useProp');
        this._destProp = _.get(values, 'destProp', 'jwsVerified');
        this._othOptsProp = _.get(values, 'othOptsProp');
        this._verifyOptsProp = _.get(values, 'verifyOptsProp');


        if (!_.isString(this._payloadProp)) {
            throw new EsMiddlewareError(EsJwsVerifyMiddleware.name, 'payloadProp MUST be String');
        }
        if (!_.isString(this._keyProp)) {
            throw new EsMiddlewareError(EsJwsVerifyMiddleware.name, 'keyProp MUST be String');
        }
        if (!_.isString(this._algProp)) {
            throw new EsMiddlewareError(EsJwsVerifyMiddleware.name, 'algProp MUST be String');
        }
        if (!_.isUndefined(this._useProp) && !_.isString(this._useProp)) {
            throw new EsMiddlewareError(EsJwsVerifyMiddleware.name, 'useProp MUST be String');
        }
        if (!_.isUndefined(this._othOptsProp) && !_.isString(this._othOptsProp)) {
            throw new EsMiddlewareError(EsJwsVerifyMiddleware.name, 'othOptsProp MUST be String');
        }
        if (!_.isUndefined(this._verifyOptsProp) && !_.isString(this._verifyOptsProp)) {
            throw new EsMiddlewareError(EsJwsVerifyMiddleware.name, 'verifyOptsProp MUST be String');
        }
        if (!_.isString(this._destProp)) {
            throw new EsMiddlewareError(EsJwsVerifyMiddleware.name, 'destProp MUST be String');
        }
    }

    async loadAsync() { }

    async runInternal(context: IEsContext) {
        const payload = _.get(context.properties, this._payloadProp);
        const key = _.get(context.properties, this._keyProp, JWK.None);
        if (!_.isString(key) && !_.isObjectLike(key)) {
            throw new EsMiddlewareError(EsJwsVerifyMiddleware.name, 'key MUST be string or object');
        }
        const alg = _.get(context.properties, this._algProp);
        if (key !== JWK.None && !_.isString(alg)) {
            throw new EsMiddlewareError(EsJwsVerifyMiddleware.name, 'alg MUST be string');
        }
        let opts:any = { alg };
        if (!_.isUndefined(this._useProp)) {
            const use = _.get(context.properties, this._useProp);
            if (!_.isUndefined(use) && !_.isString(use)) {
                throw new EsMiddlewareError(EsJwsVerifyMiddleware.name, 'use MUST be string');
            }
            opts.use = use;
        }
        if (!_.isUndefined(this._othOptsProp)) {
            const othOpts = _.get(context.properties, this._othOptsProp);
            if (_.isObjectLike(othOpts)) {
                opts = _.merge({}, othOpts, opts);
            }
        }
        const jwk = key === JWK.None ? key : JWK.asKey(key, opts);

        let verifyOpts = {
            algorithms: ['HS256']
        };

        if (!_.isUndefined(this._verifyOptsProp)) {
            const vOpts = _.get(context.properties, this._verifyOptsProp, {});
            if (_.isObjectLike(vOpts)) {
                _.merge(verifyOpts, vOpts);
            }
        }

        try {
            const res = JWS.verify(payload, jwk, verifyOpts);
            _.set(context.properties, this._destProp, res);
        }
        catch (err) {
            throw new EsMiddlewareError(EsJwsVerifyMiddleware.name, 'Error verifying JWS', err);
        }
    }
};

export const MiddlewareCtor: IEsMiddlewareConstructor = EsJwsVerifyMiddleware;

export const MiddlewareSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/EsJwsVerifyMiddleware",
    "title": "JwsVerify Middleware",
    "type": "object",
    "additionalProperties": false,
    "required": [
        "keyProp",
        "algProp"
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
        "useProp": {
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
