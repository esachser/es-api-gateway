import { IEsMiddleware, EsMiddleware, IEsContext, IEsMiddlewareConstructor, createMiddleware } from '../core';
import _ from 'lodash';
import { EsMiddlewareError } from '../core/errors';
import { JWS, JWK } from 'jose';

export class EsJwsGenerateMiddleware extends EsMiddleware {
    static readonly isInOut = true;
    static readonly middlewareName = 'EsJwsGenerateMiddleware';
    static readonly meta = { middleware: EsJwsGenerateMiddleware.middlewareName };

    private _payloadProp: string;
    private _keyProp: string;
    private _algProp: string;
    private _useProp?: string;
    private _othOptsProp?: string;
    private _destProp: string;

    /**
     * Constrói o middleware a partir dos parâmetros
     */
    constructor(values: any, after: boolean, nextMiddleware?: IEsMiddleware) {
        super(after, nextMiddleware);

        this._payloadProp = _.get(values, 'payloadProp', 'jwsPayload');
        this._keyProp = _.get(values, 'keyProp', 'jwsKey');
        this._algProp = _.get(values, 'algProp', 'jwsAlg');
        this._useProp = _.get(values, 'useProp');
        this._destProp = _.get(values, 'destProp', 'jwsGenerated');
        this._othOptsProp = _.get(values, 'othOptsProp');


        if (!_.isString(this._payloadProp)) {
            throw new EsMiddlewareError(EsJwsGenerateMiddleware.name, 'payloadProp MUST be String');
        }
        if (!_.isString(this._keyProp)) {
            throw new EsMiddlewareError(EsJwsGenerateMiddleware.name, 'keyProp MUST be String');
        }
        if (!_.isString(this._algProp)) {
            throw new EsMiddlewareError(EsJwsGenerateMiddleware.name, 'algProp MUST be String');
        }
        if (!_.isUndefined(this._useProp) && !_.isString(this._useProp)) {
            throw new EsMiddlewareError(EsJwsGenerateMiddleware.name, 'useProp MUST be String');
        }
        if (!_.isUndefined(this._othOptsProp) && !_.isString(this._othOptsProp)) {
            throw new EsMiddlewareError(EsJwsGenerateMiddleware.name, 'othOptsProp MUST be String');
        }
        if (!_.isString(this._destProp)) {
            throw new EsMiddlewareError(EsJwsGenerateMiddleware.name, 'destProp MUST be String');
        }
    }

    async loadAsync() { }

    async runInternal(context: IEsContext) {
        const payload = _.get(context.properties, this._payloadProp);
        const key = _.get(context.properties, this._keyProp, JWK.None);
        if (!_.isString(key) && !_.isObjectLike(key)) {
            throw new EsMiddlewareError(EsJwsGenerateMiddleware.name, 'key MUST be string or object');
        }
        const alg = _.get(context.properties, this._algProp);
        if (key !== JWK.None && !_.isString(alg)) {
            throw new EsMiddlewareError(EsJwsGenerateMiddleware.name, 'alg MUST be string');
        }
        let opts:any = { alg };
        if (!_.isUndefined(this._useProp)) {
            const use = _.get(context.properties, this._useProp);
            if (!_.isUndefined(use) && !_.isString(use)) {
                throw new EsMiddlewareError(EsJwsGenerateMiddleware.name, 'use MUST be string');
            }
            opts.use = use;
        }
        if (!_.isUndefined(this._othOptsProp)) {
            const othOpts = _.get(context.properties, this._othOptsProp);
            if (_.isObjectLike(othOpts)) {
                opts = _.merge({}, othOpts, opts);
            }
        }
        const jwsStr = JWS.sign(payload, key === JWK.None ? key : JWK.asKey(key, opts));
        _.set(context.properties, this._destProp, jwsStr);
    }
};

export const MiddlewareCtor: IEsMiddlewareConstructor = EsJwsGenerateMiddleware;

export const MiddlewareSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/EsJwsGenerateMiddleware",
    "title": "JwsGenerate Middleware",
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
        }
    }
};
